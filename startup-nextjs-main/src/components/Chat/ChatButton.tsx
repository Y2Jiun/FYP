"use client";
import React, { useState } from "react";
import PropertyChat from "./PropertyChat";
import { db, auth } from "@/lib/firebase";
import {
  collection,
  doc,
  getDoc,
  getDocs,
  query,
  setDoc,
  where,
  serverTimestamp,
} from "firebase/firestore";

type ChatButtonProps = {
  propertyId: string;
  agentUID: string;
  agentID: string;
  className?: string;
};

export default function ChatButton({
  propertyId,
  agentUID: propAgentUID,
  agentID: propAgentID,
  className = "",
}: ChatButtonProps) {
  const [showChat, setShowChat] = useState(false);
  const [chatInfo, setChatInfo] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleChatClick = async () => {
    console.log("ChatButton: handleChatClick started with props:", {
      propertyId,
      propAgentUID,
      propAgentID,
    });
    setLoading(true);
    setError("");
    try {
      // 1. Fetch property data
      console.log("ChatButton: Fetching property data for:", propertyId);
      const propertySnap = await getDoc(doc(db, "properties", propertyId));
      if (!propertySnap.exists()) throw new Error("Property not found");
      const property = propertySnap.data();
      console.log("ChatButton: Property data:", property);
      const agentUID = property.agentUID;
      const agentID = property.agentId || property.agentID;
      console.log(
        "ChatButton: Extracted agentUID:",
        agentUID,
        "agentID:",
        agentID,
      );

      // 2. Get current user
      console.log("ChatButton: Getting current user");
      const currentUser = auth.currentUser;
      console.log("ChatButton: currentUser:", currentUser);
      if (!currentUser) throw new Error("Not logged in");
      const userUID = currentUser.uid;
      console.log("ChatButton: userUID:", userUID);

      // 3. Get userID from users collection
      console.log(
        "ChatButton: Fetching user data for email:",
        currentUser.email,
      );
      let userID = currentUser.uid;
      const userQuery = query(
        collection(db, "users"),
        where("email", "==", currentUser.email),
      );
      const userSnap = await getDocs(userQuery);
      console.log("ChatButton: User query result:", userSnap.size, "documents");
      if (!userSnap.empty) {
        const userData = userSnap.docs[0].data();
        console.log("ChatButton: User data:", userData);
        userID = userData.userID || userData.userId || currentUser.uid;
      }
      console.log("ChatButton: Final userID:", userID);

      // 4. Find existing chat or create new one based on unique combination
      console.log(
        "ChatButton: Looking for existing chat with unique combination",
      );
      const chatQuery = query(
        collection(db, "chats"),
        where("propertyId", "==", propertyId),
        where("agentUID", "==", agentUID),
        where("userUID", "==", userUID),
      );
      const chatSnapshot = await getDocs(chatQuery);

      let chatId;
      if (!chatSnapshot.empty) {
        // Use existing chat
        chatId = chatSnapshot.docs[0].id;
        console.log("ChatButton: Found existing chat with ID:", chatId);
      } else {
        // Generate next sequential chat ID
        const allChatsSnapshot = await getDocs(collection(db, "chats"));
        let maxNum = 0;
        allChatsSnapshot.docs.forEach((doc) => {
          const id = doc.id;
          const match = id.match(/^CHAT(\d+)$/);
          if (match) {
            const num = parseInt(match[1], 10);
            if (num > maxNum) maxNum = num;
          }
        });
        chatId = `CHAT${String(maxNum + 1).padStart(3, "0")}`;
        console.log("ChatButton: Creating new chat with ID:", chatId);

        const chatData = {
          chatId,
          propertyId,
          agentID,
          agentUID,
          userID,
          userUID,
          createdAt: serverTimestamp(),
        };
        console.log("ChatButton: About to create chat with data:", chatData);
        await setDoc(doc(db, "chats", chatId), chatData);
        console.log("ChatButton: Chat document created successfully!");
      }
      setChatInfo({
        propertyId,
        agentUID,
        agentID,
        userUID,
        userID,
        chatId,
      });
      setShowChat(true);
    } catch (err: any) {
      console.error("ChatButton: Error in handleChatClick:", err);
      console.error("ChatButton: Error details:", {
        message: err.message,
        code: err.code,
        stack: err.stack,
      });
      setError(err.message || "Failed to start chat");
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <button
        onClick={handleChatClick}
        className={`inline-flex items-center gap-2 rounded-lg bg-blue-500 px-4 py-2 text-white transition-all hover:bg-blue-600 focus:ring-2 focus:ring-blue-500/20 focus:outline-none ${className}`}
        title="Chat with Agent"
        disabled={loading}
      >
        <svg
          className="h-5 w-5"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z"
          />
        </svg>
        <span>{loading ? "Loading..." : "Chat with Agent"}</span>
      </button>
      {error && <div className="mt-2 text-sm text-red-500">{error}</div>}
      {showChat && chatInfo && (
        <PropertyChat
          propertyId={chatInfo.propertyId}
          agentUID={chatInfo.agentUID}
          agentID={chatInfo.agentID}
          userUID={chatInfo.userUID}
          userID={chatInfo.userID}
          chatId={chatInfo.chatId}
          onClose={() => {
            setShowChat(false);
            setChatInfo(null);
          }}
        />
      )}
    </>
  );
}
