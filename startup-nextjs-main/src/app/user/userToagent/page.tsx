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
  addDoc,
} from "firebase/firestore";
import { onAuthStateChanged } from "firebase/auth";
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

        // Get user data
        const userQuery = query(
          collection(db, "users"),
          where("firebaseUID", "==", user.uid),
        );
        const userSnap = await getDocs(userQuery);
        if (!userSnap.empty) {
          const userData = userSnap.docs[0].data();
          setAgentRequest(userData.agentRequest ?? 0);

          // Check if there's a recent agent request
          const agentRequestQuery = query(
            collection(db, "agentRequests"),
            where("userUID", "==", user.uid),
            where("status", "in", ["pending", "approved", "rejected"]),
          );
          const agentRequestSnap = await getDocs(agentRequestQuery);
          if (!agentRequestSnap.empty) {
            const latestRequest = agentRequestSnap.docs[0].data();
            if (latestRequest.status === "pending") {
              setAgentRequest(1); // Show pending status
            } else if (latestRequest.status === "approved") {
              setAgentRequest(2); // Show approved status
            } else if (latestRequest.status === "rejected") {
              setAgentRequest(3); // Show rejected status
            }
          }
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
      // Wait for auth state to be ready
      const user = await new Promise((resolve, reject) => {
        const unsubscribe = onAuthStateChanged(auth, (user) => {
          unsubscribe();
          if (user) {
            resolve(user);
          } else {
            reject(new Error("Not logged in"));
          }
        });
      });

      console.log("Current user:", user.uid);
      console.log("User authentication status:", user.emailVerified);
      console.log("User email:", user.email);

      // Get user data
      const q = query(
        collection(db, "users"),
        where("firebaseUID", "==", user.uid),
      );
      const snap = await getDocs(q);
      if (snap.empty) throw new Error("User not found");
      const userData = snap.docs[0].data();
      const userDocId = snap.docs[0].id;

      console.log("User data:", userData);
      console.log("User doc ID:", userDocId);

      // Update user agentRequest status
      console.log("Updating user agentRequest to 1...");
      await updateDoc(doc(db, "users", userDocId), { agentRequest: 1 });
      console.log("User agentRequest updated successfully");

      // Create agent request record
      const agentRequestData = {
        userUID: user.uid,
        userID: userData.userID || userDocId, // Use userID field or fallback to document ID
        username: userData.username,
        email: userData.email,
        status: "pending", // pending, approved, rejected
        requestDate: new Date(),
        adminUID: null,
        adminID: null,
        responseDate: null,
        responseMessage: null,
      };

      console.log("Agent request data:", agentRequestData);
      console.log("Adding document to agentRequests collection...");
      await addDoc(collection(db, "agentRequests"), agentRequestData);
      console.log("Agent request document added successfully");

      setSuccess(true);
    } catch (err: any) {
      console.error("Error in handleRequest:", err);
      setError(err.message || "Failed to request agent status.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <UserHeader />
      <div className="flex min-h-screen flex-col items-center justify-center bg-white p-8 dark:bg-[#181c23]">
        <div className="w-full max-w-lg rounded-2xl bg-white p-10 shadow-2xl dark:bg-gray-800">
          <h2 className="mb-3 text-center text-3xl font-extrabold text-blue-700 drop-shadow-lg dark:text-blue-300">
            Become a Verified Agent
          </h2>
          <p className="mb-2 text-center text-lg text-gray-700 dark:text-gray-200">
            Unlock exclusive features, list properties, and connect with more
            clients by becoming a verified agent on DeveloperShield.
          </p>
          <ul className="mb-6 list-disc pl-8 text-sm text-gray-600 dark:text-gray-300">
            <li>Get access to agent-only tools and analytics</li>
            <li>Boost your credibility and visibility</li>
            <li>Receive priority support from our team</li>
          </ul>
          <div className="mb-6 rounded-lg bg-blue-50 p-4 text-center text-blue-700 dark:bg-blue-900/40 dark:text-blue-200">
            <span className="font-semibold">How it works:</span> Submit your
            request below. Our admin team will review your application and
            notify you once approved.
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
              You have already submitted a request. Please wait for admin
              approval.
            </div>
          ) : agentRequest === 2 ? (
            <div className="mb-4 text-center text-lg font-semibold text-green-600 dark:text-green-400">
              🎉 Congratulations! Your agent request has been approved! You can
              now access agent features.
            </div>
          ) : agentRequest === 3 ? (
            <div className="mb-4 text-center text-lg font-semibold text-red-600 dark:text-red-400">
              Your agent request has been rejected. You can apply again in the
              future.
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
