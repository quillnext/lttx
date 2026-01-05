
import { adminAuth, adminDb } from "@/lib/firebaseAdmin";
import { sendApprovalNotificationEmail } from "@/app/utils/sendApprovalNotificationEmail";
import { NextResponse } from "next/server";

// Generate a secure random password
function generatePassword(length = 12) {
  const charset = "abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789!@#$%^&*()_+";
  let password = "";
  for (let i = 0; i < length; i++) {
    const randomIndex = Math.floor(Math.random() * charset.length);
    password += charset[randomIndex];
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

    // 1. Create Auth User with same UID
    const password = generatePassword();
    let userRecord;
    try {
        userRecord = await adminAuth.createUser({
            uid,
            email,
            phoneNumber: phone.startsWith('+') ? phone : `+${phone}`,
            password,
            displayName: fullName,
            emailVerified: false,
            disabled: false
        });
    } catch (e) {
        if (e.code === 'auth/uid-already-exists') {
            return NextResponse.json({ error: "Registry record already linked to an authentication identity." }, { status: 409 });
        }
        throw e;
    }

    // 2. Update Firestore Record
    const profileRef = adminDb.collection("Profiles").doc(uid);
    const docSnap = await profileRef.get();
    const profileData = docSnap.data();

    await profileRef.update({
        email,
        phone,
        isHandedOver: true,
        forcePasswordChange: true,
        authHandoverTimestamp: new Date().toISOString()
    });

    // 3. Send Notification/Activation Email
    const slug = (profileData?.username || fullName).toLowerCase().replace(/\s+/g, "-");
    await sendApprovalNotificationEmail({
      fullName,
      email,
      slug,
      generatedReferralCode: profileData?.generatedReferralCode || "N/A",
      username: profileData?.username || email,
      password,
    });

    return NextResponse.json({ success: true, message: "Registry handover complete." });
  } catch (error) {
    console.error("Handover Error:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
