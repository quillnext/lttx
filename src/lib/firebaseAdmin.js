// // src/lib/firebaseAdmin.js
// import admin from "firebase-admin";

// console.log("FIREBASE_ADMIN_SDK value:", process.env.FIREBASE_ADMIN_SDK);

// let serviceAccount;
// try {
//   if (!process.env.FIREBASE_ADMIN_SDK) {
//     throw new Error("FIREBASE_ADMIN_SDK environment variable is not set");
//   }
//   console.log("Parsing FIREBASE_ADMIN_SDK environment variable:");
//   serviceAccount = JSON.parse(process.env.FIREBASE_ADMIN_SDK);
// } catch (error) {
//   console.error("Error loading Firebase Admin SDK credentials:", error.message);
//   throw new Error("Failed to load Firebase Admin SDK credentials");
// }

// if (!admin.apps.length) {
//   try {
//     admin.initializeApp({
//       credential: admin.credential.cert(serviceAccount),
//     });
//     console.log("Firebase Admin SDK initialized successfully");
//   } catch (error) {
//     console.error("Error initializing Firebase Admin SDK:", error.message);
//     throw new Error("Failed to initialize Firebase Admin SDK");
//   }
// }

// const adminAuth = admin.auth();
// const adminDb = admin.firestore();

// // Validate adminDb
// if (!(adminDb instanceof admin.firestore.Firestore)) {
//   console.error("adminDb is not a valid Firestore instance:", adminDb);
//   throw new Error("adminDb is not a valid Firestore instance");
// }
// console.log("adminDb initialized:", true);

// export { adminAuth, adminDb };

// src/lib/firebaseAdmin.js
import admin from "firebase-admin";

console.log("FIREBASE_ADMIN_SDK value:", process.env.FIREBASE_ADMIN_SDK);

let serviceAccount;
try {
  if (!process.env.FIREBASE_ADMIN_SDK) {
    throw new Error("FIREBASE_ADMIN_SDK environment variable is not set");
  }
  console.log("Parsing FIREBASE_ADMIN_SDK environment variable:");
  serviceAccount = JSON.parse(process.env.FIREBASE_ADMIN_SDK);
} catch (error) {
  console.error("Error loading Firebase Admin SDK credentials:", error.message);
  throw new Error("Failed to load Firebase Admin SDK credentials");
}

if (!admin.apps.length) {
  try {
    admin.initializeApp({
      credential: admin.credential.cert(serviceAccount),
    });
    console.log("Firebase Admin SDK initialized successfully");
  } catch (error) {
    console.error("Error initializing Firebase Admin SDK:", error.message);
    throw new Error("Failed to initialize Firebase Admin SDK");
  }
}

const adminAuth = admin.auth();
const adminDb = admin.firestore();

// Validate adminDb
if (!(adminDb instanceof admin.firestore.Firestore)) {
  console.error("adminDb is not a valid Firestore instance:", adminDb);
  throw new Error("adminDb is not a valid Firestore instance");
}
console.log("adminDb initialized:", true);

export { adminAuth, adminDb };