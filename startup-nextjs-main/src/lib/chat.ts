import { db } from "@/lib/firebase";
import {
  collection,
  query,
  where,
  getDocs,
  addDoc,
  serverTimestamp,
  DocumentReference,
  doc,
} from "firebase/firestore";

/**
 * Get or create a chat room for a given property, user, and agent.
 * Accepts the real Firebase UIDs directly.
 * Returns the chatId.
 */
export async function getOrCreateChat(
  propertyId: string,
  userUID: string,
  agentUID: string,
): Promise<string> {
  const chatsRef = collection(db, "chats");
  const q = query(
    chatsRef,
    where("propertyId", "==", propertyId),
    where("userUID", "==", userUID),
    where("agentUID", "==", agentUID),
  );
  const snapshot = await getDocs(q);
  if (!snapshot.empty) {
    return snapshot.docs[0].id; // Chat already exists
  }
  const newChat = await addDoc(chatsRef, {
    propertyId,
    userUID,
    agentUID,
    createdAt: serverTimestamp(),
  });
  return newChat.id;
}

/**
 * (Optional) Get all chat rooms for a user (as buyer).
 */
export async function getUserChats(userId: string) {
  const chatsRef = collection(db, "chats");
  const q = query(chatsRef, where("userId", "==", userId));
  const snapshot = await getDocs(q);
  return snapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() }));
}

/**
 * (Optional) Get all chat rooms for an agent.
 */
export async function getAgentChats(agentId: string) {
  const chatsRef = collection(db, "chats");
  const q = query(chatsRef, where("agentId", "==", agentId));
  const snapshot = await getDocs(q);
  return snapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() }));
}

/**
 * (Optional) Get a chat document reference by chatId.
 */
export function getChatRef(chatId: string): DocumentReference {
  return doc(db, "chats", chatId);
}
