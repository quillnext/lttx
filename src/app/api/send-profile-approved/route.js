
import { adminAuth, adminDb } from "@/lib/firebaseAdmin";
import { sendApprovalNotificationEmail } from "@/app/utils/sendApprovalNotificationEmail";
import { NextResponse } from "next/server";

// Function to generate a secure random password
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
    console.log("Request body:", body);
  } catch (error) {
    console.error("Error parsing request body:", error.message);
    return NextResponse.json({ error: "Invalid request body" }, { status: 400 });
  }

  const { profileId, fullName, email, slug, generatedReferralCode, username } = body;

  // Validate required fields
  if (!profileId || !email || !fullName || !username || !slug || !generatedReferralCode) {
    console.error("Missing required fields in request body:", { profileId, email, fullName, username, slug, generatedReferralCode });
    return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
  }

  try {
    let userRecord;

    // Check if a user with this email already exists
    try {
      console.log("Checking if user exists with email:", email);
      userRecord = await adminAuth.getUserByEmail(email);
      console.log("User already exists with UID:", userRecord.uid);
    } catch (error) {
      if (error.code === "auth/user-not-found") {
        // User does not exist, proceed to create a new one
        console.log("User does not exist, creating new user with email:", email);
        const password = generatePassword();
        console.log("Generated password for user:", password);

        userRecord = await adminAuth.createUser({
          email,
          password,
          emailVerified: false,
          disabled: false,
        });
        console.log("User created:", userRecord.uid);

        // Send the approval email with the generated password
        console.log("Sending email to:", email);
        await sendApprovalNotificationEmail({
          fullName,
          email,
          slug,
          generatedReferralCode,
          username,
          password,
        });
        console.log("Approval email sent successfully");
      } else {
        // Some other error occurred while checking the user
        console.error("Error checking user existence:", error.message);
        throw new Error(`Failed to check user existence: ${error.message}`);
      }
    }

    // Fetch the existing profile data
    console.log("Fetching profile with ID:", profileId);
    const oldProfileRef = adminDb.collection("Profiles").doc(profileId);
    const profileDoc = await oldProfileRef.get();
    if (!profileDoc.exists) {
      console.error("Profile document does not exist for profileId:", profileId);
      return NextResponse.json({ error: "Profile not found" }, { status: 404 });
    }

    const profileData = profileDoc.data();
    console.log("Profile data fetched:", profileData);

    // Create a new profile document with the user's UID
    const newProfileRef = adminDb.collection("Profiles").doc(userRecord.uid);
    await newProfileRef.set({
      ...profileData,
      status: "approved",
      userId: userRecord.uid,
      forcePasswordChange: true, // Ensure user changes password on first login
    });
    console.log("New profile created with UID:", userRecord.uid);

    // Delete the old profile document
    await oldProfileRef.delete();
    console.log("Old profile document deleted:", profileId);

    // If the user already existed, we still need to send an email (but without a new password)
    if (userRecord && !userRecord.password) {
      console.log("User already existed, sending notification email without password");
      await sendApprovalNotificationEmail({
        fullName,
        email,
        slug,
        generatedReferralCode,
        username,
        password: null, // Indicate no new password was generated
      });
      console.log("Notification email sent successfully");
    }

    return NextResponse.json({ success: true }, { status: 200 });
  } catch (error) {
    console.error("Error approving profile:", error.message);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}