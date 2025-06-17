
import { databases, ID, Query, client } from "@/lib/appwrite";
import { Storage } from "appwrite";
import { NextResponse } from "next/server";
import { sendEmail } from "@/lib/email";

//  Appwrite Storage
const storage = new Storage(client);

export async function POST(request) {
  try {
    // Check Content-Type to determine how to parse 
    const contentType = request.headers.get("content-type");
    let data;

    if (contentType && contentType.includes("application/json")) {
      
      data = await request.json();
    } else if (contentType && contentType.includes("multipart/form-data")) {
    
      const formData = await request.formData();
      data = {};

      // Convert FormData to a plain object
      for (const [key, value] of formData.entries()) {
        if (key === "workSamples" || key === "certificationFiles") {
          // Handle multiple files
          if (!data[key]) data[key] = [];
          data[key].push(value);
        } else if (["typeOfTravel", "industrySegment", "destinationExpertise", "language", "testimonials"].includes(key)) {
          // Parse JSON strings for arrays
          data[key] = value ? JSON.parse(value) : [];
        } else if (key === "yearsOfExperience") {
          // Ensure yearsOfExperience is a string
          data[key] = value.toString();
        } else if (key === "declaration") {
          // Convert declaration to boolean
          data[key] = value === "true";
        } else {
          // Handle other fields (strings, files, etc.)
          data[key] = value;
        }
      }
    } else {
      return NextResponse.json({ error: "Unsupported Content-Type" }, { status: 400 });
    }

    console.log("Received data:", data);

    if (!data.inviteCode) {
      return NextResponse.json({ error: "Invite code is required" }, { status: 400 });
    }

    if (!data.tagline && !data.about) {
      console.log("Step 1: Fetching pre-filled data for inviteCode:", data.inviteCode);
      const userData = await databases.listDocuments(
        process.env.NEXT_PUBLIC_APPWRITE_DATABASE_ID,
        process.env.NEXT_PUBLIC_APPWRITE_USERS_COLLECTION_ID,
        [Query.equal("inviteCode", data.inviteCode)]
      );

      if (userData.documents.length === 0) {
        return NextResponse.json({ error: "Invalid invite code" }, { status: 400 });
      }

      const user = userData.documents[0];
      return NextResponse.json(
        {
          success: true,
          userData: {
            fullName: user.fullName,
            email: user.email,
            phone: user.phone,
            city: user.city,
            country: user.country,
            typeOfTravel: user.typeOfTravel,
            industrySegment: user.industrySegment,
            destinationExpertise: user.destinationExpertise,
            language: user.language,
            designation: user.designation,
            organization: user.organization,
            linkedin: user.linkedin,
          },
        },
        { status: 200 }
      );
    }

    // Step 2: Submit completed profile
    const {
      fullName,
      email,
      phone,
      city,
      country,
      typeOfTravel,
      industrySegment,
      destinationExpertise,
      language,
      designation,
      organization,
      linkedin,
      website,
      facebook,
      instagram,
      tagline,
      about,
      certifications,
      organizationName,
      certificationFiles,
      access,
      paidConsultations,
      industryDiscussions,
      yearsOfExperience,
      profilePicture,
      workSamples,
      testimonials,
      declaration,
    } = data;

    if (!declaration) {
      return NextResponse.json({ error: "Declaration must be agreed" }, { status: 400 });
    }

    // Find the user by email
    console.log("Step 2: Finding user by email:", email);
    const userData = await databases.listDocuments(
      process.env.NEXT_PUBLIC_APPWRITE_DATABASE_ID,
      process.env.NEXT_PUBLIC_APPWRITE_USERS_COLLECTION_ID,
      [Query.equal("email", email)]
    );

    if (userData.documents.length === 0) {
      return NextResponse.json({ error: "User not found" }, { status: 400 });
    }

    const userId = userData.documents[0].$id;
    console.log("Found user with ID:", userId);

    // Validate the bucket ID
    if (!process.env.NEXT_PUBLIC_APPWRITE_STORAGE_BUCKET_ID) {
      return NextResponse.json({ error: "Storage bucket ID is not configured" }, { status: 500 });
    }

    // Upload profile picture to Appwrite Storage
    let profilePictureId = null;
    if (profilePicture && profilePicture.name) {
      console.log("Uploading profile picture:", profilePicture.name);
      try {
        const file = await storage.createFile(
          process.env.NEXT_PUBLIC_APPWRITE_STORAGE_BUCKET_ID,
          ID.unique(),
          profilePicture
        );
        profilePictureId = file.$id;
        console.log("Profile picture uploaded with ID:", profilePictureId);
      } catch (error) {
        console.error("Error uploading profile picture:", error);
        return NextResponse.json({ error: "Failed to upload profile picture" }, { status: 500 });
      }
    } else if (profilePicture && !profilePicture.name) {
      return NextResponse.json({ error: "Invalid profile picture file" }, { status: 400 });
    }

    // Upload work samples to Appwrite Storage
    const workSampleIds = [];
    if (workSamples && workSamples.length > 0) {
      console.log("Uploading work samples:", workSamples.map(file => file.name));
      for (const file of workSamples) {
        if (file && file.name) {
          try {
            const uploadedFile = await storage.createFile(
              process.env.NEXT_PUBLIC_APPWRITE_STORAGE_BUCKET_ID,
              ID.unique(),
              file
            );
            workSampleIds.push(uploadedFile.$id);
            console.log("Work sample uploaded with ID:", uploadedFile.$id);
          } catch (error) {
            console.error("Error uploading work sample:", error);
            return NextResponse.json({ error: "Failed to upload work sample" }, { status: 500 });
          }
        } else {
          return NextResponse.json({ error: "Invalid work sample file" }, { status: 400 });
        }
      }
    }

    // Upload certification files to Appwrite Storage
    const certificationFileIds = [];
    if (certificationFiles && certificationFiles.length > 0) {
      console.log("Uploading certification files:", certificationFiles.map(file => file.name));
      for (const file of certificationFiles) {
        if (file && file.name) {
          try {
            const uploadedFile = await storage.createFile(
              process.env.NEXT_PUBLIC_APPWRITE_STORAGE_BUCKET_ID,
              ID.unique(),
              file
            );
            certificationFileIds.push(uploadedFile.$id);
            console.log("Certification file uploaded with ID:", uploadedFile.$id);
          } catch (error) {
            console.error("Error uploading certification file:", error);
            return NextResponse.json({ error: "Failed to upload certification file" }, { status: 500 });
          }
        } else {
          return NextResponse.json({ error: "Invalid certification file" }, { status: 400 });
        }
      }
    }

    // Update user document with all fields
    console.log("Updating user document with:", {
      fullName,
      email,
      phone,
      city,
      country,
      typeOfTravel,
      industrySegment,
      destinationExpertise,
      language,
      designation,
      organization,
      linkedin: linkedin || null,
      website: website || null,
      facebook: facebook || null,
      instagram: instagram || null,
      tagline,
      about,
      certifications,
      organizationName,
      certificationFiles: certificationFileIds,
      access,
      paidConsultations,
      industryDiscussions,
      yearsOfExperience: yearsOfExperience.toString(),
      profilePicture: profilePictureId,
      workSamples: workSampleIds,
      testimonials: testimonials || [],
      updatedAt: new Date().toISOString(),
    });

    const updatedUser = await databases.updateDocument(
      process.env.NEXT_PUBLIC_APPWRITE_DATABASE_ID,
      process.env.NEXT_PUBLIC_APPWRITE_USERS_COLLECTION_ID,
      userId,
      {
        fullName,
        email,
        phone,
        city,
        country,
        typeOfTravel,
        industrySegment,
        destinationExpertise,
        language,
        designation,
        organization,
        linkedin: linkedin || null,
        website: website || null,
        facebook: facebook || null,
        instagram: instagram || null,
        tagline,
        about,
        certifications,
        organizationName,
        certificationFiles: certificationFileIds,
        access,
        paidConsultations,
        industryDiscussions,
        yearsOfExperience: yearsOfExperience.toString(),
        profilePicture: profilePictureId,
        workSamples: workSampleIds,
        testimonials: testimonials || [],
        updatedAt: new Date().toISOString(),
      }
    );

    console.log("User document updated successfully:", updatedUser);

    // Email to Admin - Profile Completed
    await sendEmail({
      to: process.env.ADMIN_EMAIL,
      subject: `Travel Expert Profile Completed – ${fullName || email.split("@")[0]}`,
      text: `
Hi Team,

A user has completed their Travel Expert profile on Xmytravel. Below are the details:
• Name: ${fullName || "[Not Provided]"}
• Email: ${email}
• Phone Number: ${phone || "[Not Provided]"}
• City: ${city || "[Not Provided]"}
• Country: ${country || "[Not Provided]"}
• Type of Travel: ${typeOfTravel?.join(", ") || "[Not Provided]"}
• Industry Segment: ${industrySegment?.join(", ") || "[Not Provided]"}
• Destination Expertise: ${destinationExpertise?.join(", ") || "[Not Provided]"}
• Languages Spoken: ${language?.join(", ") || "[Not Provided]"}
• Current Designation: ${designation || "[Not Provided]"}
• Current Organization: ${organization || "[Not Provided]"}
• LinkedIn: ${linkedin || "[Not Provided]"}
• Tagline: ${tagline || "[Not Provided]"}
• Certified Organization: ${organizationName || "[Not Provided]"}
• Previous Consultations: ${access || "[Not Provided]"}
• Paid Consultations: ${paidConsultations || "[Not Provided]"}
• Industry Discussions: ${industryDiscussions || "[Not Provided]"}
• Years of Experience: ${yearsOfExperience || "[Not Provided]"}


The profile is ready for review and activation.

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
    <title>Travel Expert Profile Completed</title>
    <style>
        body { font-family: Arial, sans-serif; margin: 1% 12%; border:1px solid #36013F; padding: 0%; background-color: #f5f5f5; }
        .header { width: 100%; text-align: center; }
        .header img { width: 100%; height: auto; object-fit: cover; }
        .content { padding: 20px; text-align: left; }
        .gray { color: #777; }
        .content p { color: #000000; line-height: 1.6; }
        .content ul { color: #000000; line-height: 1.6; }
        .footer { margin: 0 auto; padding: 20px; }
        .footer .intro { color: #777; text-align: left; }
        .footer .signature { display: flex; align-items: center; }
        .footer .signature img { border-radius: 50%; width: 60px; height: 60px; margin-right: 20px; }
        .footer .signature .text { font-size: 14px; color: #000000; }
        .footer .signature p { margin: 5px 0; }
    </style>
</head>
<body>
    <div class="header">
        <img src="https://www.xmytravel.com/emailbanner.jpeg" alt="Xmytravel Logo" />
    </div>
    <div class="content">
        <p>Hi Team,</p>
        <p>A user has completed their Travel Expert profile on Xmytravel. Below are the details:</p>
        <ul>
            <li><strong>Name:</strong> ${fullName || "[Not Provided]"}</li>
            <li><strong>Email:</strong> ${email}</li>
            <li><strong>Phone Number:</strong> ${phone || "[Not Provided]"}</li>
            <li><strong>City:</strong> ${city || "[Not Provided]"}</li>
            <li><strong>Country:</strong> ${country || "[Not Provided]"}</li>
            <li><strong>Type of Travel:</strong> ${typeOfTravel?.join(", ") || "[Not Provided]"}</li>
            <li><strong>Industry Segment:</strong> ${industrySegment?.join(", ") || "[Not Provided]"}</li>
            <li><strong>Destination Expertise:</strong> ${destinationExpertise?.join(", ") || "[Not Provided]"}</li>
            <li><strong>Languages Spoken:</strong> ${language?.join(", ") || "[Not Provided]"}</li>
            <li><strong>Current Designation:</strong> ${designation || "[Not Provided]"}</li>
            <li><strong>Current Organization:</strong> ${organization || "[Not Provided]"}</li>
            <li><strong>LinkedIn:</strong> ${linkedin || "[Not Provided]"}</li>
            <li><strong>Website:</strong> ${website || "[Not Provided]"}</li>
            <li><strong>Facebook:</strong> ${facebook || "[Not Provided]"}</li>
            <li><strong>Instagram:</strong> ${instagram || "[Not Provided]"}</li>
            <li><strong>Tagline:</strong> ${tagline || "[Not Provided]"}</li>
            <li><strong>About:</strong> ${about || "[Not Provided]"}</li>
            <li><strong>Certifications:</strong> ${certifications || "[Not Provided]"}</li>
            <li><strong>Certified Organization:</strong> ${organizationName || "[Not Provided]"}</li>
            <li><strong>Certification Files:</strong> ${
              certificationFileIds.length > 0 ? "Uploaded (IDs: " + certificationFileIds.join(", ") + ")" : "[Not Provided]"
            }</li>
            <li><strong>Previous Consultations:</strong> ${access || "[Not Provided]"}</li>
            <li><strong>Paid Consultations:</strong> ${paidConsultations || "[Not Provided]"}</li>
            <li><strong>Industry Discussions:</strong> ${industryDiscussions || "[Not Provided]"}</li>
            <li><strong>Years of Experience:</strong> ${yearsOfExperience || "[Not Provided]"}</li>
            <li><strong>Profile Picture:</strong> ${
              profilePictureId ? "Uploaded (ID: " + profilePictureId + ")" : "[Not Provided]"
            }</li>
            <li><strong>Work Samples:</strong> ${
              workSampleIds.length > 0 ? "Uploaded (IDs: " + workSampleIds.join(", ") + ")" : "[Not Provided]"
            }</li>
            <li><strong>Testimonials:</strong> ${testimonials?.join("; ") || "[Not Provided]"}</li>
        </ul>
        <p>The profile is ready for review and activation.</p>
        <p class="gray">Best Regards,<br>Xmytravel Team</p>
    </div>
    <hr>
    <div class="footer">
        <div class="intro">
            <p><i>"At Xmytravel, we believe that the future of travel lies in trusted, expert-led guidance. This platform was built to recognize, celebrate, and empower professionals like you — the ones who shape journeys with insight and integrity."</i></p>
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

    // Email to User - Profile Completion Acknowledgment
    await sendEmail({
      to: email,
      subject: "Profile Completed Successfully – Welcome to Xmytravel!",
      text: `
Profile Completed Successfully! 🚀

Hi ${fullName || email.split("@")[0]},

Congratulations! Your Travel Expert profile on Xmytravel has been successfully completed and is now under review.

Our team will review your profile, and once approved, you’ll be an official Travel Expert on Xmytravel, ready to connect with travelers worldwide.

Thank you for joining us on this journey to shape the future of trusted travel guidance.

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
    <title>Profile Completed Successfully</title>
    <style>
        body { font-family: Arial, sans-serif; margin: 1% 12%; border:1px solid #36013F; padding: 0%; background-color: #f5f5f5; }
        .header { width: 100%; text-align: center; }
        .header img { width: 100%; height: auto; object-fit: cover; }
        .content { padding: 20px; text-align: left; }
        .gray { color: #777; }
        .content p { color: #000000; line-height: 1.6; }
        .footer { margin: 0 auto; padding: 20px; }
        .footer .intro { color: #777; text-align: left; }
        .footer .signature { display: flex; align-items: center; }
        .footer .signature img { border-radius: 50%; width: 60px; height: 60px; margin-right: 20px; }
        .footer .signature .text { font-size: 14px; color: #000000; }
        .footer .signature p { margin: 5px 0; }
    </style>
</head>
<body>
    <div class="header">
        <img src="https://www.xmytravel.com/emailbanner.jpeg" alt="Xmytravel Logo" />
    </div>
    <div class="content">
        <p>Hi ${fullName || email.split("@")[0]},</p>
        <p>Congratulations! Your Travel Expert profile on Xmytravel has been successfully completed and is now under review.</p>
        <p>Our team will review your profile, and once approved, you’ll be an official Travel Expert on Xmytravel, ready to connect with travelers worldwide.</p>
        <p>Thank you for joining us on this journey to shape the future of trusted travel guidance.</p>
        <p class="gray">Best Regards,<br>Xmytravel Team</p>
    </div>
    <hr>
    <div class="footer">
        <div class="intro">
            <p><i>"At Xmytravel, we believe that the future of travel lies in trusted, expert-led guidance. This platform was built to recognize, celebrate, and empower professionals like you — the ones who shape journeys with insight and integrity."</i></p>
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

    return NextResponse.json({ success: true, message: "Profile submitted successfully", user: updatedUser }, { status: 200 });
  } catch (error) {
    console.error("Error in profile submission:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

// GET endpoint to fetch user data by inviteCode
export async function GET(request) {
  const { searchParams } = new URL(request.url);
  const inviteCode = searchParams.get("inviteCode");

  if (!inviteCode) {
    return NextResponse.json({ error: "Invite code is required" }, { status: 400 });
  }

  try {
    const userData = await databases.listDocuments(
      process.env.NEXT_PUBLIC_APPWRITE_DATABASE_ID,
      process.env.NEXT_PUBLIC_APPWRITE_USERS_COLLECTION_ID,
      [Query.equal("inviteCode", inviteCode)]
    );

    if (userData.documents.length === 0) {
      return NextResponse.json({ success: false, error: "User not found" }, { status: 404 });
    }

    const user = userData.documents[0];

    return NextResponse.json({
      success: true,
      userData: {
        fullName: user.fullName,
        email: user.email,
        phone: user.phone,
        city: user.city,
        country: user.country,
        typeOfTravel: user.typeOfTravel,
        industrySegment: user.industrySegment,
        destinationExpertise: user.destinationExpertise,
        language: user.language,
        designation: user.designation,
        organization: user.organization,
        linkedin: user.linkedin,
        tagline: user.tagline,
        about: user.about,
        certifications: user.certifications,
        organizationName: user.organizationName,
        certificationFiles: user.certificationFiles,
        access: user.access,
        paidConsultations: user.paidConsultations,
        industryDiscussions: user.industryDiscussions,
        yearsOfExperience: user.yearsOfExperience,
        profilePicture: user.profilePicture,
        workSamples: user.workSamples,
        testimonials: user.testimonials,
        inviteCode: user.inviteCode,
        createdAt: user.createdAt,
        updatedAt: user.updatedAt,
      },
      profilePictureUrl: user.profilePicture
        ? `https://cloud.appwrite.io/v1/storage/buckets/${process.env.NEXT_PUBLIC_APPWRITE_STORAGE_BUCKET_ID}/files/${user.profilePicture}/view?project=${process.env.NEXT_PUBLIC_APPWRITE_PROJECT_ID}`
        : null,
      workSampleUrls: user.workSamples
        ? user.workSamples.map(fileId =>
            `https://cloud.appwrite.io/v1/storage/buckets/${process.env.NEXT_PUBLIC_APPWRITE_STORAGE_BUCKET_ID}/files/${fileId}/view?project=${process.env.NEXT_PUBLIC_APPWRITE_PROJECT_ID}`
          )
        : [],
      certificationFileUrls: user.certificationFiles
        ? user.certificationFiles.map(fileId =>
            `https://cloud.appwrite.io/v1/storage/buckets/${process.env.NEXT_PUBLIC_APPWRITE_STORAGE_BUCKET_ID}/files/${fileId}/view?project=${process.env.NEXT_PUBLIC_APPWRITE_PROJECT_ID}`
          )
        : [],
    }, { status: 200 });
  } catch (error) {
    console.error("Error fetching user data:", error);
    return NextResponse.json({ success: false, error: "Failed to fetch user data" }, { status: 500 });
  }
}




// import { databases, ID, Query, client } from "@/lib/appwrite";
// import { Storage } from "appwrite";
// import { NextResponse } from "next/server";
// import { sendEmail } from "@/lib/email";

// Appwrite Storage
// const storage = new Storage(client);

// export async function POST(request) {
//   try {
//     // Check Content-Type to determine how to parse
//     const contentType = request.headers.get("content-type");
//     let data;

//     if (contentType && contentType.includes("application/json")) {
//       data = await request.json();
//     } else if (contentType && contentType.includes("multipart/form-data")) {
//       const formData = await request.formData();
//       data = {};

//       // Convert FormData to a plain object
//       for (const [key, value] of formData.entries()) {
//         if (key === "workSamples" || key === "certificationFiles") {
//           if (!data[key]) data[key] = [];
//           data[key].push(value);
//         } else if (["typeOfTravel", "industrySegment", "destinationExpertise", "language", "testimonials"].includes(key)) {
//           data[key] = value ? JSON.parse(value) : [];
//         } else if (key === "yearsOfExperience") {
//           data[key] = value.toString();
//         } else if (key === "declaration") {
//           data[key] = value === "true";
//         } else {
//           data[key] = value;
//         }
//       }
//     } else {
//       return NextResponse.json({ error: "Unsupported Content-Type" }, { status: 400 });
//     }

//     console.log("Received data:", data);

//     if (!data.inviteCode) {
//       return NextResponse.json({ error: "Invite code is required" }, { status: 400 });
//     }

//     if (!data.tagline && !data.about) {
//       console.log("Step 1: Fetching pre-filled data for inviteCode:", data.inviteCode);
//       const userData = await databases.listDocuments(
//         process.env.NEXT_PUBLIC_APPWRITE_DATABASE_ID,
//         process.env.NEXT_PUBLIC_APPWRITE_USERS_COLLECTION_ID,
//         [Query.equal("inviteCode", data.inviteCode)]
//       );

//       if (userData.documents.length === 0) {
//         return NextResponse.json({ error: "Invalid invite code" }, { status: 400 });
//       }

//       const user = userData.documents[0];
//       return NextResponse.json(
//         {
//           success: true,
//           userData: {
//             fullName: user.fullName,
//             email: user.email,
//             phone: user.phone,
//             city: user.city,
//             country: user.country,
//             typeOfTravel: user.typeOfTravel,
//             industrySegment: user.industrySegment,
//             destinationExpertise: user.destinationExpertise,
//             language: user.language,
//             designation: user.designation,
//             organization: user.organization,
//             linkedin: user.linkedin,
//           },
//         },
//         { status: 200 }
//       );
//     }

//     // Step 4: Submit completed profile
//     const {
//       fullName,
//       email,
//       phone,
//       city,
//       country,
//       typeOfTravel,
//       industrySegment,
//       destinationExpertise,
//       language,
//       designation,
//       organization,
//       linkedin,
//       website,
//       facebook,
//       instagram,
//       tagline,
//       about,
//       certifications,
//       organizationName,
//       certificationFiles,
//       access,
//       paidConsultations,
//       industryDiscussions,
//       yearsOfExperience,
//       profilePicture,
//       workSamples,
//       testimonials,
//       declaration,
//     } = data;

//     if (!declaration) {
//       return NextResponse.json({ error: "Declaration must be agreed" }, { status: 400 });
//     }

//     // Find the user by email
//     console.log("Step 4: Finding user by email:", email);
//     const userData = await databases.listDocuments(
//       process.env.NEXT_PUBLIC_APPWRITE_DATABASE_ID,
//       process.env.NEXT_PUBLIC_APPWRITE_USERS_COLLECTION_ID,
//       [Query.equal("email", email)]
//     );

//     if (userData.documents.length === 0) {
//       return NextResponse.json({ error: "User not found" }, { status: 400 });
//     }

//     const userId = userData.documents[0].$id;
//     console.log("Found user with ID:", userId);

//     // Validate the bucket ID
//     if (!process.env.NEXT_PUBLIC_APPWRITE_STORAGE_BUCKET_ID) {
//       return NextResponse.json({ error: "Storage bucket ID is not configured" }, { status: 500 });
//     }

//     // Upload profile picture to Appwrite Storage
//     let profilePictureId = null;
//     if (profilePicture && profilePicture.name) {
//       console.log("Uploading profile picture:", profilePicture.name);
//       try {
//         const file = await storage.createFile(
//           process.env.NEXT_PUBLIC_APPWRITE_STORAGE_BUCKET_ID,
//           ID.unique(),
//           profilePicture
//         );
//         profilePictureId = file.$id;
//         console.log("Profile picture uploaded with ID:", profilePictureId);
//       } catch (error) {
//         console.error("Error uploading profile picture:", error);
//         return NextResponse.json({ error: "Failed to upload profile picture" }, { status: 500 });
//       }
//     } else if (profilePicture && !profilePicture.name) {
//       return NextResponse.json({ error: "Invalid profile picture file" }, { status: 400 });
//     }

//     // Upload work samples to Appwrite Storage
//     const workSampleIds = [];
//     if (workSamples && workSamples.length > 0) {
//       console.log("Uploading work samples:", workSamples.map(file => file.name));
//       for (const file of workSamples) {
//         if (file && file.name) {
//           try {
//             const uploadedFile = await storage.createFile(
//               process.env.NEXT_PUBLIC_APPWRITE_STORAGE_BUCKET_ID,
//               ID.unique(),
//               file
//             );
//             workSampleIds.push(uploadedFile.$id);
//             console.log("Work sample uploaded with ID:", uploadedFile.$id);
//           } catch (error) {
//             console.error("Error uploading work sample:", error);
//             return NextResponse.json({ error: "Failed to upload work sample" }, { status: 500 });
//           }
//         } else {
//           return NextResponse.json({ error: "Invalid work sample file" }, { status: 400 });
//         }
//       }
//     }

//     // Upload certification files to Appwrite Storage
//     const certificationFileIds = [];
//     if (certificationFiles && certificationFiles.length > 0) {
//       console.log("Uploading certification files:", certificationFiles.map(file => file.name));
//       for (const file of certificationFiles) {
//         if (file && file.name) {
//           try {
//             const uploadedFile = await storage.createFile(
//               process.env.NEXT_PUBLIC_APPWRITE_STORAGE_BUCKET_ID,
//               ID.unique(),
//               file
//             );
//             certificationFileIds.push(uploadedFile.$id);
//             console.log("Certification file uploaded with ID:", uploadedFile.$id);
//           } catch (error) {
//             console.error("Error uploading certification file:", error);
//             return NextResponse.json({ error: "Failed to upload certification file" }, { status: 500 });
//           }
//         } else {
//           return NextResponse.json({ error: "Invalid certification file" }, { status: 400 });
//         }
//       }
//     }

//     // Update user document with all fields
//     console.log("Updating user document with:", {
//       fullName,
//       email,
//       phone,
//       city,
//       country,
//       typeOfTravel,
//       industrySegment,
//       destinationExpertise,
//       language,
//       designation,
//       organization,
//       linkedin: linkedin || null,
//       website: website || null,
//       facebook: facebook || null,
//       instagram: instagram || null,
//       tagline,
//       about,
//       certifications,
//       organizationName,
//       certificationFiles: certificationFileIds,
//       access,
//       paidConsultations,
//       industryDiscussions,
//       yearsOfExperience: yearsOfExperience.toString(),
//       profilePicture: profilePictureId,
//       workSamples: workSampleIds,
//       testimonials: testimonials || [],
//       updatedAt: new Date().toISOString(),
//     });

//     const updatedUser = await databases.updateDocument(
//       process.env.NEXT_PUBLIC_APPWRITE_DATABASE_ID,
//       process.env.NEXT_PUBLIC_APPWRITE_USERS_COLLECTION_ID,
//       userId,
//       {
//         fullName,
//         email,
//         phone,
//         city,
//         country,
//         typeOfTravel,
//         industrySegment,
//         destinationExpertise,
//         language,
//         designation,
//         organization,
//         linkedin: linkedin || null,
//         website: website || null,
//         facebook: facebook || null,
//         instagram: instagram || null,
//         tagline,
//         about,
//         certifications,
//         organizationName,
//         certificationFiles: certificationFileIds,
//         access,
//         paidConsultations,
//         industryDiscussions,
//         yearsOfExperience: yearsOfExperience.toString(),
//         profilePicture: profilePictureId,
//         workSamples: workSampleIds,
//         testimonials: testimonials || [],
//         updatedAt: new Date().toISOString(),
//       }
//     );

//     console.log("User document updated successfully:", updatedUser);

//     // Email to Admin - Profile Completed
//     await sendEmail({
//       to: process.env.ADMIN_EMAIL,
//       subject: `Travel Expert Profile Completed – ${fullName || email.split("@")[0]}`,
//       text: `
// Hi Team,

// A user has completed their Travel Expert profile on Xmytravel. Below are the details:
// • Name: ${fullName || "[Not Provided]"}
// • Email: ${email}
// • Phone Number: ${phone || "[Not Provided]"}
// • City: ${city || "[Not Provided]"}
// • Country: ${country || "[Not Provided]"}
// • Type of Travel: ${typeOfTravel?.join(", ") || "[Not Provided]"}
// • Industry Segment: ${industrySegment?.join(", ") || "[Not Provided]"}
// • Destination Expertise: ${destinationExpertise?.join(", ") || "[Not Provided]"}
// • Languages Spoken: ${language?.join(", ") || "[Not Provided]"}
// • Current Designation: ${designation || "[Not Provided]"}
// • Current Organization: ${organization || "[Not Provided]"}
// • LinkedIn: ${linkedin || "[Not Provided]"}
// • Tagline: ${tagline || "[Not Provided]"}
// • Certified Organization: ${organizationName || "[Not Provided]"}
// • Previous Consultations: ${access || "[Not Provided]"}
// • Paid Consultations: ${paidConsultations || "[Not Provided]"}
// • Industry Discussions: ${industryDiscussions || "[Not Provided]"}
// • Years of Experience: ${yearsOfExperience || "[Not Provided]"}

// The profile is ready for review and activation.

// Warm regards,
// Xmytravel Team
// info@xmytravel.com
//       `.trim(),
//       html: `
// <!DOCTYPE html>
// <html lang="en">
// <head>
//     <meta charset="UTF-8">
//     <meta name="viewport" content="width=device-width, initial-scale=1.0">
//     <title>Travel Expert Profile Completed</title>
//     <style>
//         body { font-family: Arial, sans-serif; margin: 1% 12%; border:1px solid #36013F; padding: 0%; background-color: #f5f5f5; }
//         .header { width: 100%; text-align: center; }
//         .header img { width: 100%; height: auto; object-fit: cover; }
//         .content { padding: 20px; text-align: left; }
//         .gray { color: #777; }
//         .content p { color: #000000; line-height: 1.6; }
//         .content ul { color: #000000; line-height: 1.6; }
//         .footer { margin: 0 auto; padding: 20px; }
//         .footer .intro { color: #777; text-align: left; }
//         .footer .signature { display: flex; align-items: center; }
//         .footer .signature img { border-radius: 50%; width: 60px; height: 60px; margin-right: 20px; }
//         .footer .signature .text { font-size: 14px; color: #000000; }
//         .footer .signature p { margin: 5px 0; }
//     </style>
// </head>
// <body>
//     <div class="header">
//         <img src="https://www.xmytravel.com/emailbanner.jpeg" alt="Xmytravel Logo" />
//     </div>
//     <div class="content">
//         <p>Hi Team,</p>
//         <p>A user has completed their Travel Expert profile on Xmytravel. Below are the details:</p>
//         <ul>
//             <li><strong>Name:</strong> ${fullName || "[Not Provided]"}</li>
//             <li><strong>Email:</strong> ${email}</li>
//             <li><strong>Phone Number:</strong> ${phone || "[Not Provided]"}</li>
//             <li><strong>City:</strong> ${city || "[Not Provided]"}</li>
//             <li><strong>Country:</strong> ${country || "[Not Provided]"}</li>
//             <li><strong>Type of Travel:</strong> ${typeOfTravel?.join(", ") || "[Not Provided]"}</li>
//             <li><strong>Industry Segment:</strong> ${industrySegment?.join(", ") || "[Not Provided]"}</li>
//             <li><strong>Destination Expertise:</strong> ${destinationExpertise?.join(", ") || "[Not Provided]"}</li>
//             <li><strong>Languages Spoken:</strong> ${language?.join(", ") || "[Not Provided]"}</li>
//             <li><strong>Current Designation:</strong> ${designation || "[Not Provided]"}</li>
//             <li><strong>Current Organization:</strong> ${organization || "[Not Provided]"}</li>
//             <li><strong>LinkedIn:</strong> ${linkedin || "[Not Provided]"}</li>
//             <li><strong>Website:</strong> ${website || "[Not Provided]"}</li>
//             <li><strong>Facebook:</strong> ${facebook || "[Not Provided]"}</li>
//             <li><strong>Instagram:</strong> ${instagram || "[Not Provided]"}</li>
//             <li><strong>Tagline:</strong> ${tagline || "[Not Provided]"}</li>
//             <li><strong>About:</strong> ${about || "[Not Provided]"}</li>
//             <li><strong>Certifications:</strong> ${certifications || "[Not Provided]"}</li>
//             <li><strong>Certified Organization:</strong> ${organizationName || "[Not Provided]"}</li>
//             <li><strong>Certification Files:</strong> ${
//               certificationFileIds.length > 0 ? "Uploaded (IDs: " + certificationFileIds.join(", ") + ")" : "[Not Provided]"
//             }</li>
//             <li><strong>Previous Consultations:</strong> ${access || "[Not Provided]"}</li>
//             <li><strong>Paid Consultations:</strong> ${paidConsultations || "[Not Provided]"}</li>
//             <li><strong>Industry Discussions:</strong> ${industryDiscussions || "[Not Provided]"}</li>
//             <li><strong>Years of Experience:</strong> ${yearsOfExperience || "[Not Provided]"}</li>
//             <li><strong>Profile Picture:</strong> ${
//               profilePictureId ? "Uploaded (ID: " + profilePictureId + ")" : "[Not Provided]"
//             }</li>
//             <li><strong>Work Samples:</strong> ${
//               workSampleIds.length > 0 ? "Uploaded (IDs: " + workSampleIds.join(", ") + ")" : "[Not Provided]"
//             }</li>
//             <li><strong>Testimonials:</strong> ${testimonials?.join("; ") || "[Not Provided]"}</li>
//         </ul>
//         <p>The profile is ready for review and activation.</p>
//         <p class="gray">Best Regards,<br>Xmytravel Team</p>
//     </div>
//     <hr>
//     <div class="footer">
//         <div class="intro">
//             <p><i>"At Xmytravel, we believe that the future of travel lies in trusted, expert-led guidance. This platform was built to recognize, celebrate, and empower professionals like you — the ones who shape journeys with insight and integrity."</i></p>
//         </div>
//         <div class="signature">
//             <img src="https://www.xmytravel.com/profile%20photo.png" alt="Xmytravel Team Photo" />
//             <div class="text">
//                 <p>Rishabh Vyas<br> Founder, Xmytravel</p>
//             </div>
//         </div>
//     </div>
// </body>
// </html>
//       `.trim(),
//     });

//     // Email to User - Profile Completion Acknowledgment
//     await sendEmail({
//       to: email,
//       subject: "Profile Completed Successfully – Welcome to Xmytravel!",
//       text: `
// Profile Completed Successfully! 🚀

// Hi ${fullName || email.split("@")[0]},

// Congratulations! Your Travel Expert profile on Xmytravel has been successfully completed and is now under review.

// Our team will review your profile, and once approved, you’ll be an official Travel Expert on Xmytravel, ready to connect with travelers worldwide.

// Thank you for joining us on this journey to shape the future of trusted travel guidance.

// Warm regards,
// Xmytravel Team
// info@xmytravel.com
//       `.trim(),
//       html: `
// <!DOCTYPE html>
// <html lang="en">
// <head>
//     <meta charset="UTF-8">
//     <meta name="viewport" content="width=device-width, initial-scale=1.0">
//     <title>Profile Completed Successfully</title>
//     <style>
//         body { font-family: Arial, sans-serif; margin: 1% 12%; border:1px solid #36013F; padding: 0%; background-color: #f5f5f5; }
//         .header { width: 100%; text-align: center; }
//         .header img { width: 100%; height: auto; object-fit: cover; }
//         .content { padding: 20px; text-align: left; }
//         .gray { color: #777; }
//         .content p { color: #000000; line-height: 1.6; }
//         .footer { margin: 0 auto; padding: 20px; }
//         .footer .intro { color: #777; text-align: left; }
//         .footer .signature { display: flex; align-items: center; }
//         .footer .signature img { border-radius: 50%; width: 60px; height: 60px; margin-right: 20px; }
//         .footer .signature .text { font-size: 14px; color: #000000; }
//         .footer .signature p { margin: 5px 0; }
//     </style>
// </head>
// <body>
//     <div class="header">
//         <img src="https://www.xmytravel.com/emailbanner.jpeg" alt="Xmytravel Logo" />
//     </div>
//     <div class="content">
//         <p>Hi ${fullName || email.split("@")[0]},</p>
//         <p>Congratulations! Your Travel Expert profile on Xmytravel has been successfully completed and is now under review.</p>
//         <p>Our team will review your profile, and once approved, you’ll be an official Travel Expert on Xmytravel, ready to connect with travelers worldwide.</p>
//         <p>Thank you for joining us on this journey to shape the future of trusted travel guidance.</p>
//         <p class="gray">Best Regards,<br>Xmytravel Team</p>
//     </div>
//     <hr>
//     <div class="footer">
//         <div class="intro">
//             <p><i>"At Xmytravel, we believe that the future of travel lies in trusted, expert-led guidance. This platform was built to recognize, celebrate, and empower professionals like you — the ones who shape journeys with insight and integrity."</i></p>
//         </div>
//         <div class="signature">
//             <img src="https://www.xmytravel.com/profile%20photo.png" alt="Xmytravel Team Photo" />
//             <div class="text">
//                 <p>Rishabh Vyas<br> Founder, Xmytravel</p>
//             </div>
//         </div>
//     </div>
// </body>
// </html>
//       `.trim(),
//     });

//     return NextResponse.json({ success: true, message: "Profile submitted successfully", user: updatedUser }, { status: 200 });
//   } catch (error) {
//     console.error("Error in profile submission:", error);
//     return NextResponse.json({ error: error.message }, { status: 500 });
//   }
// }

// // GET endpoint to fetch user data by inviteCode
// export async function GET(request) {
//   const { searchParams } = new URL(request.url);
//   const inviteCode = searchParams.get("inviteCode");

//   if (!inviteCode) {
//     return NextResponse.json({ error: "Invite code is required" }, { status: 400 });
//   }

//   try {
//     const userData = await databases.listDocuments(
//       process.env.NEXT_PUBLIC_APPWRITE_DATABASE_ID,
//       process.env.NEXT_PUBLIC_APPWRITE_USERS_COLLECTION_ID,
//       [Query.equal("inviteCode", inviteCode)]
//     );

//     if (userData.documents.length === 0) {
//       return NextResponse.json({ success: false, error: "User not found" }, { status: 404 });
//     }

//     const user = userData.documents[0];

//     return NextResponse.json({
//       success: true,
//       userData: {
//         fullName: user.fullName,
//         email: user.email,
//         phone: user.phone,
//         city: user.city,
//         country: user.country,
//         typeOfTravel: user.typeOfTravel,
//         industrySegment: user.industrySegment,
//         destinationExpertise: user.destinationExpertise,
//         language: user.language,
//         designation: user.designation,
//         organization: user.organization,
//         linkedin: user.linkedin,
//         tagline: user.tagline,
//         about: user.about,
//         certifications: user.certifications,
//         organizationName: user.organizationName,
//         certificationFiles: user.certificationFiles,
//         access: user.access,
//         paidConsultations: user.paidConsultations,
//         industryDiscussions: user.industryDiscussions,
//         yearsOfExperience: user.yearsOfExperience,
//         profilePicture: user.profilePicture,
//         workSamples: user.workSamples,
//         testimonials: user.testimonials,
//         inviteCode: user.inviteCode,
//         createdAt: user.createdAt,
//         updatedAt: user.updatedAt,
//       },
//       profilePictureUrl: user.profilePicture
//         ? `https://cloud.appwrite.io/v1/storage/buckets/${process.env.NEXT_PUBLIC_APPWRITE_STORAGE_BUCKET_ID}/files/${user.profilePicture}/view?project=${process.env.NEXT_PUBLIC_APPWRITE_PROJECT_ID}`
//         : null,
//       workSampleUrls: user.workSamples
//         ? user.workSamples.map(fileId =>
//             `https://cloud.appwrite.io/v1/storage/buckets/${process.env.NEXT_PUBLIC_APPWRITE_STORAGE_BUCKET_ID}/files/${fileId}/view?project=${process.env.NEXT_PUBLIC_APPWRITE_PROJECT_ID}`
//           )
//         : [],
//       certificationFileUrls: user.certificationFiles
//         ? user.certificationFiles.map(fileId =>
//             `https://cloud.appwrite.io/v1/storage/buckets/${process.env.NEXT_PUBLIC_APPWRITE_STORAGE_BUCKET_ID}/files/${fileId}/view?project=${process.env.NEXT_PUBLIC_APPWRITE_PROJECT_ID}`
//           )
//         : [],
//     }, { status: 200 });
//   } catch (error) {
//     console.error("Error fetching user data:", error);
//     return NextResponse.json({ success: false, error: "Failed to fetch user data" }, { status: 500 });
//   }
// }