"use client";
import React, { useState } from "react";
import axios from "axios";
import { useRouter } from "next/navigation";

export default function VerifyCodePage() {
  const [code, setCode] = useState("");
  const [error, setError] = useState("");
  const [message, setMessage] = useState("");
  const router = useRouter();
  const email =
    typeof window !== "undefined" ? sessionStorage.getItem("resetEmail") : "";

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setMessage("");
    try {
      await axios.post("/api/verify-reset-code", { email, code });
      setMessage("Code verified! Redirecting...");
      setTimeout(() => router.push("/forgot-password/reset"), 1500);
    } catch (err: any) {
      setError(err.response?.data?.error || "Invalid or expired code.");
    }
  };

  return (
    <div className="dark:bg-dark mx-auto mt-20 max-w-md rounded bg-white p-6 shadow">
      <h2 className="mb-4 text-2xl font-bold">Verify Code</h2>
      <form onSubmit={handleSubmit}>
        <label className="mb-2 block">
          Enter the 6-digit code sent to your email:
        </label>
        <input
          type="text"
          className="mb-4 w-full rounded border p-2"
          value={code}
          onChange={(e) => setCode(e.target.value)}
          maxLength={6}
          required
        />
        {error && <div className="mb-2 text-red-500">{error}</div>}
        {message && <div className="mb-2 text-green-500">{message}</div>}
        <button
          type="submit"
          className="w-full rounded bg-blue-600 py-2 text-white hover:bg-blue-700"
        >
          Verify Code
        </button>
      </form>
    </div>
  );
}
