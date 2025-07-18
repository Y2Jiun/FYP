"use client";
import React, { useState } from "react";
import axios from "axios";
import { useRouter } from "next/navigation";

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState("");
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  const router = useRouter();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setMessage("");
    const cleanEmail = email.trim().toLowerCase();
    try {
      await axios.post("http://localhost:4000/api/forgot-password", {
        email: cleanEmail,
      });
      setMessage("A 6-digit code has been sent to your email.");
      // Save email to sessionStorage for next steps
      sessionStorage.setItem("resetEmail", cleanEmail);
      setTimeout(() => router.push("/forgot-password/verify"), 1500);
    } catch (err: any) {
      setError(err.response?.data?.error || "Failed to send code.");
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
                d="M16.5 10.5V7.5A4.5 4.5 0 008 7.5v3m8.25 0h-8.5M4.5 10.5v7.5a2.25 2.25 0 002.25 2.25h10.5a2.25 2.25 0 002.25-2.25v-7.5"
              />
            </svg>
          </div>
          <h2 className="mb-1 text-3xl font-extrabold text-gray-900 dark:text-white">
            Forgot Password
          </h2>
          <p className="text-center text-base text-gray-600 dark:text-gray-300">
            Enter your email address and we'll send you a 6-digit code to reset
            your password.
          </p>
        </div>
        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <label className="mb-2 block text-sm font-semibold text-gray-700 dark:text-gray-200">
              Enter your email address:
            </label>
            <input
              type="email"
              className="w-full rounded-lg border border-gray-300 bg-gray-50 p-3 text-base text-gray-900 focus:border-blue-500 focus:ring-2 focus:ring-blue-200 dark:border-gray-700 dark:bg-gray-800 dark:text-white dark:focus:border-blue-400 dark:focus:ring-blue-900"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              placeholder="you@example.com"
            />
          </div>
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
          >
            Send Code
          </button>
        </form>
      </div>
    </div>
  );
}
