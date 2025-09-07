
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

  const { profileId } = body;

  if (!profileId) {
    return NextResponse.json({ error: "Missing required profileId" }, { status: 400 });
  }

  try {
    // 1. Read the request from `ProfileRequests` collection.
    const requestProfileRef = adminDb.collection("ProfileRequests").doc(profileId);
    const requestProfileDoc = await requestProfileRef.get();
    
    if (!requestProfileDoc.exists) {
      console.error(`Profile request not found with ID: ${profileId}`);
      return NextResponse.json({ error: "Profile request not found" }, { status: 404 });
    }

    const requestProfileData = requestProfileDoc.data();
    
    // 2. Explicitly destructure all expected fields and validate required ones.
    const { 
        email, fullName, username, phone, profileType, tagline, location,
        languages, responseTime, pricing, about, services, regions,
        expertise, photo, referred, referralCode, generatedReferralCode,
        dateOfBirth, yearsActive, experience, certifications, licenseNumber, leadId
    } = requestProfileData;
    
    const requiredFields = { email, fullName, username, phone };
    const missingFields = Object.entries(requiredFields)
        .filter(([_, value]) => !value)
        .map(([key]) => key);

    if (missingFields.length > 0) {
        return NextResponse.json({ error: `Profile request is missing required fields: ${missingFields.join(', ')}` }, { status: 400 });
    }
    console.log("Found profile request data for:", email);

    // 3. Create/Get Firebase Auth user.
    let userRecord;
    let password = null;

    try {
      userRecord = await adminAuth.getUserByEmail(email);
      console.log(`Found existing user with email ${email}, UID: ${userRecord.uid}`);
    } catch (error) {
      if (error.code === "auth/user-not-found") {
        console.log(`User not found with email ${email}, creating new user...`);
        password = generatePassword();
        userRecord = await adminAuth.createUser({
          email,
          password,
          emailVerified: false,
          disabled: false,
          displayName: fullName,
        });
        console.log(`Created new user with email ${email}, UID: ${userRecord.uid}`);
      } else {
        console.error("Error checking user existence:", error);
        throw new Error(`Failed to check user existence: ${error.message}`);
      }
    }

    // 4. Construct the final profile explicitly to ensure data integrity.
    const newProfileRef = adminDb.collection("Profiles").doc(userRecord.uid);
    
    const finalProfileData = {
      // Basic Info
      profileType: profileType || 'expert',
      username,
      fullName,
      email,
      phone,
      dateOfBirth,
      yearsActive,
      tagline,
      location,
      languages,
      responseTime,
      pricing,
      about,
      photo,
      // Services & Expertise
      services,
      regions,
      expertise,
      // Experience & Credentials
      experience,
      certifications,
      licenseNumber,
      // Referral Info
      referred,
      referralCode,
      generatedReferralCode,
      leadId,
      // System fields
      status: "approved",
      isPublic: true, // Make profile public by default on approval
      userId: userRecord.uid,
      forcePasswordChange: !!password,
      approvalTimestamp: new Date().toISOString(),
    };
    
    // Remove any undefined fields to keep Firestore data clean
    Object.keys(finalProfileData).forEach(key => finalProfileData[key] === undefined && delete finalProfileData[key]);
    
    console.log("Saving final profile data to Profiles collection:", finalProfileData);
    await newProfileRef.set(finalProfileData);
    console.log(`Successfully created profile in 'Profiles' with ID: ${userRecord.uid}`);

    // 5. Delete the request from `ProfileRequests`.
    await requestProfileRef.delete();
    console.log(`Successfully deleted profile request with ID: ${profileId}`);

    // 6. Send notification email.
    const slug = username.toLowerCase().replace(/\s+/g, '-');
    await sendApprovalNotificationEmail({
        fullName: fullName,
        email: email,
        slug,
        generatedReferralCode: generatedReferralCode,
        username: username,
        password, // Will be null if user already existed
    });
    console.log(`Approval email process initiated for ${email}`);

    return NextResponse.json({ success: true, newProfileId: userRecord.uid }, { status: 200 });
  } catch (error) {
    console.error("Error in send-profile-approved:", error.message, error.stack);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}