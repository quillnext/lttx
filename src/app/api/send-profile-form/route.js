import { NextResponse } from "next/server";
import { databases, ID, Query } from "@/lib/appwrite";
import { sendProfileSubmissionEmails } from "@/app/utils/sendProfileSubmissionEmails";
import { getFirestore, collection, addDoc, doc, updateDoc, serverTimestamp, query, where, getDocs } from "firebase/firestore";
import { app } from "@/lib/firebase";

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
      tagline,
      location,
      languages,
      responseTime,
      pricing,
      about,
      services,
      regions,
      experience,
      companies,
      certifications,
      inviteCode,
      profileId,
    } = body;

    if (!email || !fullName || !phone || (!profileId && !username)) {
      return NextResponse.json({ error: "Missing required fields: email, fullName, phone, username" }, { status: 400 });
    }

    if (!profileId) {
      // Check username uniqueness
      const profilesQuery = query(collection(db, 'Profiles'), where('username', '==', username));
      const profileRequestsQuery = query(collection(db, 'ProfileRequests'), where('username', '==', username));
      const [profilesSnap, profileRequestsSnap] = await Promise.all([
        getDocs(profilesQuery),
        getDocs(profileRequestsQuery),
      ]);
      if (!profilesSnap.empty || !profileRequestsSnap.empty) {
        return NextResponse.json({ error: "Username is already taken" }, { status: 400 });
      }

      // Validate username format
      if (!/^[a-zA-Z0-9_]{3,20}$/.test(username)) {
        return NextResponse.json({ error: "Username must be 3-20 characters, alphanumeric or underscore" }, { status: 400 });
      }

      const existingUser = await databases.listDocuments(
        process.env.NEXT_PUBLIC_APPWRITE_DATABASE_ID,
        process.env.NEXT_PUBLIC_APPWRITE_USERS_COLLECTION_ID,
        [Query.equal("email", email)]
      );

      if (existingUser.documents.length > 0) {
        return NextResponse.json({ error: "User already exists. No duplicate profile allowed." }, { status: 400 });
      }

      const invite = await databases.listDocuments(
        process.env.NEXT_PUBLIC_APPWRITE_DATABASE_ID,
        process.env.NEXT_PUBLIC_APPWRITE_INVITES_COLLECTION_ID,
        [Query.equal("code", inviteCode), Query.equal("status", "pending")]
      );

      if (!invite.documents.length) {
        return NextResponse.json({ error: "Invalid or already used invite code" }, { status: 400 });
      }
    }

    let referralCode = null;
    if (!profileId) {
      let isUnique = false;
      while (!isUnique) {
        referralCode = `REFX${generateRandomChars()}`;
        const duplicateReferral = await databases.listDocuments(
          process.env.NEXT_PUBLIC_APPWRITE_DATABASE_ID,
          process.env.NEXT_PUBLIC_APPWRITE_USERS_COLLECTION_ID,
          [Query.equal("referralCode", referralCode)]
        );
        isUnique = duplicateReferral.documents.length === 0;
      }
    }

    const profileData = {
      username,
      fullName,
      email,
      phone,
      tagline,
      location,
      languages,
      responseTime,
      pricing,
      about,
      services,
      regions,
      experience,
      companies,
      certifications,
      timestamp: serverTimestamp(),
      referralCode: profileId ? undefined : referralCode,
    };

    let savedProfileId = profileId;
    if (profileId) {
      // Exclude username from updates
      delete profileData.username;
      await updateDoc(doc(db, "Profiles", profileId), profileData);
    } else {
      const docRef = await addDoc(collection(db, "ProfileRequests"), profileData);
      savedProfileId = docRef.id;
    }

    if (!profileId) {
      await databases.createDocument(
        process.env.NEXT_PUBLIC_APPWRITE_DATABASE_ID,
        process.env.NEXT_PUBLIC_APPWRITE_USERS_COLLECTION_ID,
        ID.unique(),
        {
          fullName,
          email,
          phone,
          city: location,
          typeOfTravel: services,
          industrySegment: [],
          destinationExpertise: regions,
          language: languages.split(", "),
          designation: "",
          organization: companies,
          linkedin: null,
          inviteCode,
          referralCode,
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
        }
      );

      await databases.updateDocument(
        process.env.NEXT_PUBLIC_APPWRITE_DATABASE_ID,
        process.env.NEXT_PUBLIC_APPWRITE_INVITES_COLLECTION_ID,
        invite.documents[0].$id,
        {
          status: "used",
          email,
          usedAt: new Date().toISOString(),
        }
      );
    }

    await sendProfileSubmissionEmails({
      ...body,
      referralCode: referralCode || "N/A",
      profileId: savedProfileId,
    });

    const slug = `${fullName.toLowerCase().replace(/\s+/g, '-')}-${savedProfileId.slice(0, 6)}`;

    return NextResponse.json({ success: true, profileId: savedProfileId, slug }, { status: 200 });
  } catch (error) {
    console.error("Error in send-profile-form:", error, error.code, error.response);
    return NextResponse.json({ error: "Failed to process profile submission" }, { status: 500 });
  }
}