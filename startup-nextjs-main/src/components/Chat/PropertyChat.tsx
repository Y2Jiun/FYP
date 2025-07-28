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
import { moderateText, moderateImage, ModerationResult } from "@/utils/api";

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
  const [selectedImage, setSelectedImage] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
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

  // Handle image selection
  const handleImageSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      // Check file size (max 5MB)
      if (file.size > 5 * 1024 * 1024) {
        setError("Image size must be less than 5MB");
        return;
      }

      // Check file type
      if (!file.type.startsWith("image/")) {
        setError("Please select an image file");
        return;
      }

      setSelectedImage(file);

      // Create preview
      const reader = new FileReader();
      reader.onload = (e) => {
        setImagePreview(e.target?.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  // Remove selected image
  const removeImage = () => {
    setSelectedImage(null);
    setImagePreview(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  // Upload image using API
  const uploadImage = async (file: File): Promise<string> => {
    try {
      const formData = new FormData();
      formData.append("image", file);

      const response = await fetch("/api/upload-image", {
        method: "POST",
        body: formData,
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || "Upload failed");
      }

      const result = await response.json();
      return result.imageUrl;
    } catch (error) {
      console.error("Image upload error:", error);
      throw new Error("Failed to upload image. Please try again.");
    }
  };

  // Send message handler
  const handleSend = async () => {
    if (
      (!input.trim() && !selectedImage) ||
      !chatId ||
      !currentUser ||
      !userData
    )
      return;

    setSending(true);
    setError("");

    try {
      // 1. Moderate the text content first (if there's text)
      if (input.trim()) {
        let moderation: ModerationResult;
        try {
          moderation = await moderateText(input);
        } catch (err) {
          console.error("Moderation API error:", err);
          setError("Failed to check message content. Please try again.");
          setSending(false);
          return;
        }

        if (moderation.flagged) {
          setError(
            moderation.reason ||
              "Inappropriate content detected. Please use respectful language.",
          );
          setSending(false);
          return;
        }
      }

      // 2. Upload image if selected
      let imageUrl = "";
      if (selectedImage) {
        try {
          imageUrl = await uploadImage(selectedImage);

          // 3. Moderate the uploaded image
          let imageModeration: ModerationResult;
          try {
            imageModeration = await moderateImage(imageUrl);
          } catch (err) {
            console.error("Image moderation API error:", err);
            setError("Failed to check image content. Please try again.");
            setSending(false);
            return;
          }

          if (imageModeration.flagged) {
            setError(
              imageModeration.reason ||
                "Inappropriate image content detected. Please use appropriate images.",
            );
            setSending(false);
            return;
          }
        } catch (err) {
          console.error("Image upload error:", err);
          setError("Failed to upload image. Please try again.");
          setSending(false);
          return;
        }
      }

      // 4. Generate sequential message ID
      const messagesRef = collection(db, "chats", chatId, "messages");
      const messagesSnap = await getDocs(messagesRef);
      const nextMsgNum = messagesSnap.size + 1;
      const messageId = `MSG${String(nextMsgNum).padStart(3, "0")}`;

      // 5. Save message to Firestore
      await setDoc(doc(messagesRef, messageId), {
        messageId,
        senderId: userData.userID,
        userUID: currentUser.uid,
        content: input,
        imageUrl: imageUrl,
        timestamp: serverTimestamp(),
        moderationStatus: "approved",
        flaggedReason: "",
      });

      setInput("");
      removeImage();
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
                  msg.senderId === userData?.userID
                    ? "justify-end"
                    : "justify-start"
                }`}
              >
                <div
                  className={`max-w-[70%] rounded-lg px-4 py-2 ${
                    msg.senderId === userData?.userID
                      ? "bg-blue-500 text-white"
                      : "bg-gray-200 text-gray-900 dark:bg-gray-700 dark:text-white"
                  }`}
                >
                  {msg.content && <p className="mb-2">{msg.content}</p>}
                  {msg.imageUrl && (
                    <div className="mb-2">
                      <img
                        src={msg.imageUrl}
                        alt="Chat image"
                        className="max-w-full rounded-lg"
                        style={{ maxHeight: "200px" }}
                      />
                    </div>
                  )}
                  <p className="text-xs opacity-70">
                    {msg.timestamp?.toDate?.().toLocaleTimeString() ||
                      "Just now"}
                  </p>
                </div>
              </div>
            ))
          )}
          <div ref={messagesEndRef} />
        </div>

        {/* Image Preview */}
        {imagePreview && (
          <div className="border-t p-2 dark:border-gray-700">
            <div className="relative inline-block">
              <img
                src={imagePreview}
                alt="Preview"
                className="h-20 w-20 rounded object-cover"
              />
              <button
                onClick={removeImage}
                className="absolute -top-2 -right-2 rounded-full bg-red-500 p-1 text-white hover:bg-red-600"
              >
                ×
              </button>
            </div>
          </div>
        )}

        {/* Input Area */}
        <div className="border-t p-4 dark:border-gray-700">
          <div className="flex items-center gap-2">
            <input
              type="file"
              ref={fileInputRef}
              accept="image/*"
              onChange={handleImageSelect}
              className="hidden"
            />
            <button
              onClick={() => fileInputRef.current?.click()}
              className="rounded p-2 text-gray-500 hover:bg-gray-100 dark:text-gray-400 dark:hover:bg-gray-700"
              disabled={sending}
            >
              📷
            </button>
            <input
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyPress={handleKeyPress}
              placeholder="Type your message..."
              className="flex-1 rounded border px-3 py-2 dark:border-gray-600 dark:bg-gray-700 dark:text-white"
              disabled={sending}
            />
            <button
              onClick={handleSend}
              disabled={sending || (!input.trim() && !selectedImage)}
              className="rounded bg-blue-500 px-4 py-2 text-white hover:bg-blue-600 disabled:opacity-50"
            >
              {sending ? "Sending..." : "Send"}
            </button>
          </div>
          {error && <p className="mt-2 text-sm text-red-500">{error}</p>}
        </div>
      </div>
    </div>
  );
}
