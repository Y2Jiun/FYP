"use client";
import { useEffect, useState } from "react";
import { db } from "@/lib/firebase";
import {
  doc,
  getDoc,
  collection,
  query,
  where,
  getDocs,
} from "firebase/firestore";
import AgentHeader from "@/components/Agent/agentHeader";
import { useRouter } from "next/navigation";
import Link from "next/link";

export default function AgentDashboardPage() {
  const [userData, setUserData] = useState(null);
  const [propertyCount, setPropertyCount] = useState(0);
  const [docCount, setDocCount] = useState(0);
  const [pendingVerifications, setPendingVerifications] = useState(0);
  const router = useRouter();

  useEffect(() => {
    const fetchUserAndStats = async () => {
      const userId =
        localStorage.getItem("userId") || localStorage.getItem("userID");
      if (!userId) {
        setUserData(null);
        return;
      }
      // Fetch user data
      const docRef = doc(db, "users", userId);
      const docSnap = await getDoc(docRef);
      if (docSnap.exists()) {
        setUserData(docSnap.data());
        // Fetch property count (properties assigned to this agent)
        const propQ = query(
          collection(db, "properties"),
          where("agentId", "==", userId),
        );
        const propSnap = await getDocs(propQ);
        setPropertyCount(propSnap.size);
        // Fetch document count (documents uploaded by this agent)
        const docQ = query(
          collection(db, "propertyDocuments"),
          where("uploadedBy", "==", userId),
        );
        const docSnapDocs = await getDocs(docQ);
        setDocCount(docSnapDocs.size);
        // Fetch pending verifications (properties assigned to agent with status 'pending')
        const pendingQ = query(
          collection(db, "properties"),
          where("agentId", "==", userId),
          where("status", "==", "pending"),
        );
        const pendingSnap = await getDocs(pendingQ);
        setPendingVerifications(pendingSnap.size);
      } else {
        setUserData(null);
      }
    };
    fetchUserAndStats();
  }, []);

  return (
    <>
      <AgentHeader />
      <div className="flex min-h-screen items-center justify-center bg-transparent">
        <div className="w-full max-w-2xl rounded-xl border border-gray-700 bg-white p-10 shadow-xl dark:bg-gray-800">
          <h1 className="mb-4 text-center text-3xl font-extrabold text-gray-900 dark:text-white">
            Welcome, Agent!
          </h1>
          {userData && (
            <div className="mb-8 text-center">
              <p className="text-lg text-gray-200">
                User ID:{" "}
                <span className="font-semibold text-gray-900 dark:text-white">
                  {userData.userID}
                </span>
              </p>
              <p className="text-lg text-gray-200">
                Username:{" "}
                <span className="font-semibold text-gray-900 dark:text-white">
                  {userData.username}
                </span>
              </p>
              <p className="text-lg text-gray-200">
                Email:{" "}
                <span className="font-semibold text-gray-900 dark:text-white">
                  {userData.email}
                </span>
              </p>
            </div>
          )}
          <div className="mb-8 grid grid-cols-1 gap-6 md:grid-cols-3">
            <div className="rounded-lg border border-gray-700 bg-gray-800 p-6 text-center shadow-md">
              <div className="text-2xl font-bold text-blue-400">
                {propertyCount}
              </div>
              <div className="mt-2 text-gray-300">Properties Assigned</div>
            </div>
            <div className="rounded-lg border border-gray-700 bg-gray-800 p-6 text-center shadow-md">
              <div className="text-2xl font-bold text-green-400">
                {docCount}
              </div>
              <div className="mt-2 text-gray-300">Documents Uploaded</div>
            </div>
            <div className="rounded-lg border border-gray-700 bg-gray-800 p-6 text-center shadow-md">
              <div className="text-2xl font-bold text-yellow-400">
                {pendingVerifications}
              </div>
              <div className="mt-2 text-gray-300">Pending Verifications</div>
            </div>
          </div>
          <div className="flex justify-center">
            <Link href="/agent/agentprofile">
              <button className="rounded bg-blue-600 px-6 py-2 font-semibold text-white transition-all hover:bg-blue-700">
                Go to Profile
              </button>
            </Link>
          </div>
        </div>
      </div>
    </>
  );
}
