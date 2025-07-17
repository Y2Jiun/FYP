import { db } from "./firebase";
import { doc, getDoc, setDoc } from "firebase/firestore";

// Only for user counter!
export async function getNextUserId(): Promise<string> {
  try {
    const counterRef = doc(db, "counters", "users");
    const counterDoc = await getDoc(counterRef);

    let nextId = 1;
    if (counterDoc.exists()) {
      nextId = counterDoc.data().lastId + 1;
    }

    await setDoc(counterRef, { lastId: nextId }, { merge: true });
    return `UID${nextId}`;
  } catch (error) {
    console.error("Error getting next user ID:", error);
    throw error;
  }
}