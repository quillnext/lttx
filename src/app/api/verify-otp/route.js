import { NextResponse } from "next/server";
import { createSupabaseAdminClient } from "@/lib/supabaseAdmin";

const normalizeEmail = (email = "") => email.trim().toLowerCase();
const normalizePhone = (phone = "") => phone.trim();

export async function POST(request) {
  try {
    const { email, otp, name, phone, role } = await request.json();
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

    // Verify duplicate email
    const { data: emailProfile } = await supabase
      .from("profiles")
      .select("id, email, phone, role")
      .eq("email", normalizedEmail)
      .maybeSingle();

    if (emailProfile && emailProfile.phone && emailProfile.phone !== normalizedPhone) {
      return NextResponse.json({ error: "Email address is already linked with another phone number." }, { status: 400 });
    }

    // Verify duplicate phone
    const { data: phoneProfile } = await supabase
      .from("profiles")
      .select("id, email, phone, role")
      .eq("phone", normalizedPhone)
      .maybeSingle();

    if (phoneProfile && phoneProfile.email.toLowerCase() !== normalizedEmail) {
      return NextResponse.json({ error: "Mobile number is already linked with another email address." }, { status: 400 });
    }

    // Prevent changing role if profile exists
    const existingProfile = emailProfile || phoneProfile;
    if (existingProfile && existingProfile.role !== role) {
      return NextResponse.json({ error: `This account is already registered as an ${existingProfile.role}. You cannot login/register as a ${role}.` }, { status: 400 });
    }

    // Fetch OTP row from Supabase
    const { data: otpRow, error: otpFetchErr } = await supabase
      .from("otps")
      .select("*")
      .eq("email", normalizedEmail)
      .single();

    if (otpFetchErr || !otpRow) {
      return NextResponse.json({ error: "OTP not found or expired" }, { status: 400 });
    }

    if (otpRow.otp !== otp.trim() || otpRow.expiry < Date.now()) {
      return NextResponse.json({ error: "Invalid or expired OTP" }, { status: 400 });
    }

    // Delete OTP from DB
    await supabase.from("otps").delete().eq("email", normalizedEmail);

    // Generate a real magiclink login token from Supabase Auth Admin
    const { data: linkData, error: linkErr } = await supabase.auth.admin.generateLink({
      type: "magiclink",
      email: normalizedEmail,
      options: {
        data: {
          name: name.trim(),
          phone: normalizedPhone,
          role: role || "user",
        },
      },
    });

    if (linkErr) {
      console.error("Supabase generateLink error in verification:", linkErr);
      return NextResponse.json({ error: linkErr.message || "Failed to generate session token" }, { status: 500 });
    }

    // Update user's phone inside auth.users table
    if (linkData?.user?.id && normalizedPhone) {
      try {
        await supabase.auth.admin.updateUserById(linkData.user.id, {
          phone: normalizedPhone,
          phone_confirm: true,
        });
      } catch (phoneErr) {
        console.error("Failed to update phone in auth.users:", phoneErr);
      }
    }

    return NextResponse.json({
      success: true,
      supabaseToken: linkData.properties.email_otp,
      verificationType: linkData.properties.verification_type,
    }, { status: 200 });
  } catch (error) {
    console.error("User OTP verification failed:", error.message);
    return NextResponse.json({ error: error.message || "Verification failed" }, { status: 500 });
  }
}