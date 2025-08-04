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
  deleteDoc,
  arrayUnion,
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
  senderUID: string;
  senderName: string;
  userUID: string;
  content: string;
  imageUrl: string;
  timestamp: any;
  moderationStatus: string;
  flaggedReason: string;
  readBy: string[]; // Array of user UIDs who have read this message
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
  const [deletingMessageId, setDeletingMessageId] = useState<string | null>(
    null,
  );
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [messageToDelete, setMessageToDelete] = useState<{
    id: string;
    messageId: string;
  } | null>(null);
  const [successMessage, setSuccessMessage] = useState("");
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
      console.log("Using provided chatId:", propChatId);
      return; // If chatId is provided, don't create a new one
    }

    const getOrCreateChat = async () => {
      if (!currentUser || !userData) {
        console.log("Waiting for currentUser or userData...");
        return;
      }

      try {
        // Determine if current user is the agent or the user
        const isAgent = currentUser.uid === agentUID;
        console.log("Current user is agent:", isAgent);
        console.log("Current user UID:", currentUser.uid);
        console.log("Agent UID:", agentUID);
        console.log("Property ID:", propertyId);

        // Always use propertyId, agentUID, and userUID for uniqueness
        let chatQuery;
        let chatUserUID;
        let chatUserID;
        if (isAgent) {
          chatUserUID = propUserUID;
          chatUserID = propUserID;
        } else {
          chatUserUID = currentUser.uid;
          chatUserID = userData.userID;
        }
        chatQuery = query(
          collection(db, "chats"),
          where("propertyId", "==", propertyId),
          where("agentUID", "==", agentUID),
          where("userUID", "==", chatUserUID),
        );
        const chatSnapshot = await getDocs(chatQuery);
        if (!chatSnapshot.empty) {
          const chatDoc = chatSnapshot.docs[0];
          setChatId(chatDoc.id);
          console.log("Found existing chat:", chatDoc.id);
        } else {
          // Create new chat for this specific user-agent-property combination
          const newChatRef = await addDoc(collection(db, "chats"), {
            propertyId,
            agentUID,
            agentID,
            userUID: chatUserUID,
            userID: chatUserID,
            createdAt: serverTimestamp(),
          });
          setChatId(newChatRef.id);
          console.log("Created new chat:", newChatRef.id);
        }
      } catch (error) {
        console.error("Error getting or creating chat:", error);
        setError("Failed to initialize chat. Please try again.");
      }
    };

    getOrCreateChat();
  }, [
    currentUser,
    userData,
    propertyId,
    agentUID,
    agentID,
    propUserUID,
    propUserID,
    propChatId,
  ]);

  // Mark all messages in this chat as read by current user
  const markMessagesAsRead = async () => {
    if (!chatId || !currentUser) return;

    try {
      console.log("Marking messages as read for user:", currentUser.uid);

      // Get all messages that haven't been read by current user
      const messagesQuery = query(
        collection(db, "chats", chatId, "messages"),
        where("readBy", "not-in", [[currentUser.uid]]),
      );

      const snapshot = await getDocs(messagesQuery);

      // Update each message to add current user to readBy array
      const updatePromises = snapshot.docs.map(async (docSnap) => {
        await updateDoc(docSnap.ref, {
          readBy: arrayUnion(currentUser.uid),
        });
      });

      await Promise.all(updatePromises);
      console.log(`Marked ${snapshot.docs.length} messages as read`);
    } catch (error) {
      console.error("Error marking messages as read:", error);
    }
  };

  // Listen for messages in real-time
  useEffect(() => {
    if (!chatId) {
      console.log("No chatId available, skipping message listener");
      return;
    }

    console.log("Setting up message listener for chatId:", chatId);
    const q = query(
      collection(db, "chats", chatId, "messages"),
      orderBy("timestamp"),
    );
    const unsub = onSnapshot(
      q,
      (snapshot) => {
        console.log("Received message update, count:", snapshot.docs.length);
        const newMessages = snapshot.docs.map(
          (doc) => ({ id: doc.id, ...doc.data() }) as Message,
        );
        console.log("New messages:", newMessages);
        setMessages(newMessages);

        // Mark messages as read when chat is opened
        markMessagesAsRead();
      },
      (error) => {
        console.error("Error listening to messages:", error);
      },
    );
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
      // Determine if current user is the agent
      const isAgent = currentUser.uid === agentUID;

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

      // 4. Save to Firestore
      try {
        // Generate next sequential message ID
        const messagesSnapshot = await getDocs(
          collection(db, "chats", chatId, "messages"),
        );
        let maxMsgNum = 0;
        messagesSnapshot.docs.forEach((doc) => {
          const id = doc.id;
          const match = id.match(/^MSG(\d+)$/);
          if (match) {
            const num = parseInt(match[1], 10);
            if (num > maxMsgNum) maxMsgNum = num;
          }
        });
        const messageId = `MSG${String(maxMsgNum + 1).padStart(3, "0")}`;

        const messageData = {
          senderId: isAgent ? agentID : userData.userID,
          senderUID: currentUser.uid,
          senderName: userData.username,
          userUID: isAgent ? propUserUID : currentUser.uid,
          content: input,
          imageUrl: imageUrl,
          timestamp: serverTimestamp(),
          moderationStatus: "approved",
          readBy: [currentUser.uid], // Sender has read their own message
          messageId,
        };

        console.log("Sending message with data:", messageData);
        await setDoc(
          doc(db, "chats", chatId, "messages", messageId),
          messageData,
        );

        setInput("");
        removeImage();
        setError(""); // Clear any previous errors
      } catch (err) {
        console.error("Error saving message to Firestore:", err);
        setError("Failed to send message. Please try again.");
      }
    } catch (err) {
      console.error("Error sending message:", err);
      setError("Failed to send message. Please try again.");
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

  // Show delete confirmation dialog
  const showDeleteConfirmation = (messageId: string, messageDocId: string) => {
    setMessageToDelete({ id: messageDocId, messageId });
    setShowDeleteConfirm(true);
  };

  // Delete message function
  const deleteMessage = async (messageId: string, messageDocId: string) => {
    if (!chatId) return;

    setDeletingMessageId(messageId);
    try {
      // Delete the message from Firestore
      await deleteDoc(doc(db, "chats", chatId, "messages", messageDocId));
      setError("");
      setSuccessMessage("Message deleted successfully!");
      // Clear success message after 3 seconds
      setTimeout(() => setSuccessMessage(""), 3000);
    } catch (err) {
      console.error("Error deleting message:", err);
      setError("Failed to delete message. Please try again.");
    } finally {
      setDeletingMessageId(null);
      setShowDeleteConfirm(false);
      setMessageToDelete(null);
    }
  };

  // Confirm delete action
  const confirmDelete = () => {
    if (messageToDelete) {
      deleteMessage(messageToDelete.messageId, messageToDelete.id);
    }
  };

  // Cancel delete action
  const cancelDelete = () => {
    setShowDeleteConfirm(false);
    setMessageToDelete(null);
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
                  msg.senderUID === currentUser?.uid
                    ? "justify-end"
                    : "justify-start"
                }`}
              >
                <div
                  className={`max-w-[70%] rounded-lg px-4 py-2 ${
                    msg.senderUID === currentUser?.uid
                      ? "bg-blue-500 text-white"
                      : "bg-gray-200 text-gray-900 dark:bg-gray-700 dark:text-white"
                  }`}
                >
                  <p className="text-sm">{msg.content}</p>
                  {msg.imageUrl && (
                    <img
                      src={msg.imageUrl}
                      alt="Shared image"
                      className="mt-2 max-h-48 rounded object-cover"
                    />
                  )}
                  <div className="mt-1 flex items-center justify-between">
                    <p className="text-xs opacity-70">
                      {msg.timestamp?.toDate?.().toLocaleTimeString() ||
                        "Just now"}
                    </p>
                    {msg.senderUID === currentUser?.uid && (
                      <button
                        onClick={() => deleteMessage(msg.messageId, msg.id)}
                        disabled={deletingMessageId === msg.messageId}
                        className="ml-2 text-xs text-red-500 hover:text-red-600"
                      >
                        🗑️
                      </button>
                    )}
                  </div>
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
          {successMessage && (
            <p className="mt-2 text-sm text-green-500">{successMessage}</p>
          )}
        </div>

        {/* Delete Confirmation Modal */}
        {showDeleteConfirm && messageToDelete && (
          <div className="bg-opacity-50 fixed inset-0 z-50 flex items-center justify-center bg-black">
            <div className="rounded-lg bg-white p-6 dark:bg-gray-800">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                Confirm Deletion
              </h3>
              <p className="text-gray-600 dark:text-gray-300">
                Are you sure you want to delete this message? This action cannot
                be undone.
              </p>
              <div className="mt-4 flex justify-end gap-2">
                <button
                  onClick={cancelDelete}
                  className="rounded bg-gray-300 px-4 py-2 text-gray-800 hover:bg-gray-400 dark:bg-gray-700 dark:text-gray-200 dark:hover:bg-gray-600"
                >
                  Cancel
                </button>
                <button
                  onClick={confirmDelete}
                  className="rounded bg-red-500 px-4 py-2 text-white hover:bg-red-600"
                >
                  Delete
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
