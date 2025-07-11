import { databases, ID, Query } from "@/lib/appwrite";
import { sendEmail } from "@/lib/email";
import { NextResponse } from "next/server";


const generateRandomChars = () => {
  const chars = "0123456789"; 
  let result = ""; 
  for (let i = 0; i < 3; i++) {
    result += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return result;
};

export async function POST(request) {
  try {
    const data = await request.json();
    const {
      fullName,
      email,
      phone,
      city,
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

    // Check if user already exists
    const existingUser = await databases.listDocuments(
      process.env.NEXT_PUBLIC_APPWRITE_DATABASE_ID,
      process.env.NEXT_PUBLIC_APPWRITE_USERS_COLLECTION_ID,
      [Query.equal("email", email)]
    );

    if (existingUser.documents.length > 0) {
      return NextResponse.json({ error: "User already exists. No new invite code request allowed." }, { status: 400 });
    }

    // Check if a pending invite already exists for this email
    const existingInvite = await databases.listDocuments(
      process.env.NEXT_PUBLIC_APPWRITE_DATABASE_ID,
      process.env.NEXT_PUBLIC_APPWRITE_INVITES_COLLECTION_ID,
      [
        Query.equal("email", email),
        Query.equal("status", "pending"),
      ]
    );

    if (existingInvite.documents.length > 0) {
      return NextResponse.json({ error: "A pending invite code request already exists for this email." }, { status: 400 });
    }

    // Generate invite code (INVX + 2 random alphanumeric characters)
    let inviteCode;
    let isUnique = false;
    while (!isUnique) {
      inviteCode = `INVX${generateRandomChars()}`;
      const duplicateInvite = await databases.listDocuments(
        process.env.NEXT_PUBLIC_APPWRITE_DATABASE_ID,
        process.env.NEXT_PUBLIC_APPWRITE_INVITES_COLLECTION_ID,
        [Query.equal("code", inviteCode)]
      );
      isUnique = duplicateInvite.documents.length === 0;
    }

    // Save request to database
    const requestDoc = await databases.createDocument(
      process.env.NEXT_PUBLIC_APPWRITE_DATABASE_ID,
      process.env.NEXT_PUBLIC_APPWRITE_INVITES_COLLECTION_ID,
      ID.unique(),
      {
        email,
        status: "pending",
        code: inviteCode,
        requestedAt: new Date().toISOString(),
        createdAt: new Date().toISOString(),
      }
    );

    // Email to User - Invite Code Request Confirmation
    await sendEmail({
      to: email,
      subject: "You're One Step Away from Joining Xmytravel – Invite Code Requested",
      text: `
You're One Step Away from Joining Xmytravel! ✨

Hi ${fullName || email.split("@")[0]},

Thank you for applying to become a Travel Expert on Xmytravel – the pioneering platform built exclusively for certified and credible Travel Experts & Consultants.

We’ve received your request for an invite code. Our curation team is reviewing your profile through our expert verification module. If you fit the bill, you’ll soon receive a Congratulations email with your exclusive invite code.

You're just one step away from unlocking:
• A verified Travel Expert badge
• Access to real travel consultation queries
• Credibility with a curated profile on a trusted platform
• Opportunities to monetize your expertise
• Be part of a first-of-its-kind expert travel community

Get excited – the journey to becoming an Xmytravel Expert is just beginning! ✨

Warm regards,
Xmytravel Team
info@xmytravel.com
      `.trim(),
      html: `
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>You're One Step Away from Joining Xmytravel</title>
    <style>
        body { font-family: Arial, sans-serif; margin: 1% 12%; border:1px solid #36013F; padding: 0%; background-color: #f5f5f5; }
        .header { width: 100%; text-align: center; }
        .header img { width: 100%; height: auto; object-fit: cover; }
        .content { padding: 20px; text-align: left; }
        .gray { color: #777; }
        .content p { color: #00000; }
        .footer { margin: 0 auto; padding: 20px; }
        .footer .intro { color: #777; text-align: left; }
        .footer .signature { display: flex; align-items: center; }
        .footer .signature img { border-radius: 50%; width: 60px; height: 60px; margin-right: 20px; }
        .footer .signature .text { font-size: 14px; color: #00000; }
        .footer .signature p { margin: 5px 0; }
    </style>
</head>
<body>
    <div class="header">
        <img src="https://www.xmytravel.com/emailbanner.jpeg" alt="Xmytravel Logo" />
    </div>
    <div class="content">
        <p>Hi ${fullName || email.split("@")[0]},</p>
        <p>Thank you for applying to become a Travel Expert on Xmytravel – the pioneering platform built exclusively for certified and credible Travel Experts & Consultants.</p>
        <p>We’ve received your request for an invite code. Our curation team is reviewing your profile through our expert verification module. If you fit the bill, you’ll soon receive a Congratulations email with your exclusive invite code.</p>
        <p>You're just one step away from unlocking:</p>
        <ul>
            <li>A verified Travel Expert badge</li>
            <li>Access to real travel consultation queries</li>
            <li>Credibility with a curated profile on a trusted platform</li>
            <li>Opportunities to monetize your expertise</li>
            <li>Be part of a first-of-its-kind expert travel community</li>
        </ul>
        <p>Get excited – the journey to becoming an Xmytravel Expert is just beginning! </p>
        <p class="gray">Best Regards,<br>Xmytravel Team</p>
    </div>
    <hr>
    <div class="footer">
        <div class="intro">
            <p><i>"At Xmytravel, we believe that the future of travel lies in trusted, expert-led guidance. This platform was built to recognize, celebrate, and empower professionals like you — the ones who shape journeys with insight and integrity. If you’re reading this, it means you’re already on your way to joining an exclusive league of curated Travel Experts. Let’s build the future of travel, together."</i></p>
        </div>
        <div class="signature">
        <img src="https://www.xmytravel.com/profile%20photo.png" alt="Xmytravel Team Photo" />
            <div class="text">
                <p>Rishabh Vyas<br> Founder, Xmytravel</p>
            </div>
        </div>
    </div>
</body>
</html>
      `.trim(),
    });

    // Email to Admin - Invite Code Request
    await sendEmail({
      to: process.env.ADMIN_EMAIL,
      subject: `Invite Code Requested by ${fullName || email.split("@")[0]}`,
      text: `
Hi Team,

A new user has requested an invite code to join Xmytravel as a Travel Expert. Below are the details submitted:
• Name: ${fullName || "[Not Provided]"}
• Email: ${email}
• Phone Number: ${phone || "[Not Provided]"}
• City: ${city || "[Not Provided]"}
• Type of Travel: ${typeOfTravel?.join(", ") || "[Not Provided]"}
• Industry Segment: ${industrySegment?.join(", ") || "[Not Provided]"}
• Destination Expertise: ${destinationExpertise?.join(", ") || "[Not Provided]"}
• Languages Spoken: ${language?.join(", ") || "[Not Provided]"}
• Current Designation: ${designation || "[Not Provided]"}
• Current Organization: ${organization || "[Not Provided]"}
• LinkedIn: ${linkedin || "[Not Provided]"}


Please review the profile and approve the invite code if suitable.

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