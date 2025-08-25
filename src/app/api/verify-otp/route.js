
import { NextResponse } from "next/server";
import { adminDb } from "../../../lib/firebaseAdmin"; 

export async function POST(request) {
  try {
    const { email, otp } = await request.json();
    if (!email || !otp) {
      return NextResponse.json({ verified: false, error: "Missing email or OTP" }, { status: 400 });
    }

    const doc = await adminDb.collection("otps").doc(email).get();
    if (!doc.exists) {
      return NextResponse.json({ verified: false, error: "OTP not found or expired" }, { status: 400 });
    }

    const data = doc.data();
    if (data.otp !== otp || data.expiry < Date.now()) {
      return NextResponse.json({ verified: false, error: "Invalid or expired OTP" }, { status: 400 });
    }

   
    await adminDb.collection("otps").doc(email).delete();

    return NextResponse.json({ verified: true }, { status: 200 });
  } catch (error) {
    console.error("Error verifying OTP:", error.message);
    return NextResponse.json({ verified: false, error: "Verification failed" }, { status: 500 });
  }
}