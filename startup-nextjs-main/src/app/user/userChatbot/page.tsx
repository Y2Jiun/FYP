"use client";
import { useState, useRef, useEffect } from "react";
import UserHeader from "@/components/User/userHeader";
import { collection, query, where, getDocs } from "firebase/firestore";
import { db } from "@/lib/firebase";

const BOT_AVATAR = "/images/logo/logo.svg";

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
  const [userAvatar, setUserAvatar] = useState<string | null>(null);
  const chatEndRef = useRef<HTMLDivElement>(null);

  // Fetch user avatar from Firebase (by email, matching userHeader.tsx)
  useEffect(() => {
    async function fetchAvatar() {
      try {
        const email = localStorage.getItem("userEmail");
        if (!email) return;
        const q = query(collection(db, "users"), where("email", "==", email));
        const querySnapshot = await getDocs(q);
        if (!querySnapshot.empty) {
          const docSnap = querySnapshot.docs[0];
          const data = docSnap.data();
          setUserAvatar(data.profilePic || null);
        } else {
          setUserAvatar(null);
        }
      } catch (e) {
        setUserAvatar(null);
      }
    }
    fetchAvatar();
  }, []);

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
      <div className="flex min-h-screen flex-col items-center justify-center bg-gradient-to-br from-blue-50 via-blue-100 to-blue-200 p-4 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900">
        <div className="mt-10 w-full max-w-2xl rounded-3xl border border-blue-200 bg-white/90 p-8 shadow-2xl backdrop-blur-lg dark:border-gray-700 dark:bg-gray-900/90">
          <h1 className="dark:text-primary mb-6 text-center text-4xl font-extrabold tracking-tight text-blue-700">
            AI Chatbot
          </h1>
          <div className="mb-6 flex h-[32rem] flex-col gap-4 overflow-y-auto rounded-xl border border-blue-100 bg-white/70 p-6 dark:border-gray-700 dark:bg-gray-900/40">
            {messages.map((msg, i) => (
              <div
                key={i}
                className={`flex ${msg.sender === "user" ? "justify-end" : "justify-start"} items-end gap-3`}
              >
                {msg.sender === "bot" && (
                  <span className="flex h-10 w-10 items-center justify-center rounded-full border-2 border-blue-400 bg-white p-0.5 shadow">
                    {/* Inline SVG logo for chatbot avatar, matches DeveloperShield header */}
                    <svg
                      width="40"
                      height="40"
                      viewBox="0 0 60 60"
                      fill="none"
                      xmlns="http://www.w3.org/2000/svg"
                    >
                      <g filter="url(#filter0_d)">
                        <path
                          d="M30 5L50 15V25C50 35 40 45 30 50C20 45 10 35 10 25V15L30 5Z"
                          fill="url(#shieldGradient)"
                          stroke="#4A6CF7"
                          strokeWidth="1.5"
                        />
                        <g transform="translate(20, 20)">
                          <path
                            d="M5 15L15 8L25 15V22H5V15Z"
                            fill="url(#houseGradient)"
                            stroke="#FFFFFF"
                            strokeWidth="0.8"
                          />
                          <path
                            d="M5 15L15 8L25 15"
                            stroke="#FFFFFF"
                            strokeWidth="1.2"
                            fill="none"
                          />
                          <rect
                            x="8"
                            y="12"
                            width="3"
                            height="3"
                            fill="url(#windowGradient)"
                            stroke="#FFFFFF"
                            strokeWidth="0.3"
                          />
                          <rect
                            x="19"
                            y="12"
                            width="3"
                            height="3"
                            fill="url(#windowGradient)"
                            stroke="#FFFFFF"
                            strokeWidth="0.3"
                          />
                          <rect
                            x="13"
                            y="15"
                            width="4"
                            height="7"
                            fill="url(#doorGradient)"
                            stroke="#FFFFFF"
                            strokeWidth="0.3"
                          />
                        </g>
                        <g transform="translate(25, 8)">
                          <circle
                            cx="5"
                            cy="5"
                            r="3"
                            fill="url(#lockGradient)"
                            stroke="#FFFFFF"
                            strokeWidth="0.5"
                          />
                          <rect
                            x="3"
                            y="5"
                            width="4"
                            height="3"
                            fill="url(#lockGradient)"
                            stroke="#FFFFFF"
                            strokeWidth="0.3"
                          />
                        </g>
                        <path
                          d="M30 5L50 15V25C50 35 40 45 30 50C20 45 10 35 10 25V15L30 5Z"
                          fill="url(#transparencyGradient)"
                          opacity="0.2"
                        />
                      </g>
                      <defs>
                        <linearGradient
                          id="shieldGradient"
                          x1="0%"
                          y1="0%"
                          x2="100%"
                          y2="100%"
                        >
                          <stop
                            offset="0%"
                            stopColor="#4A6CF7"
                            stopOpacity="0.95"
                          />
                          <stop
                            offset="50%"
                            stopColor="#3B82F6"
                            stopOpacity="0.9"
                          />
                          <stop
                            offset="100%"
                            stopColor="#1E40AF"
                            stopOpacity="0.85"
                          />
                        </linearGradient>
                        <linearGradient
                          id="houseGradient"
                          x1="0%"
                          y1="0%"
                          x2="100%"
                          y2="100%"
                        >
                          <stop
                            offset="0%"
                            stopColor="#FFFFFF"
                            stopOpacity="0.9"
                          />
                          <stop
                            offset="100%"
                            stopColor="#E5E7EB"
                            stopOpacity="0.8"
                          />
                        </linearGradient>
                        <linearGradient
                          id="windowGradient"
                          x1="0%"
                          y1="0%"
                          x2="100%"
                          y2="100%"
                        >
                          <stop
                            offset="0%"
                            stopColor="#FFFFFF"
                            stopOpacity="0.9"
                          />
                          <stop
                            offset="100%"
                            stopColor="#F3F4F6"
                            stopOpacity="0.7"
                          />
                        </linearGradient>
                        <linearGradient
                          id="doorGradient"
                          x1="0%"
                          y1="0%"
                          x2="100%"
                          y2="100%"
                        >
                          <stop
                            offset="0%"
                            stopColor="#4A6CF7"
                            stopOpacity="0.8"
                          />
                          <stop
                            offset="100%"
                            stopColor="#3B82F6"
                            stopOpacity="0.6"
                          />
                        </linearGradient>
                        <linearGradient
                          id="lockGradient"
                          x1="0%"
                          y1="0%"
                          x2="100%"
                          y2="100%"
                        >
                          <stop
                            offset="0%"
                            stopColor="#10B981"
                            stopOpacity="0.9"
                          />
                          <stop
                            offset="100%"
                            stopColor="#059669"
                            stopOpacity="0.8"
                          />
                        </linearGradient>
                        <linearGradient
                          id="transparencyGradient"
                          x1="0%"
                          y1="0%"
                          x2="100%"
                          y2="100%"
                        >
                          <stop
                            offset="0%"
                            stopColor="#FFFFFF"
                            stopOpacity="0.3"
                          />
                          <stop
                            offset="100%"
                            stopColor="#4A6CF7"
                            stopOpacity="0.1"
                          />
                        </linearGradient>
                        <filter
                          id="filter0_d"
                          x="0"
                          y="0"
                          width="60"
                          height="60"
                          filterUnits="userSpaceOnUse"
                        >
                          <feFlood
                            floodOpacity="0"
                            result="BackgroundImageFix"
                          />
                          <feColorMatrix
                            in="SourceAlpha"
                            type="matrix"
                            values="0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 127 0"
                          />
                          <feOffset dy="3" />
                          <feGaussianBlur stdDeviation="3" />
                          <feColorMatrix
                            type="matrix"
                            values="0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0.15 0"
                          />
                          <feBlend
                            mode="normal"
                            in2="BackgroundImageFix"
                            result="effect1_dropShadow"
                          />
                          <feBlend
                            mode="normal"
                            in="SourceGraphic"
                            in2="effect1_dropShadow"
                            result="shape"
                          />
                        </filter>
                      </defs>
                    </svg>
                  </span>
                )}
                <div
                  className={`max-w-[75%] rounded-2xl px-5 py-3 text-base whitespace-pre-line shadow-lg ${msg.sender === "user" ? "rounded-br-md bg-blue-500 text-white" : "rounded-bl-md bg-gray-200 text-gray-900 dark:bg-gray-700 dark:text-white"}`}
                >
                  {msg.text}
                </div>
                {msg.sender === "user" &&
                  (userAvatar ? (
                    <img
                      src={userAvatar}
                      alt="User"
                      className="h-10 w-10 rounded-full border-2 border-blue-400 bg-gray-100 object-cover shadow"
                    />
                  ) : (
                    <span className="flex h-10 w-10 items-center justify-center rounded-full border-2 border-blue-400 bg-gray-100 text-2xl text-gray-400 shadow">
                      👤
                    </span>
                  ))}
              </div>
            ))}
            <div ref={chatEndRef} />
          </div>
          <form onSubmit={sendMessage} className="flex gap-3">
            <input
              className="flex-1 rounded-xl border border-blue-300 bg-white/80 px-5 py-3 text-lg shadow transition placeholder:text-gray-400 focus:ring-2 focus:ring-blue-400 focus:outline-none dark:bg-gray-900/40 dark:placeholder:text-gray-500"
              placeholder="Type your question..."
              value={input}
              onChange={(e) => setInput(e.target.value)}
              disabled={loading}
            />
            <button
              type="submit"
              className="rounded-xl bg-gradient-to-r from-blue-500 to-blue-700 px-8 py-3 text-lg font-bold tracking-wide text-white shadow-lg transition-all duration-200 hover:from-blue-700 hover:to-blue-500"
              disabled={loading}
            >
              {loading ? "..." : "Send"}
            </button>
          </form>
          {error && (
            <div className="mt-3 text-center text-red-500">{error}</div>
          )}
        </div>
      </div>
    </>
  );
}
