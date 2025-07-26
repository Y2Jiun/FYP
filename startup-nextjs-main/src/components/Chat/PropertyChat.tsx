"use client";
import React, { useState, useEffect, useRef } from "react";
import { db, auth } from "@/lib/firebase";
import {
  collection,
  addDoc,
  query,
  orderBy,
  onSnapshot,
  serverTimestamp,
  doc,
  getDoc,
  updateDoc,
  where,
  getDocs,
  setDoc,
} from "firebase/firestore";

type PropertyChatProps = {
  propertyId: string;
  agentUID: string;
  agentID: string;
  userUID?: string; // Optional: for agent viewing specific user chat
  userID?: string; // Optional: for agent viewing specific user chat
  chatId?: string; // Optional: for agent viewing specific chat
  onClose: () => void;
};

type Message = {
  id: string;
  messageId: string;
  senderId: string;
  userUID: string;
  content: string;
  imageUrl: string;
  timestamp: any;
  moderationStatus: string;
  flaggedReason: string;
};

export default function PropertyChat({
  propertyId,
  agentUID,
  agentID,
  userUID: propUserUID,
  userID: propUserID,
  chatId: propChatId,
  onClose,
}: PropertyChatProps) {
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState("");
  const [sending, setSending] = useState(false);
  const [error, setError] = useState("");
  const [chatId, setChatId] = useState<string | null>(propChatId || null);
  const [currentUser, setCurrentUser] = useState<any>(null);
  const [userData, setUserData] = useState<any>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Get current user data
  useEffect(() => {
    const user = auth.currentUser;
    if (user) {
      setCurrentUser(user);

      // Fetch user data from Firestore
      const fetchUserData = async () => {
        try {
          console.log("Fetching user data for email:", user.email);
          const usersRef = collection(db, "users");
          const q = query(usersRef, where("email", "==", user.email));
          const querySnapshot = await getDocs(q);

          console.log(
            "User query result:",
            querySnapshot.size,
            "documents found",
          );

          if (!querySnapshot.empty) {
            const userDoc = querySnapshot.docs[0];
            const userData = userDoc.data();
            console.log("Found user data:", userData);

            const finalUserData = {
              userID:
                userData.userID ||
                userData.userId ||
                user.uid ||
                `UID${Math.floor(Math.random() * 1000)}`,
              username:
                userData.username ||
                userData.name ||
                user.displayName ||
                "User",
            };

            console.log("Setting user data:", finalUserData);
            setUserData(finalUserData);
          } else {
            // Fallback if user not found in Firestore
            console.log("User not found in Firestore, using fallback");
            const fallbackUserData = {
              userID: user.uid || `UID${Math.floor(Math.random() * 1000)}`,
              username: user.displayName || "User",
            };
            console.log("Fallback user data:", fallbackUserData);
            setUserData(fallbackUserData);
          }
        } catch (error) {
          console.error("Error fetching user data:", error);
          console.error("User email:", user.email);
          // Fallback
          const errorFallbackData = {
            userID: user.uid || `UID${Math.floor(Math.random() * 1000)}`,
            username: user.displayName || "User",
          };
          console.log("Error fallback user data:", errorFallbackData);
          setUserData(errorFallbackData);
        }
      };

      fetchUserData();
    } else {
      console.log("No current user found");
    }
  }, []);

  // Get or create chat room (only if not provided)
  useEffect(() => {
    if (propChatId) {
      setChatId(propChatId);
      return; // If chatId is provided, don't create a new one
    }

    const getOrCreateChat = async () => {
      if (!currentUser || !userData) return;

      try {
        // Determine if current user is the agent or the user
        const isAgent = currentUser.uid === agentUID;
        console.log("Current user is agent:", isAgent);
        console.log("Current user UID:", currentUser.uid);
        console.log("Agent UID:", agentUID);

        // Use the appropriate agentID - if current user is agent, use their userID, otherwise use passed agentID
        const effectiveAgentID = isAgent ? userData.userID : agentID;
        console.log("Effective agent ID:", effectiveAgentID);

        // Check if chat already exists
        const chatsRef = collection(db, "chats");
        const q = query(
          chatsRef,
          where("propertyId", "==", propertyId),
          where("userUID", "==", currentUser.uid),
          where("agentUID", "==", agentUID),
        );
        const snapshot = await getDocs(q);

        if (!snapshot.empty) {
          // Chat exists, use existing chatId
          const existingChat = snapshot.docs[0];
          setChatId(existingChat.id);

          // Update user info if not set
          if (!existingChat.data().userID || !existingChat.data().userUID) {
            await updateDoc(doc(db, "chats", existingChat.id), {
              userID: userData.userID,
              userUID: currentUser.uid,
            });
          }
        } else {
          // Generate next chat ID
          const querySnapshot = await getDocs(collection(db, "chats"));
          let maxId = 0;
          querySnapshot.forEach((doc) => {
            const data = doc.data();
            const idStr = (data.chatId || doc.id || "").replace("CHAT", "");
            const idNum = parseInt(idStr, 10);
            if (!isNaN(idNum) && idNum > maxId) maxId = idNum;
          });
          const nextChatId = `CHAT${String(maxId + 1).padStart(3, "0")}`;

          // Create new chat with all required fields
          await setDoc(doc(db, "chats", nextChatId), {
            chatId: nextChatId,
            propertyId,
            agentID: effectiveAgentID,
            agentUID,
            userID: userData.userID,
            userUID: currentUser.uid,
            createdAt: serverTimestamp(),
          });
          setChatId(nextChatId);
        }
      } catch (err) {
        console.error("Error getting/creating chat:", err);
        console.error("Current user:", currentUser?.uid);
        console.error("User data:", userData);
        console.error("Property ID:", propertyId);
        console.error("Agent UID:", agentUID);
        console.error("Agent ID:", agentID);
        setError("Failed to initialize chat.");
      }
    };

    getOrCreateChat();
  }, [currentUser, userData, propertyId, agentUID, agentID, propChatId]);

  // Listen for messages in real-time
  useEffect(() => {
    if (!chatId) return;

    const q = query(
      collection(db, "chats", chatId, "messages"),
      orderBy("timestamp"),
    );
    const unsub = onSnapshot(q, (snapshot) => {
      setMessages(
        snapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() }) as Message),
      );
    });
    return () => unsub();
  }, [chatId]);

  // Scroll to bottom on new message
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  // Send message handler
  const handleSend = async () => {
    if (!input.trim() || !chatId || !currentUser || !userData) return;

    setSending(true);
    setError("");

    try {
      // Generate sequential message ID
      const messagesRef = collection(db, "chats", chatId, "messages");
      const messagesSnap = await getDocs(messagesRef);
      const nextMsgNum = messagesSnap.size + 1;
      const messageId = `MSG${String(nextMsgNum).padStart(3, "0")}`;

      await setDoc(doc(messagesRef, messageId), {
        messageId,
        senderId: userData.userID,
        userUID: currentUser.uid,
        content: input,
        imageUrl: "",
        timestamp: serverTimestamp(),
        moderationStatus: "approved", // You can add moderation here
        flaggedReason: "",
      });

      setInput("");
    } catch (err) {
      console.error("Error sending message:", err);
      setError("Failed to send message.");
    } finally {
      setSending(false);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  if (!currentUser) {
    return (
      <div className="bg-opacity-50 fixed inset-0 z-50 flex items-center justify-center bg-black">
        <div className="rounded-lg bg-white p-6 dark:bg-gray-800">
          <p className="text-center text-gray-600 dark:text-gray-300">
            Please log in to start chatting.
          </p>
          <button
            onClick={onClose}
            className="mt-4 w-full rounded bg-blue-500 px-4 py-2 text-white hover:bg-blue-600"
          >
            Close
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-opacity-50 fixed inset-0 z-50 flex items-center justify-center bg-black">
      <div className="h-[600px] w-full max-w-2xl rounded-lg bg-white shadow-xl dark:bg-gray-800">
        {/* Chat Header */}
        <div className="flex items-center justify-between border-b p-4 dark:border-gray-700">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
            Chat with Agent
          </h3>
          <button
            onClick={onClose}
            className="rounded p-2 text-gray-500 hover:bg-gray-100 dark:text-gray-400 dark:hover:bg-gray-700"
          >
            <svg
              className="h-6 w-6"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M6 18L18 6M6 6l12 12"
              />
            </svg>
          </button>
        </div>

        {/* Messages Area */}
        <div className="flex-1 overflow-y-auto p-4" style={{ height: "400px" }}>
          {messages.length === 0 ? (
            <div className="flex h-full items-center justify-center">
              <p className="text-gray-500 dark:text-gray-400">
                Start a conversation about this property!
              </p>
            </div>
          ) : (
            messages.map((msg) => (
              <div
                key={msg.id}
                className={`mb-4 flex ${
                  msg.userUID === currentUser.uid
                    ? "justify-end"
                    : "justify-start"
                }`}
              >
                <div
                  className={`max-w-xs rounded-lg px-4 py-2 ${
                    msg.userUID === currentUser.uid
                      ? "bg-blue-500 text-white"
                      : "bg-gray-200 text-gray-900 dark:bg-gray-700 dark:text-white"
                  }`}
                >
                  <p className="text-sm">{msg.content}</p>
                  <p className="mt-1 text-xs opacity-70">
                    {msg.timestamp?.toDate?.()?.toLocaleTimeString() || "Now"}
                  </p>
                </div>
              </div>
            ))
          )}
          <div ref={messagesEndRef} />
        </div>

        {/* Input Area */}
        <div className="border-t p-4 dark:border-gray-700">
          <div className="flex items-center gap-2">
            <input
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyPress={handleKeyPress}
              placeholder="Type your message..."
              className="flex-1 rounded-lg border border-gray-300 px-4 py-2 focus:border-blue-500 focus:outline-none dark:border-gray-600 dark:bg-gray-700 dark:text-white"
              disabled={sending}
            />
            <button
              onClick={handleSend}
              disabled={sending || !input.trim()}
              className="rounded-lg bg-blue-500 px-4 py-2 text-white hover:bg-blue-600 disabled:opacity-50"
            >
              {sending ? (
                <div className="h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent"></div>
              ) : (
                "Send"
              )}
            </button>
          </div>
          {error && <p className="mt-2 text-sm text-red-500">{error}</p>}
        </div>
      </div>
    </div>
  );
}
