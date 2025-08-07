// lib/firebase.ts
import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";
import { collection, query, where, getDocs } from "firebase/firestore";
import { getStorage } from "firebase/storage";

const firebaseConfig = {
  apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY!,
  authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN!,
  projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID!,
  storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET!,
  messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID!,
  appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID!,
  measurementId: process.env.NEXT_PUBLIC_FIREBASE_MEASUREMENT_ID!,
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const db = getFirestore(app);
const storage = getStorage(app);

/**
 * Fetch the real Firebase UID for a given custom userID (e.g., 'UID7').
 * Returns the UID string or null if not found.
 */
export async function getFirebaseUidByCustomId(
  customId: string,
): Promise<string | null> {
  const q = query(collection(db, "users"), where("userID", "==", customId));
  const snapshot = await getDocs(q);
  if (!snapshot.empty) {
    return snapshot.docs[0].data().firebaseUID;
  }
  return null;
}

export { auth, db, storage };
