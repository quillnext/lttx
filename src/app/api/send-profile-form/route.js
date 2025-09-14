

import { NextResponse } from "next/server";
import {
  getFirestore,
  collection,
  addDoc,
  doc,
  updateDoc,
  serverTimestamp,
  query,
  where,
  getDocs,
} from "firebase/firestore";
import { app } from "@/lib/firebase";
import { sendProfileSubmissionEmails } from "@/app/utils/sendProfileSubmissionEmails";

const db = getFirestore(app);

const generateReferralCode = () => {
  const timestamp = Date.now().toString().slice(-4);
  const rand = Math.random().toString(36).substring(2, 4).toUpperCase();
  return `REFX${timestamp}${rand}`;
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
      profileType,
      yearsActive,
      licenseNumber,
      certificates,
      officePhotos,
      registeredAddress,
      website,
      employeeCount,
      expertise,
    } = body;

    if (!email || !fullName || !phone || (!profileId && !username)) {
      return NextResponse.json({ error: "Missing required fields: email, fullName, phone, username" }, { status: 400 });
    }

    let savedProfileId = profileId;

    // Build profile data with all fields from the request
    const profileData = {
      username,
      fullName,
      email,
      phone,
      dateOfBirth: dateOfBirth || '',
      tagline,
      location,
      languages: Array.isArray(languages) ? languages : [],
      responseTime,
      pricing,
      about,
      services: Array.isArray(services) ? services : [],
      regions: Array.isArray(regions) ? regions : [],
      experience: Array.isArray(experience) ? experience : [],
      certifications: certifications || '',
      referred: referred || 'No',
      referralCode: referred === 'Yes' ? referralCode : null,
      photo,
      leadId: leadId || null,
      profileType: profileType || 'expert',
      yearsActive: yearsActive || '',
      licenseNumber: licenseNumber || '',
      certificates: Array.isArray(certificates) ? certificates : [],
      officePhotos: Array.isArray(officePhotos) ? officePhotos : [],
      registeredAddress: registeredAddress || '',
      website: website || '',
      employeeCount: employeeCount || '',
      expertise: Array.isArray(expertise) ? expertise : [],
      timestamp: serverTimestamp(),
    };

    if (profileId) {
      // Update existing profile in the 'Profiles' collection
      await updateDoc(doc(db, "Profiles", profileId), profileData, { merge: true });
    } else {
      // New profile request for the 'ProfileRequests' collection
      if (!["Yes", "No"].includes(referred)) throw new Error("Referred must be 'Yes' or 'No'");

      const [profilesSnap, profileRequestsSnap, emailSnap] = await Promise.all([
        getDocs(query(collection(db, 'Profiles'), where('username', '==', username))),
        getDocs(query(collection(db, 'ProfileRequests'), where('username', '==', username))),
        getDocs(query(collection(db, 'Profiles'), where('email', '==', email)))
      ]);

      if (!profilesSnap.empty || !profileRequestsSnap.empty) throw new Error("Username is already taken");
      if (!/^[a-zA-Z][a-zA-Z0-9_]{2,19}$/.test(username)) {
        throw new Error("Username must be 3-20 characters, start with a letter, and contain only letters, numbers, or underscores");
      }
      if (!emailSnap.empty) throw new Error("User already exists. No duplicate profile allowed.");

      if (referred === "Yes") {
        if (!referralCode) throw new Error("Referral code is required when referred is 'Yes'");
        const codeSnap = await getDocs(query(collection(db, 'Profiles'), where('generatedReferralCode', '==', referralCode)));
        if (codeSnap.empty) throw new Error("Invalid referral code");
      }

      profileData.generatedReferralCode = generateReferralCode();
      
      const docRef = await addDoc(collection(db, "ProfileRequests"), profileData);
      savedProfileId = docRef.id;
    }

    await sendProfileSubmissionEmails({
      ...profileData,
      profileId: savedProfileId,
    });

    const slug = `${(username || '').toLowerCase().replace(/\s+/g, '-')}`;

    return NextResponse.json({ success: true, profileId: savedProfileId, slug }, { status: 200 });

  } catch (error) {
    console.error("Error in send-profile-form:", error.message, error.stack);
    return NextResponse.json(
      { error: error.message || "Failed to process profile submission" },
      { status: 500 }
    );
  }
}