import { databases, ID } from "@/lib/appwrite";
import { sendEmail } from "@/lib/utils";
import { NextResponse } from "next/server";

export async function POST(request) {
  try {
    const { email, fullName, phone, residence, typeOfTravel, industrySegment, destinationExpertise, language } = await request.json();

    if (!email) {
      return NextResponse.json({ error: "Email is required" }, { status: 400 });
    }

    // Save request to database
    const requestDoc = await databases.createDocument(
      process.env.NEXT_PUBLIC_APPWRITE_DATABASE_ID,
      process.env.NEXT_PUBLIC_APPWRITE_INVITES_COLLECTION_ID,
      ID.unique(),
      {
        email,
        status: "pending",
        code: null,
        requestedAt: new Date().toISOString(),
        createdAt: new Date().toISOString(),
      }
    );

    // Email to User - Invite Code Request Confirmation
    await sendEmail({
      to: email,
      subject: "Your Invite Code Request Has Been Received",
      text: `
Hi ${fullName || email.split("@")[0]},

Thank you for your interest in becoming a Travel Expert on our platform.

We’ve received your request for an invite code. Our team will review your profile and, if it meets the eligibility criteria, you’ll receive your invite code shortly via email.

Once you have the code, you’ll be able to proceed with creating your profile.

Warm regards,
LTTX Team 
      `.trim(),
    });

    // Email to Admin - Invite Code Request
    await sendEmail({
      to: process.env.ADMIN_EMAIL,
      subject: `Invite Code Requested by ${fullName || email.split("@")[0]}`,
      text: `
Hi Team,

A new user has requested an invite code to join the platform as a Travel Expert. Below are the details submitted:
  • Name: ${fullName || "[Not Provided]"}
  • Email: ${email}
  • Phone Number: ${phone || "[Not Provided]"}
  • City & Country of Residence: ${residence || "[Not Provided]"}
  • Type of Travel: ${typeOfTravel?.join(", ") || "[Not Provided]"}
  • Industry Segment: ${industrySegment?.join(", ") || "[Not Provided]"}
  • Destination Expertise: ${destinationExpertise?.join(", ") || "[Not Provided]"}
  • Languages Spoken: ${language?.join(", ") || "[Not Provided]"}
  • Current Designation: ${designation || "[Not Provided]"}
  • Current Organization: ${organization || "[Not Provided]"}
  • Linkedin: ${linkedin || "[Not Provided]"}


Please review and issue an invite code if the profile is suitable.

Warm regards,
LTTX Team 
      `.trim(),
    });

    return NextResponse.json({ success: true, requestDoc }, { status: 200 });
  } catch (error) {
    console.error("Error in request-code:", error, error.code, error.response);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}