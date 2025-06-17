
import { initializeApp, getApps, cert } from "firebase-admin/app";
import { getAuth } from "firebase-admin/auth";


if (!getApps().length) {
  initializeApp({
    credential: cert(JSON.parse(process.env.FIREBASE_ADMIN_SDK)),
  });
}

const auth = getAuth();

export async function POST(request) {
  try {
    const { email, displayName, profileId } = await request.json();

    if (!email || !profileId) {
      return new Response(
        JSON.stringify({ error: "Email and profileId are required" }),
        {
          status: 400,
          headers: { "Content-Type": "application/json" },
        }
      );
    }


    const userRecord = await auth.createUser({
      uid: profileId, // Set the UID to match the profileId
      email,
      emailVerified: false,
      password: "TempPass123", // Temporary password
      displayName: displayName || undefined,
    });


    const resetLink = await auth.generatePasswordResetLink(email);

    return new Response(
      JSON.stringify({ success: true, uid: userRecord.uid, resetLink }),
      {
        status: 200,
        headers: { "Content-Type": "application/json" },
      }
    );
  } catch (error) {
    console.error("Error creating user:", error.message);
    return new Response(
      JSON.stringify({ error: error.message }),
      {
        status: 500,
        headers: { "Content-Type": "application/json" },
      }
    );
  }
}