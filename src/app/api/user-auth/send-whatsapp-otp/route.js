import { NextResponse } from "next/server";
import { createSupabaseAdminClient } from "@/lib/supabaseAdmin";
import { sendWhatsAppOTP } from "@/lib/aisensy";

export async function POST(request) {
  try {
    const { email, name, phone, role } = await request.json();

    if (!email || !/\S+@\S+\.\S+/.test(email)) {
      return NextResponse.json({ error: "Valid email is required" }, { status: 400 });
    }
    if (!name?.trim()) {
      return NextResponse.json({ error: "Name is required" }, { status: 400 });
    }
    if (!phone?.trim()) {
      return NextResponse.json({ error: "Mobile number is required" }, { status: 400 });
    }

    const supabase = createSupabaseAdminClient();
    const targetEmail = email.trim().toLowerCase();
    const targetPhone = phone.trim();

    // Verify duplicate email
    const { data: emailProfile } = await supabase
      .from("profiles")
      .select("id, email, phone, role")
      .eq("email", targetEmail)
      .maybeSingle();

    if (emailProfile && emailProfile.phone !== targetPhone) {
      return NextResponse.json({ error: "Email address is already linked with another phone number." }, { status: 400 });
    }

    // Verify duplicate phone
    const { data: phoneProfile } = await supabase
      .from("profiles")
      .select("id, email, phone, role")
      .eq("phone", targetPhone)
      .maybeSingle();

    if (phoneProfile && phoneProfile.email.toLowerCase() !== targetEmail) {
      return NextResponse.json({ error: "Mobile number is already linked with another email address." }, { status: 400 });
    }

    // Prevent changing role if profile exists
    const existingProfile = emailProfile || phoneProfile;
    if (existingProfile && existingProfile.role !== role) {
      return NextResponse.json({ error: `This account is already registered as an ${existingProfile.role}. You cannot login/register as a ${role}.` }, { status: 400 });
    }

    // Generate 6-digit OTP
    const otp = Math.floor(100000 + Math.random() * 900000).toString();
    const expiry = Date.now() + 5 * 60 * 1000; // 5 minutes expiry

    // Save in otps table
    const { error: otpError } = await supabase
      .from("otps")
      .upsert({
        email: email.trim().toLowerCase(),
        otp,
        expiry,
        created_at: new Date().toISOString(),
      });

    if (otpError) {
      console.error("Supabase OTP store error:", otpError);
      return NextResponse.json({ error: otpError.message || "Failed to store OTP" }, { status: 500 });
    }

    // Send the 6-digit OTP via WhatsApp using Aisensy
    const waResponse = await sendWhatsAppOTP({
      phone: phone.trim(),
      userName: name.trim(),
      otp: otp,
    });

    if (!waResponse.success) {
      console.error("Aisensy send error:", waResponse.error);
      return NextResponse.json({ error: waResponse.error || "Failed to send WhatsApp message" }, { status: 500 });
    }

    return NextResponse.json({
      success: true,
      verificationType: "whatsapp_custom",
    }, { status: 200 });
  } catch (error) {
    console.error("Error in send-whatsapp-otp API:", error.message);
    return NextResponse.json({ error: error.message || "Internal server error" }, { status: 500 });
  }
}
