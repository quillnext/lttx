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
      cc: process.env.ADMIN_EMAIL_CC,
      bcc: process.env.ADMIN_EMAIL_BCC,
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
• And be part of a first-of-its-kind expert travel community

Get excited – the journey to becoming an Xmytravel Expert is just beginning! ✨

Warm regards,
Xmytravel Team
support@xmytravel.com
      `.trim(),
      html: `
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>You're One Step Away from Joining Xmytravel</title>
    <style>
        body { font-family: Arial, sans-serif; margin: 0; padding: 0; background-color: #f5f5f5; }
        .header { width: 100%; text-align: center; }
        .header img { width: 100%; height: auto; object-fit: cover; }
        .content {  margin: 20px auto; padding: 20px;  border-radius: 8px; text-align: left;}
        .content h1 { font-size: 24px; color: #333; margin: 0 0 20px; }
        .content p { font-size: 16px; color: #555; line-height: 1.6; }
        .content ul { list-style: none; padding: 0; margin: 20px 0; }
        .content ul li { font-size: 16px; color: #555; margin: 10px 0; }
        .footer { margin: 20px auto; padding: 20px; }
        .footer .intro { font-size: 14px; color: #777; text-align: left; margin-bottom: 20px; }
        .footer .signature { display: flex; align-items: center; }
        .footer .signature img { border-radius: 50%; width: 60px; height: 60px; margin-right: 20px; }
        .footer .signature .text { font-size: 14px; color: #777; }
        .footer .signature p { margin: 5px 0; }
    </style>
</head>
<body>
    <div class="header">
        <img src="https://lttx.vercel.app/emailbanner.jpeg" alt="Xmytravel Logo" />
    </div>
    <div class="content">
        <h1>You're One Step Away from Joining Xmytravel! ✨</h1>
        <p>Hi ${fullName || email.split("@")[0]},</p>
        <p>Thank you for applying to become a Travel Expert on <strong>Xmytravel</strong> – the pioneering platform built exclusively for certified and credible Travel Experts & Consultants.</p>
        <p>We’ve received your request for an invite code. Our curation team is reviewing your profile through our expert verification module. If you fit the bill, you’ll soon receive a <strong>Congratulations</strong> email with your exclusive invite code.</p>
        <p>You're just one step away from unlocking:</p>
        <ul>
            <li>A verified Travel Expert badge</li>
            <li>Access to real travel consultation queries</li>
            <li>Credibility with a curated profile on a trusted platform</li>
            <li>Opportunities to monetize your expertise</li>
            <li>Be part of a first-of-its-kind expert travel community</li>
        </ul>
        <p>Get excited – the journey to becoming an Xmytravel Expert is just beginning! ✨</p>
        <p>Best Regards,<br>Xmytravel Team</p>
    </div>
    <div class="footer">
        <div class="intro">
            <p>At Xmytravel, we believe that the future of travel lies in trusted, expert-led guidance. This platform was built to recognize, celebrate, and empower professionals like you — the ones who shape journeys with insight and integrity. If you’re reading this, it means you’re already on your way to joining an exclusive league of curated Travel Experts. Let’s build the future of travel, together.</p>
        </div>
        <div class="signature">
            <img src="https://img.freepik.com/free-vector/user-circles-set_78370-4704.jpg?t=st=1745137316~exp=1745140916~hmac=df9e2b52d912d264fe14be1febc1e1e4376538323816bc0cff5ec61a1a7614e2&w=826" alt="User Photo" />
            <div class="text">
                <p>— Rishabh Vyas,<br> Founder Xmytravel</p>
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
      cc: process.env.ADMIN_EMAIL_CC,
      bcc: process.env.ADMIN_EMAIL_BCC,
      subject: `Invite Code Requested by ${fullName || email.split("@")[0]}`,
      text: `
Hi Team,

A new user has requested an invite code to join Xmytravel as a Travel Expert. Below are the details submitted:
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
• LinkedIn: ${linkedin || "[Not Provided]"}

Please review the profile and issue an invite code if suitable.

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