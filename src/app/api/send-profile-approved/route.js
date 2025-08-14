
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

export async function POST(req) {
  console.log("Received request to approve profile");

  let body;
  try {
    body = await req.json();
  } catch (error) {
    return NextResponse.json({ error: "Invalid request body" }, { status: 400 });
  }

  const { profileId, fullName, email, slug, generatedReferralCode, username } = body;

  if (!profileId || !email || !fullName || !username || !slug || !generatedReferralCode) {
    return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
  }

  try {
    let userRecord;
    let password = null;

    try {
      userRecord = await adminAuth.getUserByEmail(email);
    } catch (error) {
      if (error.code === "auth/user-not-found") {
        password = generatePassword();
        userRecord = await adminAuth.createUser({
          email,
          password,
          emailVerified: false,
          disabled: false,
        });

      } else {
        throw new Error(`Failed to check user existence: ${error.message}`);
      }
    }

    const oldProfileRef = adminDb.collection("Profiles").doc(profileId);
    const profileDoc = await oldProfileRef.get();
    if (!profileDoc.exists) {
      return NextResponse.json({ error: "Profile not found" }, { status: 404 });
    }

    const profileData = profileDoc.data();

    const newProfileRef = adminDb.collection("Profiles").doc(userRecord.uid);
    await newProfileRef.set({
      ...profileData,
      status: "approved",
      userId: userRecord.uid,
      forcePasswordChange: true,
    });

    await oldProfileRef.delete();

    // Await the email sending process
    await sendApprovalNotificationEmail({
        fullName,
        email,
        slug,
        generatedReferralCode,
        username,
        password, // Will be null if user already existed, which is handled in the email util
    });

    return NextResponse.json({ success: true }, { status: 200 });
  } catch (error) {
    console.error("Error in send-profile-approved:", error.message);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
