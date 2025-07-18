"use client";
import React from "react";

const reports = [
  {
    label: "Export Verification History (CSV)",
    url: "http://localhost:4000/api/export/verification-history",
  },
  // Add more reports as you add endpoints
];

export default function AdminReportPage() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-gradient-to-br from-blue-900 via-gray-900 to-gray-800">
      <div className="dark:bg-dark/90 w-full max-w-lg rounded-2xl bg-white/90 p-8 shadow-2xl backdrop-blur-md">
        <h2 className="mb-6 text-center text-3xl font-extrabold text-gray-900 dark:text-white">
          Admin Reports & Data Export
        </h2>
        <div className="space-y-4">
          {reports.map((report) => (
            <a
              key={report.label}
              href={report.url}
              target="_blank"
              rel="noopener noreferrer"
              className="block w-full rounded-lg bg-blue-600 py-3 text-center text-lg font-semibold text-white shadow-md transition-all duration-200 hover:bg-blue-700 focus:ring-2 focus:ring-blue-400 focus:ring-offset-2 focus:outline-none"
            >
              {report.label}
            </a>
          ))}
        </div>
      </div>
    </div>
  );
}
