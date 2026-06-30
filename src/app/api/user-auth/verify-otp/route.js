import { NextResponse } from "next/server";
import { createSupabaseAdminClient } from "@/lib/supabaseAdmin";

const normalizeEmail = (email = "") => email.trim().toLowerCase();
const normalizePhone = (phone = "") => phone.trim();

export async function POST(request) {
  try {
    const { email, otp, name, phone } = await request.json();
    const normalizedEmail = normalizeEmail(email);
    const normalizedPhone = normalizePhone(phone);

    if (!normalizedEmail || !/\S+@\S+\.\S+/.test(normalizedEmail)) {
      return NextResponse.json({ error: "Valid email is required" }, { status: 400 });
    }

    if (!name?.trim()) {
      return NextResponse.json({ error: "Name is required" }, { status: 400 });
    }

    if (!normalizedPhone) {
      return NextResponse.json({ error: "Mobile number is required" }, { status: 400 });
    }

    if (!otp?.trim()) {
      return NextResponse.json({ error: "OTP is required" }, { status: 400 });
    }

    const supabase = createSupabaseAdminClient();
    const { data: otpDoc, error: fetchError } = await supabase
      .from("otps")
      .select("*")
      .eq("email", normalizedEmail)
      .maybeSingle();

    if (fetchError || !otpDoc) {
      return NextResponse.json({ error: "OTP not found or expired" }, { status: 400 });
    }

    if (otpDoc.otp !== otp.trim() || otpDoc.expiry < Date.now()) {
      return NextResponse.json({ error: "Invalid or expired OTP" }, { status: 400 });
    }

    await supabase.from("otps").delete().eq("email", normalizedEmail);
    const { data, error } = await supabase
      .from("profiles")
      .upsert(
        {
          email: normalizedEmail,
          name: name.trim(),
          phone: normalizedPhone,
          email_verified: true,
          last_login_at: new Date().toISOString(),
        },
        { onConflict: "email" }
      )
      .select("id, email, name, phone, email_verified, created_at, updated_at, last_login_at")
      .single();

    if (error) {
      console.error("Supabase user upsert failed:", error);
      return NextResponse.json({ error: error.message || "Failed to save user" }, { status: 500 });
    }

    return NextResponse.json({ success: true, user: data }, { status: 200 });
  } catch (error) {
    console.error("User OTP verification failed:", error.message);
    return NextResponse.json({ error: error.message || "Verification failed" }, { status: 500 });
  }
}
