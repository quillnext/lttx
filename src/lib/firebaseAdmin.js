import adminMock, { getAuth } from "./shims/firebase-admin";

const adminAuth = getAuth();
const adminDb = adminMock.firestore();
const serverTimestamp = () => Date.now();

export { adminAuth, adminDb, serverTimestamp };
export default adminMock;
