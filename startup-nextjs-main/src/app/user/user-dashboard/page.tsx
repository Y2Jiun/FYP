"use client";
import React, { useEffect, useState } from "react";
import UserHeader from "@/components/User/userHeader";
import { db } from "@/lib/firebase";
import { collection, getDocs, query, where } from "firebase/firestore";
import Link from "next/link";

export default function UserDashboard() {
  const [userId, setUserId] = useState<string | null>(null);
  const [propertyCount, setPropertyCount] = useState(0);
  const [pendingCount, setPendingCount] = useState(0);
  const [notificationCount, setNotificationCount] = useState(0);
  const [loading, setLoading] = useState(true);

  // Set userId from localStorage on client only
  useEffect(() => {
    if (typeof window !== "undefined") {
      setUserId(localStorage.getItem("userID"));
    }
  }, []);

  useEffect(() => {
    if (!userId) return; // Don't fetch until userId is set
    const fetchData = async () => {
      setLoading(true);
      try {
        let propertyQ = query(
          collection(db, "properties"),
          where("ownerId", "==", userId),
        );
        const propertySnap = await getDocs(propertyQ);
        setPropertyCount(propertySnap.size);
        setPendingCount(
          propertySnap.docs.filter((doc) => doc.data().status === "pending")
            .length,
        );

        const notifQ = query(
          collection(db, "notification"),
          where("audience", "in", [3, "user"]),
        );
        const notifSnap = await getDocs(notifQ);
        setNotificationCount(notifSnap.size);
      } catch (error) {
        console.error("Error fetching dashboard data:", error);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, [userId]);

  return (
    <>
      <UserHeader />
      <div className="min-h-screen bg-gray-50 py-10 dark:bg-gray-900">
        <div className="container mx-auto px-4">
          <h1 className="mb-6 text-3xl font-bold text-gray-900 dark:text-white">
            Welcome to Your Dashboard
          </h1>
          <div className="mb-8 grid grid-cols-1 gap-6 md:grid-cols-3">
            <div className="flex flex-col items-center rounded-lg bg-white p-6 shadow-md dark:bg-gray-800">
              <div className="mb-2 text-blue-600 dark:text-blue-400">
                <svg
                  className="h-8 w-8"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth={2}
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M3 7v4a1 1 0 001 1h3m10-5v4a1 1 0 001 1h3m-6 4v4a1 1 0 001 1h3m-10-5v4a1 1 0 001 1h3"
                  />
                </svg>
              </div>
              <div className="text-2xl font-bold text-gray-900 dark:text-white">
                {loading ? "-" : propertyCount}
              </div>
              <div className="mt-1 text-gray-600 dark:text-gray-300">
                My Properties
              </div>
            </div>
            <div className="flex flex-col items-center rounded-lg bg-white p-6 shadow-md dark:bg-gray-800">
              <div className="mb-2 text-yellow-600 dark:text-yellow-400">
                <svg
                  className="h-8 w-8"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth={2}
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M12 8v4l3 3m6 0a9 9 0 11-18 0 9 9 0 0118 0z"
                  />
                </svg>
              </div>
              <div className="text-2xl font-bold text-gray-900 dark:text-white">
                {loading ? "-" : pendingCount}
              </div>
              <div className="mt-1 text-gray-600 dark:text-gray-300">
                Pending Verifications
              </div>
            </div>
            <div className="flex flex-col items-center rounded-lg bg-white p-6 shadow-md dark:bg-gray-800">
              <div className="mb-2 text-purple-600 dark:text-purple-400">
                <svg
                  className="h-8 w-8"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth={2}
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M15 17h5l-5 5v-5zM4.19 4A2 2 0 002.38 5.85V19a2 2 0 002 2h12a2 2 0 002-2V5.85A2 2 0 0019.81 4H4.19z"
                  />
                </svg>
              </div>
              <div className="text-2xl font-bold text-gray-900 dark:text-white">
                {loading ? "-" : notificationCount}
              </div>
              <div className="mt-1 text-gray-600 dark:text-gray-300">
                Notifications
              </div>
            </div>
          </div>
          <div className="rounded-lg bg-white p-6 shadow-md dark:bg-gray-800">
            <h2 className="mb-2 text-xl font-semibold text-gray-900 dark:text-white">
              Quick Actions
            </h2>
            <div className="flex flex-wrap gap-4">
              <a
                href="/user/userPropertyList"
                className="rounded bg-blue-600 px-4 py-2 text-white transition hover:bg-blue-700"
              >
                View My Properties
              </a>
              <a
                href="/user/userNotification"
                className="rounded bg-purple-600 px-4 py-2 text-white transition hover:bg-purple-700"
              >
                View Notifications
              </a>
              <a
                href="/user/userprofile"
                className="rounded bg-gray-600 px-4 py-2 text-white transition hover:bg-gray-700"
              >
                Profile
              </a>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
