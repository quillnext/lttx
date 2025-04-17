import { databases, ID } from "@/lib/appwrite";
import { sendEmail } from "@/lib/utils";
import { NextResponse } from "next/server";

export async function POST(request) {
  try {
    const data = await request.json();
    
    const {
      fullName,
      email,
      phone,
      residence,
      typeOfTravel,
      industrySegment,
      destinationExpertise,
      language,
      designation,
      organization,
      linkedin,
    } = data;

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
      cc: process.env.ADMIN_EMAIL_CC ,
      bcc: process.env.ADMIN_EMAIL_BCC ,
      subject: "You're One Step Away from Joining Xmytravel – Invite Code Requested",
      text: `
Hi ${fullName || email.split("@")[0]},

Thank you for applying to become a Travel Expert on Xmytravel – the pioneering platform built exclusively for certified and credible Travel Experts & Consultants.

We’ve received your request for an invite code. Our curation team is reviewing your profile through our expert verification module. If you fit the bill, you’ll soon receive a Congratulations email with your exclusive invite code.

You're just one step away from unlocking:

=> A verified Travel Expert badge
=> Access to real travel consultation queries
=> Credibility with a curated profile on a trusted platform
=> Opportunities to monetize your expertise
=> And be part of a first-of-its-kind expert travel community

Get excited – the journey to becoming an Xmytravel Expert is just beginning. ✨

Warm regards,
Xmytravel Team
      `.trim(),
    });

    // Email to Admin - Invite Code Request
    await sendEmail({
      to: process.env.ADMIN_EMAIL,
      cc: process.env.ADMIN_EMAIL_CC ,
      bcc: process.env.ADMIN_EMAIL_BCC ,
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
Xmytravel Team

      `.trim(),
    });

    return NextResponse.json({ success: true, requestDoc }, { status: 200 });
  } catch (error) {
    console.error("Error in request-code:", error, error.code, error.response);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}