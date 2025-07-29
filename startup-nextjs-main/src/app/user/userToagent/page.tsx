"use client";
import React, { useState, useEffect } from "react";
import { auth, db } from "@/lib/firebase";
import {
  collection,
  query,
  where,
  getDocs,
  updateDoc,
  doc,
} from "firebase/firestore";
import UserHeader from "@/components/User/userHeader";

export default function UserToAgentPage() {
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState("");
  const [agentRequest, setAgentRequest] = useState<number | null>(null);

  useEffect(() => {
    const fetchAgentRequest = async () => {
      try {
        const user = auth.currentUser;
        if (!user) return;
        const q = query(
          collection(db, "users"),
          where("firebaseUID", "==", user.uid),
        );
        const snap = await getDocs(q);
        if (!snap.empty) {
          const data = snap.docs[0].data();
          setAgentRequest(data.agentRequest ?? 0);
        }
      } catch (err) {
        setAgentRequest(0); // fallback
      }
    };
    fetchAgentRequest();
  }, []);

  const handleRequest = async () => {
    setLoading(true);
    setError("");
    setSuccess(false);
    try {
      const user = auth.currentUser;
      if (!user) throw new Error("Not logged in");
      const q = query(
        collection(db, "users"),
        where("firebaseUID", "==", user.uid),
      );
      const snap = await getDocs(q);
      if (snap.empty) throw new Error("User not found");
      const userDocId = snap.docs[0].id;
      await updateDoc(doc(db, "users", userDocId), { agentRequest: 1 });
      setSuccess(true);
    } catch (err: any) {
      setError(err.message || "Failed to request agent status.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <UserHeader />
      <div className="flex min-h-screen flex-col items-center justify-center bg-white dark:bg-[#181c23] p-8">
        <div className="w-full max-w-lg rounded-2xl bg-white p-10 shadow-2xl dark:bg-gray-800">
          <h2 className="mb-3 text-center text-3xl font-extrabold text-blue-700 drop-shadow-lg dark:text-blue-300">
            Become a Verified Agent
          </h2>
          <p className="mb-2 text-center text-lg text-gray-700 dark:text-gray-200">
            Unlock exclusive features, list properties, and connect with more clients by becoming a verified agent on DeveloperShield.
          </p>
          <ul className="mb-6 list-disc pl-8 text-sm text-gray-600 dark:text-gray-300">
            <li>Get access to agent-only tools and analytics</li>
            <li>Boost your credibility and visibility</li>
            <li>Receive priority support from our team</li>
          </ul>
          <div className="mb-6 rounded-lg bg-blue-50 p-4 text-center text-blue-700 dark:bg-blue-900/40 dark:text-blue-200">
            <span className="font-semibold">How it works:</span> Submit your request below. Our admin team will review your application and notify you once approved.
          </div>
          {success ? (
            <div className="mb-4 text-center text-lg font-semibold text-green-600 dark:text-green-400">
              Request submitted! Please wait for admin approval.
            </div>
          ) : agentRequest === 0 ? (
            <button
              className="w-full rounded-lg bg-gradient-to-r from-blue-600 to-blue-500 px-8 py-4 text-lg font-bold text-white shadow-lg transition-all duration-200 hover:from-blue-700 hover:to-blue-600 disabled:opacity-50"
              onClick={handleRequest}
              disabled={loading}
            >
              {loading ? "Submitting..." : "Request Agent Access"}
            </button>
          ) : agentRequest === 1 ? (
            <div className="mb-4 text-center text-lg font-semibold text-yellow-600 dark:text-yellow-400">
              You have already submitted a request. Please wait for admin approval.
            </div>
          ) : null}
          {error && (
            <div className="mt-4 text-center text-red-500">{error}</div>
          )}
        </div>
      </div>
    </>
  );
}
