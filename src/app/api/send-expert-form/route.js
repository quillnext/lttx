import { NextResponse } from 'next/server';
import { sendExpertFormEmails } from "@/app/utils/sendExpertFormEmails"; // 

export async function POST(req) {
  try {
    const body = await req.json();
    await sendExpertFormEmails(body);
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Email send error:", error);
    return NextResponse.json({ success: false, message: error.message }, { status: 500 });
  }
}