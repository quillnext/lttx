import { NextResponse } from 'next/server';
import { sendApprovalNotificationEmail } from '@/app/utils//sendApprovalNotificationEmail';

export async function POST(req) {
  try {
    const body = await req.json();

    if (!body.email || !body.fullName || !body.slug) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
    }

    await sendApprovalNotificationEmail(body);
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Email send error:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
