"use client";
import Link from "next/link";
import Image from "next/image";
import { useRouter } from "next/navigation";
import ThemeToggle from "@/app/user/userprofile/ThemeToggle";
import { useState, useEffect } from "react";
import { db } from "@/lib/firebase";
import { collection, query, where, getDocs } from "firebase/firestore";
import { Menu } from "@headlessui/react";
import { ChevronDownIcon } from "@heroicons/react/24/outline";

const userMenu = [
  { title: "Dashboard", path: "/user/user-dashboard" },
  { title: "My Properties", path: "/user/userPropertyList" },
  { title: "Agent Verified", path: "/user/userToagent" },
];

export default function UserHeader() {
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
      } else {
        setProfilePic("");
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
          <Link href="/user/user-dashboard" className="flex items-center gap-2">
            {/* DeveloperShield Logo */}
            <div className="flex items-center space-x-2">
              <svg
                width="40"
                height="40"
                viewBox="0 0 60 60"
                fill="none"
                xmlns="http://www.w3.org/2000/svg"
                className="flex-shrink-0"
              >
                {/* Shield with house and security elements */}
                <g filter="url(#filter0_d)">
                  {/* Shield background */}
                  <path
                    d="M30 5L50 15V25C50 35 40 45 30 50C20 45 10 35 10 25V15L30 5Z"
                    fill="url(#shieldGradient)"
                    stroke="#4A6CF7"
                    strokeWidth="1.5"
                  />

                  {/* House inside shield */}
                  <g transform="translate(20, 20)">
                    {/* House structure */}
                    <path
                      d="M5 15L15 8L25 15V22H5V15Z"
                      fill="url(#houseGradient)"
                      stroke="#FFFFFF"
                      strokeWidth="0.8"
                    />
                    {/* Roof */}
                    <path
                      d="M5 15L15 8L25 15"
                      stroke="#FFFFFF"
                      strokeWidth="1.2"
                      fill="none"
                    />
                    {/* Windows */}
                    <rect
                      x="8"
                      y="12"
                      width="3"
                      height="3"
                      fill="url(#windowGradient)"
                      stroke="#FFFFFF"
                      strokeWidth="0.3"
                    />
                    <rect
                      x="19"
                      y="12"
                      width="3"
                      height="3"
                      fill="url(#windowGradient)"
                      stroke="#FFFFFF"
                      strokeWidth="0.3"
                    />
                    {/* Door */}
                    <rect
                      x="13"
                      y="15"
                      width="4"
                      height="7"
                      fill="url(#doorGradient)"
                      stroke="#FFFFFF"
                      strokeWidth="0.3"
                    />
                  </g>

                  {/* Security lock icon */}
                  <g transform="translate(25, 8)">
                    <circle
                      cx="5"
                      cy="5"
                      r="3"
                      fill="url(#lockGradient)"
                      stroke="#FFFFFF"
                      strokeWidth="0.5"
                    />
                    <rect
                      x="3"
                      y="5"
                      width="4"
                      height="3"
                      fill="url(#lockGradient)"
                      stroke="#FFFFFF"
                      strokeWidth="0.3"
                    />
                  </g>

                  {/* Transparency overlay */}
                  <path
                    d="M30 5L50 15V25C50 35 40 45 30 50C20 45 10 35 10 25V15L30 5Z"
                    fill="url(#transparencyGradient)"
                    opacity="0.2"
                  />
                </g>

                {/* Advanced Gradients */}
                <defs>
                  <linearGradient
                    id="shieldGradient"
                    x1="0%"
                    y1="0%"
                    x2="100%"
                    y2="100%"
                  >
                    <stop offset="0%" stopColor="#4A6CF7" stopOpacity="0.95" />
                    <stop offset="50%" stopColor="#3B82F6" stopOpacity="0.9" />
                    <stop
                      offset="100%"
                      stopColor="#1E40AF"
                      stopOpacity="0.85"
                    />
                  </linearGradient>
                  <linearGradient
                    id="houseGradient"
                    x1="0%"
                    y1="0%"
                    x2="100%"
                    y2="100%"
                  >
                    <stop offset="0%" stopColor="#FFFFFF" stopOpacity="0.9" />
                    <stop offset="100%" stopColor="#E5E7EB" stopOpacity="0.8" />
                  </linearGradient>
                  <linearGradient
                    id="windowGradient"
                    x1="0%"
                    y1="0%"
                    x2="100%"
                    y2="100%"
                  >
                    <stop offset="0%" stopColor="#FFFFFF" stopOpacity="0.9" />
                    <stop offset="100%" stopColor="#F3F4F6" stopOpacity="0.7" />
                  </linearGradient>
                  <linearGradient
                    id="doorGradient"
                    x1="0%"
                    y1="0%"
                    x2="100%"
                    y2="100%"
                  >
                    <stop offset="0%" stopColor="#4A6CF7" stopOpacity="0.8" />
                    <stop offset="100%" stopColor="#3B82F6" stopOpacity="0.6" />
                  </linearGradient>
                  <linearGradient
                    id="lockGradient"
                    x1="0%"
                    y1="0%"
                    x2="100%"
                    y2="100%"
                  >
                    <stop offset="0%" stopColor="#10B981" stopOpacity="0.9" />
                    <stop offset="100%" stopColor="#059669" stopOpacity="0.8" />
                  </linearGradient>
                  <linearGradient
                    id="transparencyGradient"
                    x1="0%"
                    y1="0%"
                    x2="100%"
                    y2="100%"
                  >
                    <stop offset="0%" stopColor="#FFFFFF" stopOpacity="0.3" />
                    <stop offset="100%" stopColor="#4A6CF7" stopOpacity="0.1" />
                  </linearGradient>
                  <filter
                    id="filter0_d"
                    x="0"
                    y="0"
                    width="60"
                    height="60"
                    filterUnits="userSpaceOnUse"
                  >
                    <feFlood floodOpacity="0" result="BackgroundImageFix" />
                    <feColorMatrix
                      in="SourceAlpha"
                      type="matrix"
                      values="0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 127 0"
                    />
                    <feOffset dy="3" />
                    <feGaussianBlur stdDeviation="3" />
                    <feColorMatrix
                      type="matrix"
                      values="0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0.15 0"
                    />
                    <feBlend
                      mode="normal"
                      in2="BackgroundImageFix"
                      result="effect1_dropShadow"
                    />
                    <feBlend
                      mode="normal"
                      in="SourceGraphic"
                      in2="effect1_dropShadow"
                      result="shape"
                    />
                  </filter>
                </defs>
              </svg>

              {/* Logo Text */}
              <span className="text-xl font-bold tracking-wide text-white">
                DeveloperShield
              </span>
            </div>
          </Link>
        </div>
        {/* Menu bar */}
        <nav className="ml-8 flex gap-8">
          {userMenu.map((item) => (
            <Link
              key={item.title}
              href={item.path}
              className="hover:text-primary rounded px-3 py-2 font-medium text-white transition-colors duration-200"
            >
              {item.title}
            </Link>
          ))}
          <Menu as="div" className="relative inline-block text-left">
            <Menu.Button className="hover:text-primary flex items-center gap-1 rounded px-3 py-2 font-medium text-white transition-colors duration-200">
              Other
              <ChevronDownIcon className="h-4 w-4" />
            </Menu.Button>
            <Menu.Items className="absolute right-0 z-50 mt-2 w-48 origin-top-right rounded-md bg-[#23272f] shadow-lg ring-1 ring-black/5 focus:outline-none">
              <div className="py-1">
                <Menu.Item>
                  {({ active }) => (
                    <Link
                      href="/user/userCalculator"
                      className={`block px-4 py-2 text-sm text-white transition-colors duration-200 ${active ? "bg-gray-700" : ""}`}
                    >
                      Loan Calculator
                    </Link>
                  )}
                </Menu.Item>
                <Menu.Item>
                  {({ active }) => (
                    <Link
                      href="/user/userChatbot"
                      className={`block px-4 py-2 text-sm text-white transition-colors duration-200 ${active ? "bg-gray-700" : ""}`}
                    >
                      Chatbot
                    </Link>
                  )}
                </Menu.Item>
              </div>
            </Menu.Items>
          </Menu>
        </nav>
        {/* Spacer to push sign out/theme to right */}
        <div className="flex-1" />
        {/* Sign out and theme toggle */}
        <div className="ml-4 flex items-center gap-4">
          <Link href="/user/userprofile">
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
          <Link href="/user/userNotification">
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
