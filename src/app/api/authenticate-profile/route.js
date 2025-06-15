
import { initializeApp, getApps, cert } from "firebase-admin/app";
import { getAuth } from "firebase-admin/auth";
import { getFirestore } from "firebase-admin/firestore";


console.log("FIREBASE_ADMIN_SDK (partial):", process.env.FIREBASE_ADMIN_SDK?.substring(0, 50) + "...");


if (!getApps().length) {
  try {
    console.log("Attempting to initialize Firebase Admin SDK...");
    const parsedCert = JSON.parse(process.env.FIREBASE_ADMIN_SDK);
    console.log("Parsed service account - project_id:", parsedCert.project_id);
    initializeApp({
      credential: cert(parsedCert),
    });
    console.log("Firebase Admin SDK initialized successfully");
  } catch (error) {
    console.error("Failed to initialize Firebase Admin SDK:", error.message);
    throw error;
  }
}

const auth = getAuth();
const db = getFirestore();

export async function POST(request) {
  try {
    const { profileId, email, displayName } = await request.json();

    if (!profileId || !email) {
      return new Response(
        JSON.stringify({ error: "profileId and email are required" }),
        {
          status: 400,
          headers: { "Content-Type": "application/json" },
        }
      );
    }

    let uid = profileId; 
    try {
      const userRecord = await auth.getUser(uid);
      console.log(`User already exists with UID ${uid}`);


      if (userRecord.email !== email) {
        throw new Error(`UID ${uid} already exists with a different email: ${userRecord.email}`);
      }
    } catch (error) {
      if (error.code === "auth/user-not-found") {
        try {
          const existingUser = await auth.getUserByEmail(email);
          throw new Error(`Email ${email} is already associated with UID ${existingUser.uid}, cannot assign to UID ${uid}`);
        } catch (emailError) {
          if (emailError.code !== "auth/user-not-found") {
            throw emailError;
          }
          const newUser = await auth.createUser({
            uid: profileId,
            email,
            emailVerified: false,
            password: "TempPass123",
            displayName: displayName || undefined,
          });
          console.log(`Created new user with email ${email}, UID: ${newUser.uid}`);
        }
      } else {
        throw error;
      }
    }

    const profileRef = db.collection("Profiles").doc(profileId);
    await profileRef.update({
      uid,
      status: "approved",
      authStatus: null,
    });

    const resetLink = await auth.generatePasswordResetLink(email);

    return new Response(
      JSON.stringify({ success: true, uid, resetLink }),
      {
        status: 200,
        headers: { "Content-Type": "application/json" },
      }
    );
  } catch (error) {
    console.error("Error authenticating profile:", error.message);
    return new Response(
      JSON.stringify({ error: error.message }),
      {
        status: 500,
        headers: { "Content-Type": "application/json" },
      }
    );
  }
}