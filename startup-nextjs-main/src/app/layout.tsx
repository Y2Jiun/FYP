"use client";

import Footer from "@/components/Footer";
import Header from "@/components/Header";
import ScrollToTop from "@/components/ScrollToTop";
import { Inter } from "next/font/google";
import "../styles/index.css";
import { usePathname } from "next/navigation";
import { Providers } from "./providers";

const inter = Inter({ subsets: ["latin"] });

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();

  const hideHeaderFooterPaths = [
    "/admin/adminprofile",
    "/user/userprofile",
    "/agent/agentprofile",
    // add more paths here
  ];

  const hideHeaderPaths = [
    "/admin/", // Hide header for all admin pages
    "/agent/",
    // add more if needed
  ];

  const hideHeaderFooter = hideHeaderFooterPaths.some((path) =>
    pathname.startsWith(path),
  );

  const hideHeader =
    hideHeaderFooter ||
    hideHeaderPaths.some((path) => pathname.startsWith(path));

  return (
    <html suppressHydrationWarning lang="en">
      <head />
      <body className={`bg-[#FCFCFC] dark:bg-black ${inter.className}`}>
        <Providers>
          {!hideHeader && <Header />}
          {children}
          {!hideHeaderFooter && <Footer />}
          {!hideHeaderFooter && <ScrollToTop />}
        </Providers>
      </body>
    </html>
  );
}
