import { NextResponse } from "next/server";
import { createSupabaseAdminClient } from "@/lib/supabaseAdmin";
import { sendWhatsAppOTP } from "@/lib/aisensy";

export async function POST(request) {
  try {
    const { email, name, phone } = await request.json();

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

    // Generate login OTP and verification link via Supabase Auth Admin
    const { data, error } = await supabase.auth.admin.generateLink({
      type: "magiclink",
      email: email.trim().toLowerCase(),
      options: {
        data: {
          name: name.trim(),
          phone: phone.trim(),
        },
      },
    });

    if (error) {
      console.error("Supabase generateLink error:", error);
      return NextResponse.json({ error: error.message || "Failed to generate OTP link" }, { status: 500 });
    }

    const { email_otp, verification_type } = data.properties;

    // Send the OTP via WhatsApp using Aisensy
    const waResponse = await sendWhatsAppOTP({
      phone: phone.trim(),
      userName: name.trim(),
      otp: email_otp,
    });

    if (!waResponse.success) {
      console.error("Aisensy send error:", waResponse.error);
      return NextResponse.json({ error: waResponse.error || "Failed to send WhatsApp message" }, { status: 500 });
    }

    return NextResponse.json({
      success: true,
      verificationType: verification_type,
    }, { status: 200 });
  } catch (error) {
    console.error("Error in send-whatsapp-otp API:", error.message);
    return NextResponse.json({ error: error.message || "Internal server error" }, { status: 500 });
  }
}
