"use client";
import React from "react";
import AdminHeader from "@/components/Admin/AdminHeader";
import { HiOutlineDocumentReport } from "react-icons/hi";
import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";

const reports = [
  {
    label: "Export Verification History (CSV)",
    url: "http://localhost:4000/api/export/verification-history",
    icon: <HiOutlineDocumentReport className="h-7 w-7 text-blue-500" />,
    description:
      "Download all property verification actions for audit or compliance.",
    type: "csv",
  },
];

async function fetchVerificationHistory() {
  // Fetch the same data as the CSV export (update this endpoint as needed)
  const res = await fetch(
    "http://localhost:4000/api/export/verification-history-json",
  );
  if (!res.ok) throw new Error("Failed to fetch verification history");
  return res.json();
}

async function handleExportPDF() {
  const data = await fetchVerificationHistory();
  const doc = new jsPDF();
  doc.text("Property Verification History", 14, 16);
  // Prepare table data with detailed fields
  const tableData = data.map((item) => [
    item.propertyId,
    item.propertyTitle || "-",
    item.action,
    item.category || "-",
    item.newStatus || "-",
    item.previousStatus || "-",
    item.notes || "-",
    item.documentName || "-",
    item.documentUrl || "-",
    item.performedByName || item.performedBy || "-",
    item.userRole || "-",
    item.performedAt ? new Date(item.performedAt).toLocaleString() : "-",
  ]);
  autoTable(doc, {
    head: [
      [
        "Property ID",
        "Property Title",
        "Action",
        "Category",
        "New Status",
        "Previous Status",
        "Notes",
        "Document Name",
        "Document URL",
        "Performed By",
        "Role",
        "Date/Time",
      ],
    ],
    body: tableData,
    startY: 22,
    styles: { fontSize: 8 },
    headStyles: { fillColor: [41, 128, 185] },
  });
  doc.save("verification-history.pdf");
}

export default function AdminReportPage() {
  return (
    <>
      <AdminHeader />
      <div className="flex min-h-screen items-center justify-center bg-white dark:bg-[#181c23]">
        <div className="w-full max-w-2xl rounded-xl border border-gray-300 bg-white p-10 shadow-xl dark:border-gray-700 dark:bg-gray-800">
          <div className="mb-8 flex flex-col items-center">
            <div className="mb-3 rounded-full bg-blue-900/80 p-4">
              <HiOutlineDocumentReport className="h-10 w-10 text-blue-400" />
            </div>
            <h2 className="mb-1 text-center text-3xl font-extrabold text-gray-900 dark:text-white">
              Admin Reports & Data Export
            </h2>
            <p className="text-center text-base text-gray-500 dark:text-gray-300">
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
                className="flex flex-col items-center rounded-lg border border-gray-300 bg-gray-100 p-6 text-gray-900 shadow-md transition-all duration-200 hover:bg-blue-100 dark:border-gray-700 dark:bg-gray-800 dark:text-white dark:hover:bg-blue-900/80"
              >
                {report.icon}
                <span className="mt-3 mb-1 text-lg font-semibold">
                  {report.label}
                </span>
                <span className="text-center text-sm text-gray-500 dark:text-gray-400">
                  {report.description}
                </span>
              </a>
            ))}
            {/* PDF Export Button */}
            <button
              onClick={handleExportPDF}
              className="flex flex-col items-center rounded-lg border border-gray-300 bg-gray-100 p-6 text-gray-900 shadow-md transition-all duration-200 hover:bg-blue-100 dark:border-gray-700 dark:bg-gray-800 dark:text-white dark:hover:bg-blue-900/80"
            >
              <HiOutlineDocumentReport className="h-7 w-7 text-blue-500" />
              <span className="mt-3 mb-1 text-lg font-semibold">
                Export Verification History (PDF)
              </span>
              <span className="text-center text-sm text-gray-500 dark:text-gray-400">
                Download all property verification actions as a PDF for audit or
                compliance.
              </span>
            </button>
          </div>
        </div>
      </div>
    </>
  );
}
