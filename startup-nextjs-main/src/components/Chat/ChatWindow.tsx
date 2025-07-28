"use client";
import { useEffect, useRef, useState } from "react";
import { db } from "@/lib/firebase";
import {
  collection,
  addDoc,
  query,
  orderBy,
  onSnapshot,
  serverTimestamp,
} from "firebase/firestore";
import { moderateText, moderateImage, ModerationResult } from "@/utils/api";
import { auth } from "@/lib/firebase";

type ChatWindowProps = {
  chatId: string;
  userId: string;
  agentId: string;
};

type Message = {
  id: string;
  senderId: string;
  content: string;
  imageUrl?: string;
  timestamp: any;
  moderationStatus: string;
  flaggedReason?: string;
};

export default function ChatWindow({
  chatId,
  userId,
  agentId,
}: ChatWindowProps) {
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState("");
  const [sending, setSending] = useState(false);
  const [error, setError] = useState("");
  const [selectedImage, setSelectedImage] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Listen for messages in real-time
  useEffect(() => {
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
  async function handleSend() {
    setError("");
    if (!input.trim() && !selectedImage) return;
    setSending(true);

    // 1. Moderate text (if there's text)
    let moderation: ModerationResult;
    if (input.trim()) {
      try {
        moderation = await moderateText(input);
      } catch (err) {
        setError("Failed to check message. Try again.");
        setSending(false);
        return;
      }

      if (moderation.flagged) {
        setError(
          "Message blocked: " + (moderation.reason || "Inappropriate content"),
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
          setError("Failed to check image content. Try again.");
          setSending(false);
          return;
        }

        if (imageModeration.flagged) {
          setError(
            "Image blocked: " +
              (imageModeration.reason || "Inappropriate image content"),
          );
          setSending(false);
          return;
        }
      } catch (err) {
        setError("Failed to upload image. Try again.");
        setSending(false);
        return;
      }
    }

    // 4. Save to Firestore
    try {
      await addDoc(collection(db, "chats", chatId, "messages"), {
        senderId: userId,
        content: input,
        imageUrl: imageUrl,
        timestamp: serverTimestamp(),
        moderationStatus: "approved",
      });
      setInput("");
      removeImage();
    } catch (err) {
      setError("Failed to send message.");
    }
    setSending(false);
  }

  return (
    <div className="flex h-[400px] flex-col rounded border bg-white shadow dark:bg-gray-900">
      <div className="flex-1 overflow-y-auto p-4">
        {messages.map((msg) => (
          <div
            key={msg.id}
            className={`mb-2 ${msg.senderId === userId ? "text-right" : "text-left"}`}
          >
            <div
              className={`inline-block rounded px-3 py-2 ${
                msg.senderId === userId
                  ? "bg-primary text-white"
                  : "bg-gray-200 text-black dark:bg-gray-700 dark:text-white"
              }`}
            >
              {msg.content && <p className="mb-2">{msg.content}</p>}
              {msg.imageUrl && (
                <div className="mb-2">
                  <img
                    src={msg.imageUrl}
                    alt="Chat image"
                    className="max-w-full rounded"
                    style={{ maxHeight: "200px" }}
                  />
                </div>
              )}
              {msg.moderationStatus !== "approved" && (
                <span className="ml-2 text-xs text-red-500">
                  (Blocked: {msg.flaggedReason})
                </span>
              )}
            </div>
          </div>
        ))}
        <div ref={messagesEndRef} />
      </div>
      {/* Image Preview */}
      {imagePreview && (
        <div className="border-t p-2">
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

      <div className="flex items-center gap-2 border-t p-2">
        <input
          type="file"
          ref={fileInputRef}
          accept="image/*"
          onChange={handleImageSelect}
          className="hidden"
        />
        <button
          onClick={() => fileInputRef.current?.click()}
          className="rounded p-2 text-gray-500 hover:bg-gray-100"
          disabled={sending}
        >
          📷
        </button>
        <input
          className="flex-1 rounded border px-3 py-2"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder="Type your message..."
          disabled={sending}
          onKeyDown={(e) => e.key === "Enter" && handleSend()}
        />
        <button
          className="bg-primary rounded px-4 py-2 text-white"
          onClick={handleSend}
          disabled={sending || (!input.trim() && !selectedImage)}
        >
          Send
        </button>
      </div>
      {error && <div className="p-2 text-sm text-red-500">{error}</div>}
    </div>
  );
}
