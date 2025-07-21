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

  // Send message handler
  async function handleSend() {
    setError("");
    if (!input.trim()) return;
    setSending(true);

    // 1. Moderate text
    let moderation: ModerationResult;
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

    // 2. Save to Firestore
    try {
      await addDoc(collection(db, "chats", chatId, "messages"), {
        senderId: userId,
        content: input,
        imageUrl: null,
        timestamp: serverTimestamp(),
        moderationStatus: "approved",
      });
      setInput("");
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
              {msg.content}
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
      <div className="flex items-center gap-2 border-t p-2">
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
          disabled={sending}
        >
          Send
        </button>
      </div>
      {error && <div className="p-2 text-sm text-red-500">{error}</div>}
    </div>
  );
}
