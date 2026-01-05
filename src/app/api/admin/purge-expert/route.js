
import { adminAuth, adminDb } from "@/lib/firebaseAdmin";
import { NextResponse } from "next/server";

export async function POST(request) {
  try {
    const { uid, secret } = await request.json();

    // Security check
    if (secret !== process.env.NEXT_PUBLIC_ADMIN_PASS) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    if (!uid) {
      return NextResponse.json({ error: "UID is required" }, { status: 400 });
    }

    // 1. Delete from Firebase Auth (if exists)
    try {
      await adminAuth.deleteUser(uid);
    } catch (e) {
      console.log("Auth user already gone or never existed.");
    }

    // 2. Fetch profile to get storage paths before deleting
    const profileRef = adminDb.collection("Profiles").doc(uid);
    const doc = await profileRef.get();
    const data = doc.data();

    // 3. Delete from Firestore
    await profileRef.delete();

    return NextResponse.json({ 
      success: true, 
      message: "Expert purged from Auth and Firestore.",
      storagePaths: {
        photo: data?.photo || null,
        certificates: data?.certificates || [],
        officePhotos: data?.officePhotos || []
      }
    });
  } catch (error) {
    console.error("Purge Error:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
