import { adminDb } from "@/lib/firebaseAdmin";
import { NextResponse } from "next/server";
import admin from "firebase-admin";

export async function POST(request) {
  try {
    const data = await request.json();
    
    // Auto-generate ID
    const profileRef = adminDb.collection("Profiles").doc();
    const id = profileRef.id;

    // Remove the client-side timestamp if provided to use server-side one
    const { timestamp, ...rest } = data;

    const finalData = {
        ...rest,
        id,
        status: "approved",
        isPublic: data.isPublic !== false,
        isHandedOver: false,
        timestamp: admin.firestore.FieldValue.serverTimestamp(),
        generatedReferralCode: `REFX${Date.now().toString().slice(-4)}${Math.random().toString(36).substring(2, 4).toUpperCase()}`
    };

    await profileRef.set(finalData);

    return NextResponse.json({ success: true, id });
  } catch (error) {
    console.error("Placeholder Creation Error:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}