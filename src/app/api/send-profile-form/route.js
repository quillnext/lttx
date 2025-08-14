

<<<<<<< HEAD
// // import { NextResponse } from "next/server";
// // import { getFirestore, collection, addDoc, doc, updateDoc, serverTimestamp, query, where, getDocs } from "firebase/firestore";
// // import { app } from "@/lib/firebase";
// // import { sendProfileSubmissionEmails } from "@/app/utils/sendProfileSubmissionEmails";

// // const db = getFirestore(app);

// // const generateRandomChars = () => {
// //   const chars = "ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789";
// //   let result = "";
// //   for (let i = 0; i < 2; i++) {
// //     result += chars.charAt(Math.floor(Math.random() * chars.length));
// //   }
// //   return result;
// // };

// // export async function POST(req) {
// //   try {
// //     const body = await req.json();
// //     const {
// //       username,
// //       fullName,
// //       email,
// //       phone,
// //       dateOfBirth, 
// //       tagline,
// //       location,
// //       languages,
// //       responseTime,
// //       pricing,
// //       about,
// //       services,
// //       regions,
// //       experience,
// //       certifications,
// //       referred,
// //       referralCode,
// //       profileId,
// //       photo,
// //       leadId,
// //     } = body;

  
// //     if (!email || !fullName || !phone || (!profileId && !username)) {
// //       return NextResponse.json({ error: "Missing required fields: email, fullName, phone, username" }, { status: 400 });
// //     }

   
// //     if (!profileId && !["Yes", "No"].includes(referred)) {
// //       return NextResponse.json({ error: "Referred must be 'Yes' or 'No'" }, { status: 400 });
// //     }

// //     if (!profileId) {
     
// //       const profilesQuery = query(collection(db, 'Profiles'), where('username', '==', username));
// //       const profileRequestsQuery = query(collection(db, 'ProfileRequests'), where('username', '==', username));
// //       const [profilesSnap, profileRequestsSnap] = await Promise.all([
// //         getDocs(profilesQuery),
// //         getDocs(profileRequestsQuery),
// //       ]);
// //       if (!profilesSnap.empty || !profileRequestsSnap.empty) {
// //         return NextResponse.json({ error: "Username is already taken" }, { status: 400 });
// //       }

     
// //       if (!/^[a-zA-Z][a-zA-Z0-9_]{2,19}$/.test(username)) {
// //         return NextResponse.json({ error: "Username must be 3-20 characters, start with a letter, and contain only letters, numbers, or underscores" }, { status: 400 });
// //       }

     
// //       const emailQuery = query(collection(db, 'Profiles'), where('email', '==', email));
// //       const emailSnap = await getDocs(emailQuery);
// //       if (!emailSnap.empty) {
// //         return NextResponse.json({ error: "User already exists. No duplicate profile allowed." }, { status: 400 });
// //       }

     
// //       if (referred === "Yes") {
// //         if (!referralCode) {
// //           return NextResponse.json({ error: "Referral code is required when referred is 'Yes'" }, { status: 400 });
// //         }
// //         const codeQuery = query(collection(db, 'Profiles'), where('generatedReferralCode', '==', referralCode));
// //         const codeSnap = await getDocs(codeQuery);
// //         if (codeSnap.empty) {
// //           return NextResponse.json({ error: "Invalid referral code" }, { status: 400 });
// //         }
// //       }
// //     }

   
// //     let generatedReferralCode = null;
// //     if (!profileId) {
// //       let isUnique = false;
// //       while (!isUnique) {
// //         generatedReferralCode = `REFX${generateRandomChars()}`;
// //         const duplicateReferral = await getDocs(query(collection(db, 'Profiles'), where('generatedReferralCode', '==', generatedReferralCode)));
// //         isUnique = duplicateReferral.empty;
// //       }
// //     }

// //     const profileData = {
// //       username,
// //       fullName,
// //       email,
// //       phone,
// //       dateOfBirth: dateOfBirth || '', 
// //       tagline,
// //       location,
// //       languages,
// //       responseTime,
// //       pricing,
// //       about,
// //       services,
// //       regions,
// //       experience,
// //       certifications,
// //       referred: referred || 'No', 
// //       referralCode: referred === 'Yes' ? referralCode : null, 
// //       photo,
// //       timestamp: serverTimestamp(),
// //       generatedReferralCode: profileId ? undefined : generatedReferralCode,
// //       leadId: leadId || null,
// //     };

// //     let savedProfileId = profileId;
// //     if (profileId) {
// //       delete profileData.username;
// //       delete profileData.generatedReferralCode;
// //       await updateDoc(doc(db, "Profiles", profileId), profileData);
// //     } else {
// //       const docRef = await addDoc(collection(db, "ProfileRequests"), profileData);
// //       savedProfileId = docRef.id;
// //     }

// //     // Send emails to user and admin
// //     await sendProfileSubmissionEmails({
// //       ...profileData,
// //       profileId: savedProfileId,
// //       generatedReferralCode: generatedReferralCode || "N/A",
// //     });

// //     const slug = `${username.toLowerCase().replace(/\s+/g, '-')}`;

// //     return NextResponse.json({ success: true, profileId: savedProfileId, slug }, { status: 200 });
// //   } catch (error) {
// //     console.error("Error in send-profile-form:", error);
// //     return NextResponse.json({ error: error.message || "Failed to process profile submission" }, { status: 500 });
// //   }
// // }





=======
>>>>>>> parent of 7c95c39 (change aemail api route)
import { NextResponse } from "next/server";
import { getFirestore, collection, addDoc, doc, updateDoc, serverTimestamp, query, where, getDocs } from "firebase/firestore";
import { app } from "@/lib/firebase";
import { sendProfileSubmissionEmails } from "@/app/utils/sendProfileSubmissionEmails";

const db = getFirestore(app);

const generateReferralCode = () => {
  const timestamp = Date.now().toString().slice(-4);
  const rand = Math.random().toString(36).substring(2, 2).toUpperCase();
  return `REFX${timestamp}${rand}`;
};

export async function POST(req) {
  try {
    const body = await req.json();
    const {
      username,
      fullName,
      email,
      phone,
      dateOfBirth, 
      tagline,
      location,
      languages,
      responseTime,
      pricing,
      about,
      services,
      regions,
      experience,
      certifications,
      referred,
      referralCode,
      profileId,
      photo,
      leadId,
    } = body;

<<<<<<< HEAD
    // Step 1: Basic field validation before response
=======
  
>>>>>>> parent of 7c95c39 (change aemail api route)
    if (!email || !fullName || !phone || (!profileId && !username)) {
      return NextResponse.json({ error: "Missing required fields: email, fullName, phone, username" }, { status: 400 });
    }

<<<<<<< HEAD
    // Step 2: Immediately respond to frontend (accepted for processing)
    const response = NextResponse.json({ success: true, message: "Profile is being processed..." }, { status: 202 });

    // Step 3: Process in background
    (async () => {
      try {
        // Profile creation path
        let generatedReferralCode = null;
        if (!profileId) {
          // Validate "referred" field
          if (!["Yes", "No"].includes(referred)) throw new Error("Referred must be 'Yes' or 'No'");

          // Check if username already exists
          const [profilesSnap, profileRequestsSnap] = await Promise.all([
            getDocs(query(collection(db, 'Profiles'), where('username', '==', username))),
            getDocs(query(collection(db, 'ProfileRequests'), where('username', '==', username)))
          ]);
          if (!profilesSnap.empty || !profileRequestsSnap.empty) throw new Error("Username is already taken");

          if (!/^[a-zA-Z][a-zA-Z0-9_]{2,19}$/.test(username)) {
            throw new Error("Username must be 3-20 characters, start with a letter, and contain only letters, numbers, or underscores");
          }

          // Check for duplicate email
          const emailSnap = await getDocs(query(collection(db, 'Profiles'), where('email', '==', email)));
          if (!emailSnap.empty) throw new Error("User already exists. No duplicate profile allowed.");

          // Referral code check
          if (referred === "Yes") {
            if (!referralCode) throw new Error("Referral code is required when referred is 'Yes'");
            const codeSnap = await getDocs(query(collection(db, 'Profiles'), where('generatedReferralCode', '==', referralCode)));
            if (codeSnap.empty) throw new Error("Invalid referral code");
          }

          // Generate referral code once (no retry logic)
          generatedReferralCode = generateReferralCode();
        }

        // Construct profile data
        const profileData = {
          username,
          fullName,
          email,
          phone,
          dateOfBirth: dateOfBirth || '',
          tagline,
          location,
          languages,
          responseTime,
          pricing,
          about,
          services,
          regions,
          experience,
          certifications,
          referred: referred || 'No',
          referralCode: referred === 'Yes' ? referralCode : null,
          photo,
          timestamp: serverTimestamp(),
          generatedReferralCode: profileId ? undefined : generatedReferralCode,
          leadId: leadId || null,
        };

        let savedProfileId = profileId;
        if (profileId) {
          delete profileData.username;
          delete profileData.generatedReferralCode;
          await updateDoc(doc(db, "Profiles", profileId), profileData);
        } else {
          const docRef = await addDoc(collection(db, "ProfileRequests"), profileData);
          savedProfileId = docRef.id;
        }

        const slug = `${username?.toLowerCase().replace(/\s+/g, '-')}`;

        // Send emails
        await sendProfileSubmissionEmails({
          ...profileData,
          profileId: savedProfileId,
          generatedReferralCode: generatedReferralCode || "N/A",
        });

        console.log("Profile processed and emails sent.");

      } catch (backgroundErr) {
        console.error("Background processing error:", backgroundErr.message);
        // Optional: save to logs or retry queue
      }
    })();

    return response;

  } catch (error) {
    console.error("Immediate error in form submit:", error);
    return NextResponse.json(
      { error: error.message || "Failed to process profile submission" },
      { status: 500 }
    );
=======
   
    if (!profileId && !["Yes", "No"].includes(referred)) {
      return NextResponse.json({ error: "Referred must be 'Yes' or 'No'" }, { status: 400 });
    }

    if (!profileId) {
     
      const profilesQuery = query(collection(db, 'Profiles'), where('username', '==', username));
      const profileRequestsQuery = query(collection(db, 'ProfileRequests'), where('username', '==', username));
      const [profilesSnap, profileRequestsSnap] = await Promise.all([
        getDocs(profilesQuery),
        getDocs(profileRequestsQuery),
      ]);
      if (!profilesSnap.empty || !profileRequestsSnap.empty) {
        return NextResponse.json({ error: "Username is already taken" }, { status: 400 });
      }

     
      if (!/^[a-zA-Z][a-zA-Z0-9_]{2,19}$/.test(username)) {
        return NextResponse.json({ error: "Username must be 3-20 characters, start with a letter, and contain only letters, numbers, or underscores" }, { status: 400 });
      }

     
      const emailQuery = query(collection(db, 'Profiles'), where('email', '==', email));
      const emailSnap = await getDocs(emailQuery);
      if (!emailSnap.empty) {
        return NextResponse.json({ error: "User already exists. No duplicate profile allowed." }, { status: 400 });
      }

     
      if (referred === "Yes") {
        if (!referralCode) {
          return NextResponse.json({ error: "Referral code is required when referred is 'Yes'" }, { status: 400 });
        }
        const codeQuery = query(collection(db, 'Profiles'), where('generatedReferralCode', '==', referralCode));
        const codeSnap = await getDocs(codeQuery);
        if (codeSnap.empty) {
          return NextResponse.json({ error: "Invalid referral code" }, { status: 400 });
        }
      }
    }

   
    let generatedReferralCode = null;
    if (!profileId) {
      let isUnique = false;
      while (!isUnique) {
        generatedReferralCode = `REFX${generateRandomChars()}`;
        const duplicateReferral = await getDocs(query(collection(db, 'Profiles'), where('generatedReferralCode', '==', generatedReferralCode)));
        isUnique = duplicateReferral.empty;
      }
    }

    const profileData = {
      username,
      fullName,
      email,
      phone,
      dateOfBirth: dateOfBirth || '', 
      tagline,
      location,
      languages,
      responseTime,
      pricing,
      about,
      services,
      regions,
      experience,
      certifications,
      referred: referred || 'No', 
      referralCode: referred === 'Yes' ? referralCode : null, 
      photo,
      timestamp: serverTimestamp(),
      generatedReferralCode: profileId ? undefined : generatedReferralCode,
      leadId: leadId || null,
    };

    let savedProfileId = profileId;
    if (profileId) {
      delete profileData.username;
      delete profileData.generatedReferralCode;
      await updateDoc(doc(db, "Profiles", profileId), profileData);
    } else {
      const docRef = await addDoc(collection(db, "ProfileRequests"), profileData);
      savedProfileId = docRef.id;
    }

    // Send emails to user and admin
    await sendProfileSubmissionEmails({
      ...profileData,
      profileId: savedProfileId,
      generatedReferralCode: generatedReferralCode || "N/A",
    });

    const slug = `${username.toLowerCase().replace(/\s+/g, '-')}`;

    return NextResponse.json({ success: true, profileId: savedProfileId, slug }, { status: 200 });
  } catch (error) {
    console.error("Error in send-profile-form:", error);
    return NextResponse.json({ error: error.message || "Failed to process profile submission" }, { status: 500 });
>>>>>>> parent of 7c95c39 (change aemail api route)
  }
}