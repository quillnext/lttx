import { databases, ID, Query } from "@/lib/appwrite";
import { sendEmail } from "@/lib/utils";
import { NextResponse } from "next/server";


const generateRandomChars = () => {
  const chars = "ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789"; 
  let result = ""; 
  for (let i = 0; i < 2; i++) {
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

    // Check if user already exists
    const existingUser = await databases.listDocuments(
      process.env.NEXT_PUBLIC_APPWRITE_DATABASE_ID,
      process.env.NEXT_PUBLIC_APPWRITE_USERS_COLLECTION_ID,
      [Query.equal("email", email)]
    );

    if (existingUser.documents.length > 0) {
      return NextResponse.json({ error: "User already exists. No duplicate profile allowed." }, { status: 400 });
    }

    // Verify invite code (should be pending from request-code)
    const invite = await databases.listDocuments(
      process.env.NEXT_PUBLIC_APPWRITE_DATABASE_ID,
      process.env.NEXT_PUBLIC_APPWRITE_INVITES_COLLECTION_ID,
      [
        Query.equal("code", inviteCode),
        Query.equal("status", "pending"),
      ]
    );

    if (!invite.documents.length) {
      return NextResponse.json({ error: "Invalid or already used invite code" }, { status: 400 });
    }

    // Generate random referral code (REFX + 2 random alphanumeric characters) with uniqueness check
    let referralCode;
    let isUnique = false;
    while (!isUnique) {
      referralCode = `REFX${generateRandomChars()}`;
      const duplicateReferral = await databases.listDocuments(
        process.env.NEXT_PUBLIC_APPWRITE_DATABASE_ID,
        process.env.NEXT_PUBLIC_APPWRITE_USERS_COLLECTION_ID,
        [Query.equal("referralCode", referralCode)]
      );
      isUnique = duplicateReferral.documents.length === 0;
    }

    // Save user data with referral code
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
        referralCode,
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
      subject: `New Travel Expert Profile Submitted – ${fullName || email.split("@")[0]}`,
      text: `
Hi Team,

A new user has submitted their profile using a valid invite code to join Xmytravel as a Travel Expert. Below are the details:
• Name: ${fullName || "[Not Provided]"}
• Email: ${email}
• Phone Number: ${phone || "[Not Provided]"}
• City: ${residence || "[Not Provided]"}
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
info@xmytravel.com
      `.trim(),
    });

    // Email to User - Profile Submission Acknowledgment with Referral Code
    const userHtmlTemplate = `
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Profile Submission Received</title>
    <style>
        body { font-family: Arial, sans-serif; margin: 1% 12%; border:1px solid #36013F; padding: 0%; background-color: #f5f5f5; }
        .header { width: 100%; text-align: center; }
        .header img { width: 100%; height: auto; object-fit: cover; }
        .content { margin: 10px auto 0 auto; padding: 20px; border-radius: 8px; text-align: left; }
        .gray { color: #777; }
        .black { color: #00000; }
        .content p { color: #00000; line-height: 1.6; }
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
        <img src="https://lttx.vercel.app/emailbanner.jpeg" alt="Xmytravel Logo" />
    </div>
    <div class="content">
        <p>Hi ${fullName || email.split("@")[0]},</p>
        <p>We’ve received your profile submission and invite code – thank you for taking the next step to becoming an official Travel Expert on Xmytravel.</p>
        <p>Your profile is now being reviewed through our exclusive expert curation module. If approved, you’ll soon receive a Congratulations email along with a link to complete your verified profile.</p>
       
        <p>You're this close to joining a select league of Travel Experts & Consultants who are shaping the future of trusted travel guidance.</p>
        <p>Stay tuned – your journey with Xmytravel is just about to take flight. 🚀</p>
        <p class="gray">Best Regards,<br>Xmytravel Team</p>
    </div>
    <hr>
    <div class="footer">
        <div class="intro">
            <p><i>"At Xmytravel, we believe that the future of travel lies in trusted, expert-led guidance. This platform was built to recognize, celebrate, and empower professionals like you — the ones who shape journeys with insight and integrity. If you’re reading this, it means you’re already on your way to joining an exclusive league of curated Travel Experts. Let’s build the future of travel, together."</i></p>
        </div>
        <div class="signature">
        <img src="https://lttx.vercel.app/profile%20photo.png" alt="Xmytravel Team Photo" />
            <div class="text">
                <p>Rishabh Vyas<br> Founder, Xmytravel</p>
            </div>
        </div>
    </div>
</body>
</html>
`.trim();

    await sendEmail({
      to: email,
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
info@xmytravel.com
      `.trim(),
      html: userHtmlTemplate,
    });

    return NextResponse.json({ success: true, user }, { status: 200 });
  } catch (error) {
    console.error("Error in submit-form:", error, error.code, error.response);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}