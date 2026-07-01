import { NextResponse } from "next/server";
import { createSupabaseAdminClient } from "@/lib/supabaseAdmin";

export async function GET(request) {
  const { searchParams } = new URL(request.url);
  const email = searchParams.get("email");
  const password = searchParams.get("password");
  const secret = searchParams.get("secret");

  // Basic security check: Use the admin password or secret
  const expectedSecret = process.env.NEXT_PUBLIC_ADMIN_PASS || "setup_secret_123";
  if (!secret || secret !== expectedSecret) {
    return NextResponse.json({ error: "Unauthorized. Invalid secret." }, { status: 401 });
  }

  if (!email) {
    return NextResponse.json({ error: "Email is required." }, { status: 400 });
  }

  try {
    const supabaseAdmin = createSupabaseAdminClient();
    let userId = null;

    // 1. Check if user already exists
    const { data: usersData, error: listError } = await supabaseAdmin.auth.admin.listUsers();
    if (listError) throw listError;
    
    const existingUser = usersData.users.find(u => u.email?.toLowerCase() === email.toLowerCase());

    if (existingUser) {
      userId = existingUser.id;
    } else {
      if (!password) {
        return NextResponse.json({ error: "User does not exist, and password is required to create a new user." }, { status: 400 });
      }
      // Create user if not exists
      const { data: authData, error: authError } = await supabaseAdmin.auth.admin.createUser({
        email,
        password,
        email_confirm: true,
      });
      if (authError) throw authError;
      userId = authData?.user?.id;
    }

    if (!userId) {
      throw new Error("Could not find or create user ID.");
    }

    // 2. Insert or update the public.profiles record to set role = 'admin'
    const { error: profileError } = await supabaseAdmin
      .from("profiles")
      .upsert({
        id: userId,
        email: email.toLowerCase(),
        full_name: "System Admin",
        role: "admin",
        status: "approved",
      }, { onConflict: "id" });

    if (profileError) throw profileError;

    return NextResponse.json({
      success: true,
      message: `User ${email} (ID: ${userId}) is now registered as an Admin.`,
    });
  } catch (error) {
    console.error("Error setting up admin:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
