

import { NextResponse } from "next/server";
import { getFirestore, collection, addDoc, doc, updateDoc, serverTimestamp, query, where, getDocs } from "firebase/firestore";
import { app } from "@/lib/firebase";
import { sendProfileSubmissionEmails } from "@/app/utils/sendProfileSubmissionEmails";

const db = getFirestore(app);

const generateRandomChars = () => {
  const chars = "ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789";
  let result = "";
  for (let i = 0; i < 2; i++) {
    result += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return result;
};

export async function POST(req) {
  try {
    const body = await req.json();
    const {
      username,
      fullName,
      email,
      phone,
      dateOfBirth, 
      tagline,
      location,
      languages,
      responseTime,
      pricing,
      about,
      services,
      regions,
      experience,
      certifications,
      referred,
      referralCode,
      profileId,
      photo,
      leadId,
    } = body;

  
    if (!email || !fullName || !phone || (!profileId && !username)) {
      return NextResponse.json({ error: "Missing required fields: email, fullName, phone, username" }, { status: 400 });
    }

   
    if (!profileId && !["Yes", "No"].includes(referred)) {
      return NextResponse.json({ error: "Referred must be 'Yes' or 'No'" }, { status: 400 });
    }

    if (!profileId) {
     
      const profilesQuery = query(collection(db, 'Profiles'), where('username', '==', username));
      const profileRequestsQuery = query(collection(db, 'ProfileRequests'), where('username', '==', username));
      const [profilesSnap, profileRequestsSnap] = await Promise.all([
        getDocs(profilesQuery),
        getDocs(profileRequestsQuery),
      ]);
      if (!profilesSnap.empty || !profileRequestsSnap.empty) {
        return NextResponse.json({ error: "Username is already taken" }, { status: 400 });
      }

     
      if (!/^[a-zA-Z][a-zA-Z0-9_]{2,19}$/.test(username)) {
        return NextResponse.json({ error: "Username must be 3-20 characters, start with a letter, and contain only letters, numbers, or underscores" }, { status: 400 });
      }

     
      const emailQuery = query(collection(db, 'Profiles'), where('email', '==', email));
      const emailSnap = await getDocs(emailQuery);
      if (!emailSnap.empty) {
        return NextResponse.json({ error: "User already exists. No duplicate profile allowed." }, { status: 400 });
      }

     
      if (referred === "Yes") {
        if (!referralCode) {
          return NextResponse.json({ error: "Referral code is required when referred is 'Yes'" }, { status: 400 });
        }
        const codeQuery = query(collection(db, 'Profiles'), where('generatedReferralCode', '==', referralCode));
        const codeSnap = await getDocs(codeQuery);
        if (codeSnap.empty) {
          return NextResponse.json({ error: "Invalid referral code" }, { status: 400 });
        }
      }
    }

   
    let generatedReferralCode = null;
    if (!profileId) {
      let isUnique = false;
      while (!isUnique) {
        generatedReferralCode = `REFX${generateRandomChars()}`;
        const duplicateReferral = await getDocs(query(collection(db, 'Profiles'), where('generatedReferralCode', '==', generatedReferralCode)));
        isUnique = duplicateReferral.empty;
      }
    }

    const profileData = {
      username,
      fullName,
      email,
      phone,
      dateOfBirth: dateOfBirth || '', 
      tagline,
      location,
      languages,
      responseTime,
      pricing,
      about,
      services,
      regions,
      experience,
      certifications,
      referred: referred || 'No', 
      referralCode: referred === 'Yes' ? referralCode : null, 
      photo,
      timestamp: serverTimestamp(),
      generatedReferralCode: profileId ? undefined : generatedReferralCode,
      leadId: leadId || null,
    };

    let savedProfileId = profileId;
    if (profileId) {
      delete profileData.username;
      delete profileData.generatedReferralCode;
      await updateDoc(doc(db, "Profiles", profileId), profileData);
    } else {
      const docRef = await addDoc(collection(db, "ProfileRequests"), profileData);
      savedProfileId = docRef.id;
    }

    // Send emails to user and admin
    await sendProfileSubmissionEmails({
      ...profileData,
      profileId: savedProfileId,
      generatedReferralCode: generatedReferralCode || "N/A",
    });

    const slug = `${username.toLowerCase().replace(/\s+/g, '-')}`;

    return NextResponse.json({ success: true, profileId: savedProfileId, slug }, { status: 200 });
  } catch (error) {
    console.error("Error in send-profile-form:", error);
    return NextResponse.json({ error: error.message || "Failed to process profile submission" }, { status: 500 });
  }
}