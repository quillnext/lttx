
// import { adminAuth } from "@/lib/firebaseAdmin";
// import { NextResponse } from "next/server";

// export async function GET(request) {
//   const { searchParams } = new URL(request.url);
//   const uid = searchParams.get("uid");
//   const secret = searchParams.get("secret");

//   // Basic security check: Use the admin password as the secret
//   if (secret !== process.env.NEXT_PUBLIC_ADMIN_PASS) {
//     return NextResponse.json({ error: "Unauthorized. Invalid secret." }, { status: 401 });
//   }

//   if (!uid) {
//     return NextResponse.json({ error: "UID is required." }, { status: 400 });
//   }

//   try {
//     // Set custom user claims
//     await adminAuth.setCustomUserClaims(uid, { admin: true });
    
//     // Verify the update
//     const user = await adminAuth.getUser(uid);
    
//     return NextResponse.json({ 
//       success: true, 
//       message: `User ${user.email} (UID: ${uid}) is now an Admin.`,
//       claims: user.customClaims 
//     });
//   } catch (error) {
//     console.error("Error setting admin claim:", error);
//     return NextResponse.json({ error: error.message }, { status: 500 });
//   }
// }
