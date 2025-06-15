import { initializeApp, getApps, cert } from "firebase-admin/app";
import { getAuth } from "firebase-admin/auth";

// Initialize Firebase Admin SDK
if (!getApps().length) {
  initializeApp({
    credential: cert(JSON.parse(process.env.FIREBASE_ADMIN_SDK)),
  });
}

const auth = getAuth();

export async function POST(request) {
  try {
    const { uids } = await request.json();
    if (!Array.isArray(uids)) {
      return new Response(
        JSON.stringify({ error: "uids must be an array" }),
        {
          status: 400,
          headers: { "Content-Type": "application/json" },
        }
      );
    }

    const existingUsers = [];
    for (const uid of uids) {
      try {
        await auth.getUser(uid);
        existingUsers.push(uid);
      } catch (error) {
        if (error.code !== "auth/user-not-found") {
          console.error(`Error checking user ${uid}:`, error.message);
        }
      }
    }

    return new Response(
      JSON.stringify({ success: true, existingUsers }),
      {
        status: 200,
        headers: { "Content-Type": "application/json" },
      }
    );
  } catch (error) {
    console.error("Error checking users:", error.message);
    return new Response(
      JSON.stringify({ error: error.message }),
      {
        status: 500,
        headers: { "Content-Type": "application/json" },
      }
    );
  }
}