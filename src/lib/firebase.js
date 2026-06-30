export * from "./shims/firebase-app";
export * from "./shims/firebase-auth";
export * from "./shims/firebase-firestore";
export * from "./shims/firebase-storage";

import { getFirestore } from "./shims/firebase-firestore";
import { getAuth } from "./shims/firebase-auth";
import { getStorage } from "./shims/firebase-storage";
import { GoogleAuthProvider } from "./shims/firebase-auth";

const db = getFirestore();
const auth = getAuth();
const storage = getStorage();
const googleProvider = new GoogleAuthProvider();

export { db, auth, storage, googleProvider };
