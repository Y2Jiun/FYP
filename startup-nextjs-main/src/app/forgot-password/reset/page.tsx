"use client";
import React, { useState } from "react";
import axios from "axios";
import { useRouter } from "next/navigation";

export default function ResetPasswordPage() {
  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [error, setError] = useState("");
  const [message, setMessage] = useState("");
  const router = useRouter();
  const email =
    typeof window !== "undefined" ? sessionStorage.getItem("resetEmail") : "";

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setMessage("");
    if (password !== confirm) {
      setError("Passwords do not match.");
      return;
    }
    try {
      await axios.post("/api/reset-password", { email, password });
      setMessage("Password reset successful! Redirecting to sign in...");
      setTimeout(() => router.push("/signin"), 1500);
    } catch (err: any) {
      setError(err.response?.data?.error || "Failed to reset password.");
    }
  };

  return (
    <div className="dark:bg-dark mx-auto mt-20 max-w-md rounded bg-white p-6 shadow">
      <h2 className="mb-4 text-2xl font-bold">Reset Password</h2>
      <form onSubmit={handleSubmit}>
        <label className="mb-2 block">Enter your new password:</label>
        <input
          type="password"
          className="mb-4 w-full rounded border p-2"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          required
        />
        <label className="mb-2 block">Confirm new password:</label>
        <input
          type="password"
          className="mb-4 w-full rounded border p-2"
          value={confirm}
          onChange={(e) => setConfirm(e.target.value)}
          required
        />
        {error && <div className="mb-2 text-red-500">{error}</div>}
        {message && <div className="mb-2 text-green-500">{message}</div>}
        <button
          type="submit"
          className="w-full rounded bg-blue-600 py-2 text-white hover:bg-blue-700"
        >
          Reset Password
        </button>
      </form>
    </div>
  );
}
