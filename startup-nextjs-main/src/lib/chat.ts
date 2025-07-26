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
  updateDoc,
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
  userID?: string,
  agentID?: string,
): Promise<string> {
  try {
    const chatsRef = collection(db, "chats");
    const q = query(
      chatsRef,
      where("propertyId", "==", propertyId),
      where("userUID", "==", userUID),
      where("agentUID", "==", agentUID),
    );
    const snapshot = await getDocs(q);

    if (!snapshot.empty) {
      // Chat already exists, return the existing chatId
      const existingChat = snapshot.docs[0];
      const chatData = existingChat.data();

      // Update missing fields if needed
      const updates: any = {};
      if (!chatData.userID && userID) updates.userID = userID;
      if (!chatData.agentID && agentID) updates.agentID = agentID;

      if (Object.keys(updates).length > 0) {
        await updateDoc(doc(db, "chats", existingChat.id), updates);
      }

      return existingChat.id;
    }

    // Create new chat with all required fields
    const newChat = await addDoc(chatsRef, {
      propertyId,
      userUID,
      agentUID,
      userID: userID || "",
      agentID: agentID || "",
      createdAt: serverTimestamp(),
    });

    return newChat.id;
  } catch (error) {
    console.error("Error in getOrCreateChat:", error);
    throw error;
  }
}

/**
 * Get all chat rooms for a user (as buyer).
 */
export async function getUserChats(userId: string) {
  const chatsRef = collection(db, "chats");
  const q = query(chatsRef, where("userUID", "==", userId));
  const snapshot = await getDocs(q);
  return snapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() }));
}

/**
 * Get all chat rooms for an agent.
 */
export async function getAgentChats(agentId: string) {
  const chatsRef = collection(db, "chats");
  const q = query(chatsRef, where("agentUID", "==", agentId));
  const snapshot = await getDocs(q);
  return snapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() }));
}

/**
 * Get a chat document reference by chatId.
 */
export function getChatRef(chatId: string): DocumentReference {
  return doc(db, "chats", chatId);
}

/**
 * Create a new chat document with all required fields.
 * This is a standalone function for creating chats when needed.
 */
export async function createChatDocument(
  propertyId: string,
  userUID: string,
  agentUID: string,
  userID: string,
  agentID: string,
): Promise<string> {
  try {
    const chatsRef = collection(db, "chats");
    const newChat = await addDoc(chatsRef, {
      propertyId,
      userUID,
      agentUID,
      userID,
      agentID,
      createdAt: serverTimestamp(),
    });
    return newChat.id;
  } catch (error) {
    console.error("Error creating chat document:", error);
    throw error;
  }
}
