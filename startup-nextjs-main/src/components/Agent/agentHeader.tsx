"use client";
import Link from "next/link";
import Image from "next/image";
import { useRouter } from "next/navigation";
import ThemeToggle from "@/app/agent/agentprofile/ThemeToggle";
import { useState, useEffect } from "react";
import { db } from "@/lib/firebase";
import { collection, query, where, getDocs } from "firebase/firestore";

const agentMenu = [
  { title: "Dashboard", path: "/agent/agent-dashboard" },
  { title: "Properties", path: "/agent/properties" },
  { title: "Documents", path: "/agent/documents" },
  // Remove Notifications from menu bar
  { title: "Profile", path: "/agent/agentprofile" },
];

export default function AgentHeader() {
  const router = useRouter();
  const [profilePic, setProfilePic] = useState("");

  useEffect(() => {
    const fetchProfilePic = async () => {
      const email = localStorage.getItem("userEmail");
      if (!email) return;
      const q = query(collection(db, "users"), where("email", "==", email));
      const querySnapshot = await getDocs(q);
      if (!querySnapshot.empty) {
        const docSnap = querySnapshot.docs[0];
        const data = docSnap.data();
        setProfilePic(data.profilePic || "");
      }
    };
    fetchProfilePic();
  }, []);

  const handleSignOut = () => {
    localStorage.clear();
    router.push("/signin");
  };

  return (
    <header className="header top-0 left-0 z-40 flex w-full items-center border-b border-gray-700 bg-[#181c23] shadow-lg">
      <div className="container flex items-center py-4">
        {/* Logo */}
        <div className="flex items-center gap-2">
          <Link
            href="/agent/agent-dashboard"
            className="flex items-center gap-2"
          >
            <Image
              src="/images/logo/logo-2.svg"
              alt="logo"
              width={40}
              height={40}
              className="h-10 w-auto dark:hidden"
            />
            <Image
              src="/images/logo/logo.svg"
              alt="logo"
              width={40}
              height={40}
              className="hidden h-10 w-auto dark:block"
            />
          </Link>
        </div>
        {/* Menu bar */}
        <nav className="ml-8 flex gap-8">
          {agentMenu.map((item) => (
            <Link
              key={item.title}
              href={item.path}
              className="hover:text-primary rounded px-3 py-2 font-medium text-white transition-colors duration-200"
            >
              {item.title}
            </Link>
          ))}
        </nav>
        {/* Spacer to push sign out/theme to right */}
        <div className="flex-1" />
        {/* Sign out and theme toggle */}
        <div className="ml-4 flex items-center gap-4">
          <Link href="/agent/agentprofile">
            <div className="border-primary flex h-14 w-14 cursor-pointer items-center justify-center overflow-hidden rounded-full border-2 bg-gray-100 transition-transform hover:scale-105">
              {profilePic ? (
                <img
                  src={profilePic}
                  alt="Profile"
                  className="h-full w-full object-cover"
                />
              ) : (
                <span className="text-2xl text-gray-400">👤</span>
              )}
            </div>
          </Link>
          <button
            onClick={handleSignOut}
            className="rounded bg-red-600 px-6 py-2 text-base font-bold text-white transition-colors duration-200 hover:bg-red-700"
          >
            Sign Out
          </button>
          <ThemeToggle />
          {/* Notification icon (moved to right of ThemeToggle) */}
          <Link href="/agent/agentNotification">
            <button
              className="ml-2 flex items-center justify-center rounded-full bg-gray-700 p-2 transition hover:bg-gray-600"
              title="Notifications"
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                fill="none"
                viewBox="0 0 24 24"
                strokeWidth={1.5}
                stroke="currentColor"
                className="h-7 w-7 text-white"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M14.25 17.25v.75a2.25 2.25 0 01-4.5 0v-.75m9-2.25V11a6.75 6.75 0 10-13.5 0v3.99c0 .414-.336.75-.75.75h-.75a.75.75 0 000 1.5h18a.75.75 0 000-1.5h-.75a.75.75 0 01-.75-.75z"
                />
              </svg>
            </button>
          </Link>
        </div>
      </div>
    </header>
  );
}
