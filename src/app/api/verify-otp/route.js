
import { NextResponse } from "next/server";
import { createSupabaseAdminClient } from "../../../lib/supabaseAdmin"; 

export async function POST(request) {
  try {
    const { email, otp } = await request.json();
    if (!email || !otp) {
      return NextResponse.json({ verified: false, error: "Missing email or OTP" }, { status: 400 });
    }

    const normalizedEmail = email.trim().toLowerCase();

    const supabase = createSupabaseAdminClient();
    const { data: doc, error: fetchError } = await supabase
      .from("otps")
      .select("*")
      .eq("email", normalizedEmail)
      .maybeSingle();

    if (fetchError || !doc) {
      return NextResponse.json({ verified: false, error: "OTP not found or expired" }, { status: 400 });
    }

    if (doc.otp !== otp || doc.expiry < Date.now()) {
      return NextResponse.json({ verified: false, error: "Invalid or expired OTP" }, { status: 400 });
    }

    await supabase.from("otps").delete().eq("email", normalizedEmail);

    return NextResponse.json({ verified: true }, { status: 200 });
  } catch (error) {
    console.error("Error verifying OTP:", error.message);
    return NextResponse.json({ verified: false, error: "Verification failed" }, { status: 500 });
  }
}