import { NextResponse } from "next/server";
import { createSupabaseAdminClient } from "@/lib/supabaseAdmin";

export async function POST(request) {
  try {
    const { email } = await request.json();

    if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      return NextResponse.json({ error: "Please enter a valid email address." }, { status: 400 });
    }

    const supabase = createSupabaseAdminClient();

    // Verify the email exists in profiles table
    const { data: profile, error: profileErr } = await supabase
      .from("profiles")
      .select("id")
      .ilike("email", email.trim())
      .maybeSingle();

    if (profileErr || !profile) {
      return NextResponse.json({ error: "No account registered with this email address." }, { status: 404 });
    }

    // Call Supabase to send password reset email
    const { error: resetErr } = await supabase.auth.resetPasswordForEmail(email.trim().toLowerCase(), {
      redirectTo: `${new URL(request.url).origin}/expert-reset-password`,
    });

    if (resetErr) {
      console.error("Supabase resetPasswordForEmail error:", resetErr);
      return NextResponse.json({ error: resetErr.message || "Failed to send reset email." }, { status: 500 });
    }

    return NextResponse.json({ success: true }, { status: 200 });
  } catch (error) {
    console.error("Expert forgot-password error:", error.message);
    return NextResponse.json(
      { error: "Failed to send password reset email. Please try again." },
      { status: 500 }
    );
  }
}
