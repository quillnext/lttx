import { databases, ID, Query } from "@/lib/appwrite";
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
      inviteCode,
    } = data;

    // Validate required fields
    if (!inviteCode) {
      return NextResponse.json({ error: "Invite code is required" }, { status: 400 });
    }

    // Verify invite code
    const invite = await databases.listDocuments(
      process.env.NEXT_PUBLIC_APPWRITE_DATABASE_ID,
      process.env.NEXT_PUBLIC_APPWRITE_INVITES_COLLECTION_ID,
      [
        Query.equal("code", inviteCode),
        Query.equal("status", "available"),
      ]
    );

    if (!invite.documents.length) {
      return NextResponse.json({ error: "Invalid or already used invite code" }, { status: 400 });
    }

    // Save user data
    const user = await databases.createDocument(
      process.env.NEXT_PUBLIC_APPWRITE_DATABASE_ID,
      process.env.NEXT_PUBLIC_APPWRITE_USERS_COLLECTION_ID,
      ID.unique(),
      {
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
        linkedin: linkedin || null,
        inviteCode,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      }
    );

    // Mark invite code as used
    await databases.updateDocument(
      process.env.NEXT_PUBLIC_APPWRITE_DATABASE_ID,
      process.env.NEXT_PUBLIC_APPWRITE_INVITES_COLLECTION_ID,
      invite.documents[0].$id,
      {
        status: "used",
        email,
        usedAt: new Date().toISOString(),
      }
    );

    // Email to Admin - Profile Submitted with Invite Code
    await sendEmail({
      to: process.env.ADMIN_EMAIL,
      cc: process.env.ADMIN_EMAIL_CC,
      bcc: process.env.ADMIN_EMAIL_BCC,
      subject: `New Travel Expert Profile Submitted – ${fullName || email.split("@")[0]}`,
      text: `
Hi Team,

A new user has submitted their profile using a valid invite code to join Xmytravel as a Travel Expert. Below are the details:
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
• Invite Code Used: ${inviteCode}

Please review the profile and send the profile creation link to the user if approved.

Warm regards,
Xmytravel Team
support@xmytravel.com
      `.trim(),
    });

    // Email to User - Profile Submission Acknowledgment
    const userHtmlTemplate = `
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Profile Submission Received</title>
    <style>
        body { font-family: Arial, sans-serif; margin: 0; padding: 0; background-color: #f5f5f5; }
        .header { text-align: center; padding: 20px; background-color: #ffffff; border-bottom: 1px solid #e0e0e0; }
        .header img { max-width: 150px; }
        .content { max-width: 600px; margin: 20px auto; padding: 20px; background-color: #ffffff; border-radius: 8px; text-align: center; }
        .content h1 { font-size: 24px; color: #333; margin: 0 0 20px; }
        .content p { font-size: 16px; color: #555; line-height: 1.6; }
        .signature { margin-top: 30px; text-align: center; }
        .signature img { border-radius: 50%; width: 60px; height: 60px; }
        .signature p { font-size: 14px; color: #888; margin: 5px 0; }
        .signature a { color: #007bff; text-decoration: none; }
    </style>
</head>
<body>
    <div class="header">
        <img src="https://via.placeholder.com/150" alt="Xmytravel Logo" />
        <p style="color: #888; font-size: 12px;">Xmytravel – Expert Travel Community</p>
    </div>
    <div class="content">
        <h1>You're Almost There! 🚀</h1>
        <p>Hi ${fullName || email.split("@")[0]},</p>
        <p>We’ve received your profile submission and invite code – thank you for taking the next step to becoming an official Travel Expert on <strong>Xmytravel</strong>.</p>
        <p>Your profile is now being reviewed through our exclusive expert curation module. If approved, you’ll soon receive a <strong>Congratulations</strong> email along with a link to complete your verified profile.</p>
        <p>You're this close to joining a select league of Travel Experts & Consultants who are shaping the future of trusted travel guidance.</p>
        <p>Stay tuned – your journey with Xmytravel is just about to take flight! 🚀</p>
    </div>
    <div class="signature">
        <img src="https://via.placeholder.com/60" alt="Xmytravel Team Photo" />
        <p>Xmytravel Team</p>
        <p><a href="mailto:support@xmytravel.com">support@xmytravel.com</a></p>
    </div>
</body>
</html>
`.trim();

    await sendEmail({
      to: email,
      cc: process.env.ADMIN_EMAIL_CC,
      bcc: process.env.ADMIN_EMAIL_BCC,
      subject: "You're Almost There – Profile Submitted Successfully",
      text: `
You're Almost There! 🚀

Hi ${fullName || email.split("@")[0]},

We’ve received your profile submission and invite code – thank you for taking the next step to becoming an official Travel Expert on Xmytravel.

Your profile is now being reviewed through our exclusive expert curation module. If approved, you’ll soon receive a Congratulations email along with a link to complete your verified profile.

You're this close to joining a select league of Travel Experts & Consultants who are shaping the future of trusted travel guidance.

Stay tuned – your journey with Xmytravel is just about to take flight. 🚀

Warm regards,
Xmytravel Team
support@xmytravel.com
      `.trim(),
      html: userHtmlTemplate,
    });

    return NextResponse.json({ success: true, user }, { status: 200 });
  } catch (error) {
    console.error("Error in submit-form:", error, error.code, error.response);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}