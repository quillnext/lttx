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
      subject: `New Travel Expert Profile Submitted – ${fullName}`,
      text: `
Hi Team,

A user has submitted their profile using a valid invite code. Here are the details:
  • Name: ${fullName || "[Not Provided]"}
  • Email: ${email}
  • Phone Number: ${phone || "[Not Provided]"}
  • City & Country of Residence: ${residence || "[Not Provided]"}
  • Type of Travel: ${typeOfTravel?.join(", ") || "[Not Provided]"}
  • Industry Segment: ${industrySegment?.join(", ") || "[Not Provided]"}
  • Destination Expertise: ${destinationExpertise?.join(", ") || "[Not Provided]"}
  • Languages Spoken: ${language?.join(", ") || "[Not Provided]"}
  • Current Designation: ${designation}
  • Current Organization: ${organization}
  • Linkedin: ${linkedin || "[Not Provided]"}
  • Invite Code Used: ${inviteCode}

Please review the profile and send the profile creation link to the user if approved.

Best,
Your LTTX Team 
      `.trim(),
    });

    // Email to User - Profile Submission Acknowledgment
    await sendEmail({
      to: email,
      subject: "Thank You for Submitting Your Profile",
      text: `
Hi ${fullName},

We’ve received your profile submission along with your invite code.

Our team will review your details and, if approved, you’ll soon receive a separate email with the link to complete your profile creation.

Thank you for your interest in joining us as a Travel Expert!

Warm regards,
LTTX Team 
      `.trim(),
    });

    return NextResponse.json({ success: true, user }, { status: 200 });
  } catch (error) {
    console.error("Error in submit-form:", error, error.code, error.response);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}