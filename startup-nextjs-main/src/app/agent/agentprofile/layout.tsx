"use client";
import Link from "next/link";
import Image from "next/image";
import { useRouter } from "next/navigation";
import ThemeToggler from "@/components/Header/ThemeToggler";

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
    <div className="min-h-screen bg-[#1a1e26]">
      <header className="header top-0 left-0 z-40 flex w-full items-center border-b border-gray-700 bg-transparent">
        <div className="container flex items-center justify-between py-4">
          {/* Logo */}
          <div className="flex w-48 max-w-full items-center">
            <Link
              href="/"
              className="header-logo block flex w-full items-center gap-2 py-2"
            >
              <Image
                src="/images/logo/logo-2.svg"
                alt="logo"
                width={120}
                height={28}
                className="h-7 w-auto dark:hidden"
              />
              <Image
                src="/images/logo/logo.svg"
                alt="logo"
                width={120}
                height={28}
                className="hidden h-7 w-auto dark:block"
              />
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
