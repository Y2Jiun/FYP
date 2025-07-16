"use client";
import Link from "next/link";
import Image from "next/image";
import { useRouter } from "next/navigation";
import ThemeToggler from "@/components/Header/ThemeToggler";
import { useState, useEffect } from "react";
import { db } from "@/lib/firebase";
import { collection, query, where, getDocs } from "firebase/firestore";

const adminMenu = [
  { title: "Dashboard", path: "/admin/admin-dashboard" },
  { title: "Update Agent", path: "/admin/updateAgent" },
  { title: "Content Management", path: "/admin/adminContentManagement" },
];

export default function AdminHeader() {
  const router = useRouter();
  const [menuOpen, setMenuOpen] = useState(false);
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
            href="/admin/admin-dashboard"
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
          {adminMenu.map((item) => (
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
        {/* Mobile menu toggle */}
        <button
          className="text-white focus:outline-none md:hidden"
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
        </div>
      </div>
      {/* Mobile menu */}
      {menuOpen && (
        <nav className="absolute top-full left-0 z-50 w-full border-b border-gray-700 bg-[#181c23] shadow-lg md:hidden">
          <ul className="flex flex-col gap-2 p-4">
            {adminMenu.map((item) => (
              <li key={item.title}>
                <Link
                  href={item.path}
                  className="hover:text-primary block rounded px-3 py-2 font-medium text-white transition-colors duration-200"
                  onClick={() => setMenuOpen(false)}
                >
                  {item.title}
                </Link>
              </li>
            ))}
          </ul>
        </nav>
      )}
    </header>
  );
}
