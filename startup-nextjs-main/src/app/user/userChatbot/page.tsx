"use client";
import { useState, useRef } from "react";
import UserHeader from "@/components/User/userHeader";

export default function UserChatbotPage() {
  const [messages, setMessages] = useState([
    {
      sender: "bot",
      text: "Hi! I am your property assistant. Ask me anything about property, loans, or procedures!",
    },
  ]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const chatEndRef = useRef<HTMLDivElement>(null);

  async function sendMessage(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    if (!input.trim()) return;
    const userMsg = { sender: "user", text: input };
    setMessages((msgs) => [...msgs, userMsg]);
    setInput("");
    setLoading(true);
    try {
      const res = await fetch("/api/chatbot", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ message: userMsg.text }),
      });
      if (!res.ok) throw new Error("Failed to get response");
      const data = await res.json();
      setMessages((msgs) => [...msgs, { sender: "bot", text: data.answer }]);
    } catch (err: any) {
      setError("Sorry, I couldn't get an answer. Please try again.");
    }
    setLoading(false);
    setTimeout(() => {
      chatEndRef.current?.scrollIntoView({ behavior: "smooth" });
    }, 100);
  }

  return (
    <>
      <UserHeader />
      <div className="flex min-h-screen flex-col items-center justify-center bg-[#101726] p-4">
        <div className="mt-8 w-full max-w-xl rounded-2xl border border-blue-100 bg-white/80 p-6 shadow-xl backdrop-blur-lg dark:border-gray-700 dark:bg-gray-800/80">
          <h1 className="dark:text-primary mb-4 text-center text-3xl font-bold text-blue-700">
            AI Chatbot
          </h1>
          <div className="mb-4 h-96 overflow-y-auto rounded-lg border border-blue-100 bg-white/60 p-4 dark:border-gray-700 dark:bg-gray-900/40">
            {messages.map((msg, i) => (
              <div
                key={i}
                className={`mb-3 flex ${msg.sender === "user" ? "justify-end" : "justify-start"}`}
              >
                <div
                  className={`max-w-[80%] rounded-lg px-4 py-2 text-base shadow ${msg.sender === "user" ? "bg-blue-500 text-white" : "bg-gray-200 text-gray-900 dark:bg-gray-700 dark:text-white"}`}
                >
                  {msg.text}
                </div>
              </div>
            ))}
            <div ref={chatEndRef} />
          </div>
          <form onSubmit={sendMessage} className="flex gap-2">
            <input
              className="flex-1 rounded-lg border border-blue-200 bg-white/80 px-4 py-3 text-lg transition placeholder:text-gray-400 focus:ring-2 focus:ring-blue-400 focus:outline-none dark:bg-gray-900/40 dark:placeholder:text-gray-500"
              placeholder="Type your question..."
              value={input}
              onChange={(e) => setInput(e.target.value)}
              disabled={loading}
            />
            <button
              type="submit"
              className="rounded-xl bg-gradient-to-r from-blue-500 to-blue-700 px-6 py-3 text-lg font-bold tracking-wide text-white shadow-lg transition-all duration-200 hover:from-blue-700 hover:to-blue-500"
              disabled={loading}
            >
              {loading ? "..." : "Send"}
            </button>
          </form>
          {error && (
            <div className="mt-2 text-center text-red-500">{error}</div>
          )}
        </div>
      </div>
    </>
  );
}
