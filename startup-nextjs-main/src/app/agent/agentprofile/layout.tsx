"use client";
import Link from "next/link";
import { useRouter } from "next/navigation";
import ThemeToggler from "@/components/Header/ThemeToggler";
import { useEffect, useState } from "react";
import { auth, db } from "@/lib/firebase";
import {
  doc,
  getDocs,
  collection,
  query,
  where,
  setDoc,
  serverTimestamp,
} from "firebase/firestore";

export default function AgentProfileLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const router = useRouter();

  const handleSignOut = () => {
    localStorage.clear();
    router.push("/signin");
  };

  return (
    <div className="min-h-screen bg-white dark:bg-[#181c23]">
      <header className="header top-0 left-0 z-40 flex w-full items-center border-b border-gray-300 bg-white shadow-lg dark:border-gray-700 dark:bg-[#181c23]">
        <div className="container flex items-center justify-between py-4">
          {/* Logo */}
          <div className="flex items-center gap-2">
            <Link
              href="/agent/agent-dashboard"
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
                      <stop
                        offset="0%"
                        stopColor="#4A6CF7"
                        stopOpacity="0.95"
                      />
                      <stop
                        offset="50%"
                        stopColor="#3B82F6"
                        stopOpacity="0.9"
                      />
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
                      <stop
                        offset="100%"
                        stopColor="#E5E7EB"
                        stopOpacity="0.8"
                      />
                    </linearGradient>
                    <linearGradient
                      id="windowGradient"
                      x1="0%"
                      y1="0%"
                      x2="100%"
                      y2="100%"
                    >
                      <stop offset="0%" stopColor="#FFFFFF" stopOpacity="0.9" />
                      <stop
                        offset="100%"
                        stopColor="#F3F4F6"
                        stopOpacity="0.7"
                      />
                    </linearGradient>
                    <linearGradient
                      id="doorGradient"
                      x1="0%"
                      y1="0%"
                      x2="100%"
                      y2="100%"
                    >
                      <stop offset="0%" stopColor="#4A6CF7" stopOpacity="0.8" />
                      <stop
                        offset="100%"
                        stopColor="#3B82F6"
                        stopOpacity="0.6"
                      />
                    </linearGradient>
                    <linearGradient
                      id="lockGradient"
                      x1="0%"
                      y1="0%"
                      x2="100%"
                      y2="100%"
                    >
                      <stop offset="0%" stopColor="#10B981" stopOpacity="0.9" />
                      <stop
                        offset="100%"
                        stopColor="#059669"
                        stopOpacity="0.8"
                      />
                    </linearGradient>
                    <linearGradient
                      id="transparencyGradient"
                      x1="0%"
                      y1="0%"
                      x2="100%"
                      y2="100%"
                    >
                      <stop offset="0%" stopColor="#FFFFFF" stopOpacity="0.3" />
                      <stop
                        offset="100%"
                        stopColor="#4A6CF7"
                        stopOpacity="0.1"
                      />
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
          <div className="flex items-center gap-4">
            <button
              onClick={handleSignOut}
              className="rounded bg-red-600 px-8 py-3 text-lg font-bold text-white transition-colors duration-200 hover:bg-red-700"
            >
              Sign Out
            </button>
            <ThemeToggler />
          </div>
        </div>
      </header>
      <main>{children}</main>
    </div>
  );
}
