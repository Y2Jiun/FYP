// lib/firebase.ts
import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";
import { collection, query, where, getDocs } from "firebase/firestore";
import { getStorage } from "firebase/storage";

const firebaseConfig = {
  apiKey: "AIzaSyCI3cfmtgWQw3rkAmOWpxrdBNSvBH00R8s",
  authDomain: "derrick-3157c.firebaseapp.com",
  projectId: "derrick-3157c",
  storageBucket: "derrick-3157c.appspot.com",
  messagingSenderId: "892123233032",
  appId: "1:892123233032:web:6c922c6204584b031bcabd",
  measurementId: "G-KE7VBSGF8F",
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
