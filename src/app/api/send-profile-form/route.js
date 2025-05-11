import { NextResponse } from "next/server";
import { sendProfileSubmissionEmails } from "@/app/utils/sendProfileSubmissionEmails";

export async function POST(req) {
  try {
    const body = await req.json();

    // Basic validation
    if (!body.email || !body.fullName || !body.phone) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
    }

    await sendProfileSubmissionEmails(body);

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Error sending profile email:", error);
    return NextResponse.json({ error: "Email failed to send" }, { status: 500 });
  }
}
