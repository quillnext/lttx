import { sendApprovalNotificationEmail } from "@/app/utils/sendApprovalNotificationEmail";
import { createSupabaseAdminClient } from "@/lib/supabaseAdmin";
import { NextResponse } from "next/server";

function generatePassword(length = 12) {
  const charset = "abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789!@#$%^&*()_+";
  let password = "";
  for (let i = 0; i < length; i++) {
    password += charset[Math.floor(Math.random() * charset.length)];
  }
  return password;
}

export async function POST(request) {
  try {
    const { uid, email, phone, fullName, secret } = await request.json();

    if (secret !== process.env.NEXT_PUBLIC_ADMIN_PASS) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    if (!uid || !email || !phone) {
      return NextResponse.json({ error: "Missing required identity fields." }, { status: 400 });
    }

    const supabase = createSupabaseAdminClient();
    const targetEmail = email.trim().toLowerCase();
    const targetPhone = phone.trim().startsWith("+") ? phone.trim() : `+${phone.trim()}`;

    // Verify duplicate email
    const { data: emailProfile } = await supabase
      .from("profiles")
      .select("id, email, phone")
      .eq("email", targetEmail)
      .maybeSingle();

    if (emailProfile && emailProfile.id !== uid) {
      return NextResponse.json({ error: "Email address is already linked to another profile." }, { status: 400 });
    }

    // Verify duplicate phone
    const { data: phoneProfile } = await supabase
      .from("profiles")
      .select("id, email, phone")
      .eq("phone", targetPhone)
      .maybeSingle();

    if (phoneProfile && phoneProfile.id !== uid) {
      return NextResponse.json({ error: "Mobile number is already linked to another profile." }, { status: 400 });
    }

    const password = generatePassword();

    const { data: authData, error: authError } = await supabase.auth.admin.createUser({
      email,
      password,
      email_confirm: false,
      phone: phone.startsWith("+") ? phone : `+${phone}`,
      user_metadata: {
        name: fullName,
        phone,
        role: "expert",
      },
    });

    if (authError && !authError.message?.toLowerCase().includes("already registered")) {
      throw authError;
    }

    const { data: profile, error: profileFetchError } = await supabase
      .from("profiles")
      .select("*")
      .eq("id", uid)
      .single();

    if (profileFetchError) throw profileFetchError;

    const { error: updateError } = await supabase
      .from("profiles")
      .update({
        email,
        phone,
        is_handed_over: true,
        force_password_change: true,
        user_id: authData?.user?.id || profile.user_id || null,
        approval_timestamp: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      })
      .eq("id", uid);

    if (updateError) throw updateError;

    const slug = (profile.username || fullName).toLowerCase().replace(/\s+/g, "-");
    await sendApprovalNotificationEmail({
      fullName,
      email,
      slug,
      generatedReferralCode: profile.generated_referral_code || "N/A",
      username: profile.username || email,
      password,
    });

    return NextResponse.json({ success: true, message: "Registry handover complete." });
  } catch (error) {
    console.error("Handover Error:", error);
    return NextResponse.json({ error: error.message || "Handover failed" }, { status: 500 });
  }
}
