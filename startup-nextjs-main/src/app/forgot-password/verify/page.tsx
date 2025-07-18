"use client";
import React, { useState, useRef, useEffect } from "react";
import axios from "axios";
import { useRouter } from "next/navigation";

export default function VerifyCodePage() {
  const [code, setCode] = useState(["", "", "", "", "", ""]);
  const [error, setError] = useState("");
  const [message, setMessage] = useState("");
  const [timer, setTimer] = useState(60);
  const [timedOut, setTimedOut] = useState(false);
  const router = useRouter();
  const email =
    typeof window !== "undefined" ? sessionStorage.getItem("resetEmail") : "";
  const inputRefs = useRef([]);

  useEffect(() => {
    if (timer > 0 && !timedOut) {
      const interval = setInterval(() => setTimer((t) => t - 1), 1000);
      return () => clearInterval(interval);
    } else if (timer === 0) {
      setTimedOut(true);
    }
  }, [timer, timedOut]);

  const handleChange = (idx, val) => {
    if (!/^[0-9]?$/.test(val)) return; // Only allow single digit
    const newCode = [...code];
    newCode[idx] = val;
    setCode(newCode);
    if (val && idx < 5) {
      inputRefs.current[idx + 1]?.focus();
    }
    if (!val && idx > 0) {
      inputRefs.current[idx - 1]?.focus();
    }
  };

  const handlePaste = (e) => {
    const paste = e.clipboardData
      .getData("text")
      .replace(/\D/g, "")
      .slice(0, 6);
    if (paste.length === 6) {
      setCode(paste.split(""));
      inputRefs.current[5]?.focus();
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setMessage("");
    if (timedOut) return;
    const codeStr = code.join("");
    if (codeStr.length !== 6) {
      setError("Please enter the 6-digit code.");
      return;
    }
    try {
      await axios.post("http://localhost:4000/api/verify-reset-code", {
        email,
        code: codeStr,
      });
      setMessage("Code verified! Redirecting...");
      setTimeout(() => router.push("/forgot-password/reset"), 1500);
    } catch (err) {
      setError(err.response?.data?.error || "Invalid or expired code.");
    }
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-gradient-to-br from-blue-900 via-gray-900 to-gray-800">
      <div className="dark:bg-dark/90 w-full max-w-md rounded-2xl bg-white/90 p-8 shadow-2xl backdrop-blur-md">
        <div className="mb-6 flex flex-col items-center">
          <div className="mb-2 rounded-full bg-blue-100 p-3 dark:bg-blue-900">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              fill="none"
              viewBox="0 0 24 24"
              strokeWidth={1.5}
              stroke="currentColor"
              className="h-8 w-8 text-blue-600 dark:text-blue-300"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M12 15.75v.008h.008V15.75H12zm0-3.75v.008h.008V12H12zm0-3.75v.008h.008V8.25H12zm0-3.75v.008h.008V4.5H12z"
              />
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M16.5 10.5V7.5A4.5 4.5 0 008 7.5v3m8.25 0h-8.5M4.5 10.5v7.5a2.25 2.25 0 002.25 2.25h10.5a2.25 2.25 0 002.25-2.25v-7.5"
              />
            </svg>
          </div>
          <h2 className="mb-1 text-3xl font-extrabold text-gray-900 dark:text-white">
            Verify Code
          </h2>
          <p className="text-center text-base text-gray-600 dark:text-gray-300">
            Enter the 6-digit code sent to your email:
          </p>
        </div>
        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="mb-2 flex justify-center gap-2">
            {code.map((digit, idx) => (
              <input
                key={idx}
                ref={(el) => {
                  inputRefs.current[idx] = el;
                }}
                type="text"
                inputMode="numeric"
                maxLength={1}
                value={digit}
                onChange={(e) => handleChange(idx, e.target.value)}
                onPaste={idx === 0 ? handlePaste : undefined}
                disabled={timedOut}
                className="h-14 w-12 rounded-lg border border-gray-300 bg-gray-50 text-center text-2xl transition-all focus:border-blue-500 focus:ring-2 focus:ring-blue-200 dark:border-gray-700 dark:bg-gray-800 dark:text-white dark:focus:border-blue-400 dark:focus:ring-blue-900"
              />
            ))}
          </div>
          <div className="flex items-center justify-center gap-2">
            <span className="text-sm text-gray-600 dark:text-gray-300">
              Time left:
            </span>
            <span
              className={`text-lg font-bold ${timer <= 10 ? "text-red-500" : "text-blue-600"} transition-colors`}
            >
              {timer}s
            </span>
          </div>
          {timedOut && (
            <div className="text-center font-semibold text-red-500">
              Timed out. Please request a new code.
            </div>
          )}
          {error && (
            <div className="text-center text-sm font-medium text-red-500">
              {error}
            </div>
          )}
          {message && (
            <div className="text-center text-sm font-medium text-green-600">
              {message}
            </div>
          )}
          <button
            type="submit"
            className="w-full rounded-lg bg-blue-600 py-3 text-lg font-semibold text-white shadow-md transition-all duration-200 hover:bg-blue-700 focus:ring-2 focus:ring-blue-400 focus:ring-offset-2 focus:outline-none"
            disabled={timedOut}
          >
            Verify Code
          </button>
        </form>
      </div>
    </div>
  );
}
