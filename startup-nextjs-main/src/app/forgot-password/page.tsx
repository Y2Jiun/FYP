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
    try {
      await axios.post("/api/forgot-password", { email });
      setMessage("A 6-digit code has been sent to your email.");
      // Save email to sessionStorage for next steps
      sessionStorage.setItem("resetEmail", email);
      setTimeout(() => router.push("/forgot-password/verify"), 1500);
    } catch (err: any) {
      setError(err.response?.data?.error || "Failed to send code.");
    }
  };

  return (
    <div className="dark:bg-dark mx-auto mt-20 max-w-md rounded bg-white p-6 shadow">
      <h2 className="mb-4 text-2xl font-bold">Forgot Password</h2>
      <form onSubmit={handleSubmit}>
        <label className="mb-2 block">Enter your email address:</label>
        <input
          type="email"
          className="mb-4 w-full rounded border p-2"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
        />
        {error && <div className="mb-2 text-red-500">{error}</div>}
        {message && <div className="mb-2 text-green-500">{message}</div>}
        <button
          type="submit"
          className="w-full rounded bg-blue-600 py-2 text-white hover:bg-blue-700"
        >
          Send Code
        </button>
      </form>
    </div>
  );
}
