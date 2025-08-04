"use client";
import Link from "next/link";
import Image from "next/image";
import { useRouter } from "next/navigation";
import ThemeToggler from "@/components/Header/ThemeToggler";
import { useState, useEffect, useRef } from "react";
import { db } from "@/lib/firebase";
import {
  collection,
  query,
  where,
  getDocs,
  onSnapshot,
} from "firebase/firestore";

const adminMenu = [
  { title: "Dashboard", path: "/admin/admin-dashboard" },
  {
    title: "Update Agent",
    submenu: [
      { title: "Agent Request", path: "/admin/updateAgent" },
      { title: "Ban Appeals", path: "/admin/agentTouser" },
    ],
  },
  {
    title: "Content",
    submenu: [
      { title: "Blog/News", path: "/admin/adminContentManagement" },
      { title: "FAQ", path: "/admin/faqManagement" },
    ],
  },
  {
    title: "Property",
    submenu: [
      {
        title: "Property Verification & Documentation",
        path: "/admin/propertyVerification",
      },
      {
        title: "Document Verification",
        path: "/admin/adminVerificationQueue",
      },
    ],
  },
  { title: "Report", path: "/admin/adminReport" },
];

export default function AdminHeader() {
  const router = useRouter();
  const [menuOpen, setMenuOpen] = useState(false);
  const [profilePic, setProfilePic] = useState("");
  const [dropdown, setDropdown] = useState("");
  const [notificationCount, setNotificationCount] = useState(0);
  const dropdownTimeout = useRef(null);

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

  // Fetch notification count with real-time listener
  useEffect(() => {
    const notifQuery = query(
      collection(db, "notification"),
      where("audience", "in", [3, "all", "admin"]),
    );

    const unsubscribe = onSnapshot(
      notifQuery,
      (snapshot) => {
        setNotificationCount(snapshot.size);
      },
      (error) => {
        console.error("Error listening to notifications:", error);
      },
    );

    return () => unsubscribe();
  }, []);

  const handleSignOut = () => {
    localStorage.clear();
    router.push("/signin");
  };

  return (
    <header className="header top-0 left-0 z-40 flex w-full items-center border-b border-gray-700 bg-white shadow-lg dark:bg-[#181c23]">
      <div className="container flex items-center py-4">
        {/* Logo */}
        <div className="flex items-center gap-2">
          <Link
            href="/admin/admin-dashboard"
            className="flex items-center gap-2"
          >
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
              <span className="text-xl font-bold tracking-wide text-gray-900 dark:text-white">
                DeveloperShield
              </span>
            </div>
          </Link>
        </div>
        {/* Menu bar */}
        <nav className="ml-8 flex gap-8">
          {adminMenu.map((item) =>
            item.submenu ? (
              <div
                key={item.title}
                className="group relative"
                onMouseEnter={() => {
                  if (dropdownTimeout.current)
                    clearTimeout(dropdownTimeout.current);
                  setDropdown(item.title);
                }}
                onMouseLeave={() => {
                  dropdownTimeout.current = setTimeout(() => {
                    setDropdown("");
                  }, 200); // 200ms delay
                }}
              >
                <button
                  className="hover:text-primary flex items-center gap-1 rounded px-3 py-2 font-medium text-gray-900 transition-colors duration-200 dark:text-white"
                  type="button"
                >
                  {item.title}
                  <svg
                    className="ml-1 h-4 w-4"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      d="M19 9l-7 7-7-7"
                    />
                  </svg>
                </button>
                {/* Dropdown menu */}
                {dropdown === item.title && (
                  <div
                    className="absolute left-0 z-50 mt-2 w-64 rounded-md bg-white shadow-lg dark:bg-[#23272f]"
                    onMouseEnter={() => {
                      if (dropdownTimeout.current)
                        clearTimeout(dropdownTimeout.current);
                      setDropdown(item.title);
                    }}
                    onMouseLeave={() => {
                      dropdownTimeout.current = setTimeout(() => {
                        setDropdown("");
                      }, 200);
                    }}
                  >
                    {item.submenu.map((sub) => (
                      <Link
                        key={sub.title}
                        href={sub.path}
                        className="block rounded px-4 py-2 text-gray-900 transition-colors duration-200 hover:bg-gray-700 dark:text-white"
                      >
                        {sub.title}
                      </Link>
                    ))}
                  </div>
                )}
              </div>
            ) : (
              <Link
                key={item.title}
                href={item.path}
                className="hover:text-primary rounded px-3 py-2 font-medium text-gray-900 transition-colors duration-200 dark:text-white"
              >
                {item.title}
              </Link>
            ),
          )}
        </nav>
        {/* Spacer to push sign out/theme to right */}
        <div className="flex-1" />
        {/* Mobile menu toggle */}
        <button
          className="text-gray-900 focus:outline-none md:hidden dark:text-white"
          onClick={() => setMenuOpen((prev) => !prev)}
          aria-label="Toggle menu"
        >
          <svg width="28" height="28" fill="none" viewBox="0 0 24 24">
            <path
              stroke="currentColor"
              strokeWidth="2"
              d="M4 6h16M4 12h16M4 18h16"
            />
          </svg>
        </button>
        {/* Sign out and theme toggle */}
        <div className="ml-4 flex items-center gap-4">
          <Link href="/admin/adminprofile">
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
          <ThemeToggler />
          <Link href="/admin/adminNotification">
            <button
              className="relative ml-2 flex items-center justify-center rounded-full bg-gray-200 p-2 transition hover:bg-gray-300 dark:bg-gray-700 dark:hover:bg-gray-600"
              title="Notifications"
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                fill="none"
                viewBox="0 0 24 24"
                strokeWidth={1.5}
                stroke="currentColor"
                className="h-7 w-7 text-gray-700 dark:text-white"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M14.25 17.25v.75a2.25 2.25 0 01-4.5 0v-.75m9-2.25V11a6.75 6.75 0 10-13.5 0v3.99c0 .414-.336.75-.75.75h-.75a.75.75 0 000 1.5h18a.75.75 0 000-1.5h-.75a.75.75 0 01-.75-.75z"
                />
              </svg>
              {notificationCount > 0 && (
                <span className="absolute -top-1 -right-1 flex h-5 w-5 items-center justify-center rounded-full bg-red-500 text-xs font-bold text-white">
                  {notificationCount > 99 ? "99+" : notificationCount}
                </span>
              )}
            </button>
          </Link>
        </div>
      </div>
      {/* Mobile menu */}
      {menuOpen && (
        <nav className="absolute top-full left-0 z-50 w-full border-b border-gray-700 bg-white shadow-lg md:hidden dark:bg-[#181c23]">
          <ul className="flex flex-col gap-2 p-4">
            <li>
              <Link
                href="/admin/adminNotification"
                className="hover:text-primary flex items-center justify-between rounded px-3 py-2 font-medium text-gray-900 transition-colors duration-200 dark:text-white"
                onClick={() => setMenuOpen(false)}
              >
                <span>Notifications</span>
                {notificationCount > 0 && (
                  <span className="flex h-5 w-5 items-center justify-center rounded-full bg-red-500 text-xs font-bold text-white">
                    {notificationCount > 99 ? "99+" : notificationCount}
                  </span>
                )}
              </Link>
            </li>
            {adminMenu.map((item) =>
              item.submenu ? (
                <li key={item.title}>
                  <div className="relative">
                    <button
                      className="hover:text-primary block flex w-full items-center gap-1 rounded px-3 py-2 text-left font-medium text-gray-900 transition-colors duration-200 dark:text-white"
                      onClick={() =>
                        setDropdown(dropdown === item.title ? "" : item.title)
                      }
                    >
                      {item.title}
                      <svg
                        className="ml-1 h-4 w-4"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="2"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          d="M19 9l-7 7-7-7"
                        />
                      </svg>
                    </button>
                    {dropdown === item.title && (
                      <div className="mt-1 ml-4 rounded-md bg-white shadow-lg dark:bg-[#23272f]">
                        {item.submenu.map((sub) => (
                          <Link
                            key={sub.title}
                            href={sub.path}
                            className="block rounded px-4 py-2 text-gray-900 transition-colors duration-200 hover:bg-gray-700 dark:text-white"
                            onClick={() => setMenuOpen(false)}
                          >
                            {sub.title}
                          </Link>
                        ))}
                      </div>
                    )}
                  </div>
                </li>
              ) : (
                <li key={item.title}>
                  <Link
                    href={item.path}
                    className="hover:text-primary block rounded px-3 py-2 font-medium text-gray-900 transition-colors duration-200 dark:text-white"
                    onClick={() => setMenuOpen(false)}
                  >
                    {item.title}
                  </Link>
                </li>
              ),
            )}
          </ul>
        </nav>
      )}
    </header>
  );
}
