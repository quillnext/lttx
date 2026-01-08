import { adminDb } from "@/lib/firebaseAdmin";
import { NextResponse } from "next/server";
import admin from "firebase-admin";

const defaultSchedule = {
  Mon: ["09:00", "13:30", "14:00"],
  Tue: ["09:00", "13:30", "14:00"],
  Wed: ["09:00", "13:30", "14:00"],
  Thu: ["09:00", "13:30", "14:00"],
  Fri: ["09:00", "13:30", "14:00"],
  Sat: ["09:00", "13:30", "14:00"],
  Sun: ["14:00", "17:30"],
};

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

    // 1. Create the profile record
    await profileRef.set(finalData);

    // 2. Initialize default recurring availability
    const recurringRef = adminDb.collection("ExpertRecurringAvailability").doc(id);
    await recurringRef.set({
      schedule: defaultSchedule,
      expertId: id,
      updatedAt: admin.firestore.FieldValue.serverTimestamp()
    });

    return NextResponse.json({ success: true, id });
  } catch (error) {
    console.error("Placeholder Creation Error:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}