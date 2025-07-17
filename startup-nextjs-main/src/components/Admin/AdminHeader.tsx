"use client";
import Link from "next/link";
import Image from "next/image";
import { useRouter } from "next/navigation";
import ThemeToggler from "@/components/Header/ThemeToggler";
import { useState, useEffect, useRef } from "react";
import { db } from "@/lib/firebase";
import { collection, query, where, getDocs } from "firebase/firestore";

const adminMenu = [
  { title: "Dashboard", path: "/admin/admin-dashboard" },
  {
    title: "Update Agent",
    submenu: [{ title: "Agent Request", path: "/admin/updateAgent" }],
  },
  {
    title: "Content",
    submenu: [{ title: "Blog/News", path: "/admin/adminContentManagement" }],
  },
  {
    title: "Property",
    submenu: [
      {
        title: "Property Verification & Documentation",
        path: "/admin/propertyVerification",
      },
    ],
  },
];

export default function AdminHeader() {
  const router = useRouter();
  const [menuOpen, setMenuOpen] = useState(false);
  const [profilePic, setProfilePic] = useState("");
  const [dropdown, setDropdown] = useState("");
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
                  className="hover:text-primary flex items-center gap-1 rounded px-3 py-2 font-medium text-white transition-colors duration-200"
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
                    className="absolute left-0 z-50 mt-2 w-64 rounded-md bg-[#23272f] shadow-lg"
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
                        className="block rounded px-4 py-2 text-white transition-colors duration-200 hover:bg-gray-700"
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
                className="hover:text-primary rounded px-3 py-2 font-medium text-white transition-colors duration-200"
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
          <Link href="/admin/adminNotification">
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
      {/* Mobile menu */}
      {menuOpen && (
        <nav className="absolute top-full left-0 z-50 w-full border-b border-gray-700 bg-[#181c23] shadow-lg md:hidden">
          <ul className="flex flex-col gap-2 p-4">
            {adminMenu.map((item) =>
              item.submenu ? (
                <li key={item.title}>
                  <div className="relative">
                    <button
                      className="hover:text-primary block flex w-full items-center gap-1 rounded px-3 py-2 text-left font-medium text-white transition-colors duration-200"
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
                      <div className="mt-1 ml-4 rounded-md bg-[#23272f] shadow-lg">
                        {item.submenu.map((sub) => (
                          <Link
                            key={sub.title}
                            href={sub.path}
                            className="block rounded px-4 py-2 text-white transition-colors duration-200 hover:bg-gray-700"
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
                    className="hover:text-primary block rounded px-3 py-2 font-medium text-white transition-colors duration-200"
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
