"use client";

import { usePathname } from "next/navigation";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import ScrollToTop from "@/components/ScrollToTop";

export default function LayoutWrapper({
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
    "/user/",
    "/property/",
    // add more if needed
  ];

  const hideHeaderFooter = hideHeaderFooterPaths.some((path) =>
    pathname.startsWith(path),
  );

  const hideHeader =
    hideHeaderFooter ||
    hideHeaderPaths.some((path) => pathname.startsWith(path));

  return (
    <>
      {!hideHeader && <Header />}
      {children}
      {!hideHeaderFooter && <Footer />}
      {!hideHeaderFooter && <ScrollToTop />}
    </>
  );
}
