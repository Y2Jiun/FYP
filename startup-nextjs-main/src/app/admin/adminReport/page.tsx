"use client";
import React from "react";
import AdminHeader from "@/components/Admin/AdminHeader";
import { HiOutlineDocumentReport } from "react-icons/hi";

const reports = [
  {
    label: "Export Verification History (CSV)",
    url: "http://localhost:4000/api/export/verification-history",
    icon: <HiOutlineDocumentReport className="h-7 w-7 text-blue-500" />,
    description:
      "Download all property verification actions for audit or compliance.",
  },
  // Add more reports as needed
];

export default function AdminReportPage() {
  return (
    <>
      <AdminHeader />
      <div className="flex min-h-screen items-center justify-center">
        <div className="w-full max-w-2xl rounded-xl border border-gray-700 bg-[#23272f] p-10 shadow-xl">
          <div className="mb-8 flex flex-col items-center">
            <div className="mb-3 rounded-full bg-blue-900/80 p-4">
              <HiOutlineDocumentReport className="h-10 w-10 text-blue-400" />
            </div>
            <h2 className="mb-1 text-center text-3xl font-extrabold text-white">
              Admin Reports & Data Export
            </h2>
            <p className="text-center text-base text-gray-300">
              Download important data for audits, compliance, or analysis.
            </p>
          </div>
          <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
            {reports.map((report) => (
              <a
                key={report.label}
                href={report.url}
                target="_blank"
                rel="noopener noreferrer"
                className="flex flex-col items-center rounded-lg border border-gray-700 bg-gray-800 p-6 text-white shadow-md transition-all duration-200 hover:bg-blue-900/80"
              >
                {report.icon}
                <span className="mt-3 mb-1 text-lg font-semibold">
                  {report.label}
                </span>
                <span className="text-center text-sm text-gray-400">
                  {report.description}
                </span>
              </a>
            ))}
          </div>
        </div>
      </div>
    </>
  );
}
