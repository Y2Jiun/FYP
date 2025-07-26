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

      // 4. Use sequential chatId based on propertyId
      const chatId = `CHAT${propertyId.replace("PROP", "")}`;
      const chatRef = doc(db, "chats", chatId);
      const chatSnap = await getDoc(chatRef);
      if (!chatSnap.exists()) {
        // Create chat document if it doesn't exist
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
        console.log(
          "ChatButton: Attempting to create chat document with ID:",
          chatId,
        );
        console.log(
          "ChatButton: About to call setDoc with data:",
          JSON.stringify(chatData, null, 2),
        );
        console.log("ChatButton: Auth state before setDoc:", {
          currentUser: auth.currentUser,
          uid: auth.currentUser?.uid,
          isAuthenticated: !!auth.currentUser,
        });
        await setDoc(chatRef, chatData);
        console.log("ChatButton: Chat document created successfully!");
      } else {
        console.log(
          "ChatButton: Chat document already exists, using existing chatId:",
          chatId,
        );
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
