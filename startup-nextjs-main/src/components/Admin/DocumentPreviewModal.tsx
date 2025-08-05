"use client";
import { useState } from "react";
import {
  FiX,
  FiDownload,
  FiCheck,
  FiX as FiReject,
  FiEye,
  FiClock,
  FiAlertCircle,
  FiFileText,
  FiShield,
  FiDollarSign,
  FiHome,
} from "react-icons/fi";
import { FaGavel } from "react-icons/fa";

interface PropertyDocument {
  documentId: string;
  propertyId: string;
  documentType: string;
  documentName: string;
  fileName: string;
  fileUrl: string;
  uploadedBy: string;
  uploadedAt: any;
  verificationStatus: string;
  verifiedBy?: string;
  verifiedAt?: any;
  verificationNotes?: string;
  isAuthentic?: boolean;
  isRequired?: boolean;
}

interface DocumentPreviewModalProps {
  document: PropertyDocument | null;
  isOpen: boolean;
  onClose: () => void;
  onVerify: (
    documentId: string,
    status: "verified" | "rejected",
    notes?: string,
  ) => void;
  onDownload: (fileUrl: string, fileName: string) => void;
}

// Document categories with icons and colors
const DOCUMENT_CATEGORIES = {
  ownership: {
    name: "Ownership Documents",
    icon: FiShield,
    color: "bg-blue-100 text-blue-800",
    description: "Property ownership and title documents",
  },
  legal: {
    name: "Legal Documents",
    icon: FaGavel, // Use FontAwesome Gavel
    color: "bg-purple-100 text-purple-800",
    description: "Legal contracts and agreements",
  },
  financial: {
    name: "Financial Documents",
    icon: FiDollarSign,
    color: "bg-green-100 text-green-800",
    description: "Financial statements and payment records",
  },
  structural: {
    name: "Structural Documents",
    icon: FiHome,
    color: "bg-orange-100 text-orange-800",
    description: "Building plans and structural information",
  },
};

// Progress indicators for verification status
const VERIFICATION_STATUS = {
  pending: {
    name: "Pending",
    icon: FiClock,
    color: "bg-yellow-100 text-yellow-800",
    progress: 0,
  },
  in_progress: {
    name: "In Progress",
    icon: FiAlertCircle,
    color: "bg-blue-100 text-blue-800",
    progress: 50,
  },
  verified: {
    name: "Verified",
    icon: FiCheck,
    color: "bg-green-100 text-green-800",
    progress: 100,
  },
  rejected: {
    name: "Rejected",
    icon: FiReject,
    color: "bg-red-100 text-red-800",
    progress: 0,
  },
};

export default function DocumentPreviewModal({
  document,
  isOpen,
  onClose,
  onVerify,
  onDownload,
}: DocumentPreviewModalProps) {
  const [verificationNotes, setVerificationNotes] = useState("");
  const [isVerifying, setIsVerifying] = useState(false);

  if (!isOpen || !document) return null;

  const category = DOCUMENT_CATEGORIES[
    document.documentType as keyof typeof DOCUMENT_CATEGORIES
  ] || {
    name: "Other",
    icon: FiFileText,
    color: "bg-gray-100 text-gray-800",
    description: "Other document type",
  };

  const status =
    VERIFICATION_STATUS[
      document.verificationStatus as keyof typeof VERIFICATION_STATUS
    ] || VERIFICATION_STATUS.pending;
  const CategoryIcon = category.icon;

  const handleVerify = async (status: "verified" | "rejected") => {
    setIsVerifying(true);
    try {
      await onVerify(document.documentId, status, verificationNotes);
      setVerificationNotes("");
      onClose();
    } catch (error) {
      console.error("Verification failed:", error);
    } finally {
      setIsVerifying(false);
    }
  };

  const handleDownload = () => {
    onDownload(document.fileUrl, document.fileName);
  };

  return (
    <div className="bg-opacity-50 fixed inset-0 z-50 flex items-center justify-center bg-black">
      <div className="max-h-[90vh] w-full max-w-4xl overflow-y-auto rounded-lg bg-white shadow-xl dark:bg-gray-800">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-gray-200 p-6 dark:border-gray-700">
          <div className="flex items-center gap-3">
            <CategoryIcon className="h-6 w-6 text-gray-600 dark:text-gray-400" />
            <div>
              <h2 className="text-xl font-semibold text-gray-900 dark:text-white">
                Document Preview
              </h2>
              <p className="text-sm text-gray-600 dark:text-gray-400">
                {document.documentName}
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="rounded-lg p-2 text-gray-400 hover:bg-gray-100 hover:text-gray-600 dark:hover:bg-gray-700"
          >
            <FiX className="h-6 w-6" />
          </button>
        </div>

        <div className="p-6">
          <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
            {/* Document Information */}
            <div className="space-y-4">
              <div>
                <h3 className="mb-3 text-lg font-semibold text-gray-900 dark:text-white">
                  Document Information
                </h3>

                {/* Document Category */}
                <div className="mb-4">
                  <span
                    className={`inline-flex items-center gap-2 rounded-full px-3 py-1 text-xs font-semibold ${category.color}`}
                  >
                    <CategoryIcon className="h-4 w-4" />
                    {category.name}
                  </span>
                  <p className="mt-1 text-sm text-gray-600 dark:text-gray-400">
                    {category.description}
                  </p>
                </div>

                {/* Document Details */}
                <div className="space-y-3">
                  <div className="flex justify-between">
                    <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
                      Document ID:
                    </span>
                    <span className="text-sm text-gray-900 dark:text-white">
                      {document.documentId}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
                      Document Type:
                    </span>
                    <span className="text-sm text-gray-900 capitalize dark:text-white">
                      {document.documentType}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
                      File Name:
                    </span>
                    <span className="text-sm text-gray-900 dark:text-white">
                      {document.fileName}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
                      Uploaded By:
                    </span>
                    <span className="text-sm text-gray-900 dark:text-white">
                      {document.uploadedBy}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
                      Uploaded At:
                    </span>
                    <span className="text-sm text-gray-900 dark:text-white">
                      {document.uploadedAt?.toDate?.()?.toLocaleDateString() ||
                        "N/A"}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
                      Required:
                    </span>
                    <span
                      className={`text-sm font-semibold ${document.isRequired ? "text-green-600" : "text-gray-500"}`}
                    >
                      {document.isRequired ? "Yes" : "No"}
                    </span>
                  </div>
                </div>

                {/* Verification Status */}
                <div className="mt-6">
                  <h4 className="text-md mb-3 font-semibold text-gray-900 dark:text-white">
                    Verification Status
                  </h4>

                  {/* Status Badge */}
                  <div className="mb-3">
                    <span
                      className={`inline-flex items-center gap-2 rounded-full px-3 py-1 text-xs font-semibold ${status.color}`}
                    >
                      <status.icon className="h-4 w-4" />
                      {status.name}
                    </span>
                  </div>

                  {/* Progress Bar */}
                  <div className="mb-3">
                    <div className="mb-1 flex justify-between text-xs text-gray-600 dark:text-gray-400">
                      <span>Verification Progress</span>
                      <span>{status.progress}%</span>
                    </div>
                    <div className="h-2 w-full rounded-full bg-gray-200 dark:bg-gray-700">
                      <div
                        className={`h-2 rounded-full transition-all duration-300 ${
                          status.progress === 100
                            ? "bg-green-500"
                            : status.progress === 50
                              ? "bg-blue-500"
                              : status.progress === 0
                                ? "bg-yellow-500"
                                : "bg-gray-500"
                        }`}
                        style={{ width: `${status.progress}%` }}
                      ></div>
                    </div>
                  </div>

                  {/* Verification Details */}
                  {document.verifiedBy && (
                    <div className="space-y-2 text-sm">
                      <div className="flex justify-between">
                        <span className="text-gray-600 dark:text-gray-400">
                          Verified By:
                        </span>
                        <span className="text-gray-900 dark:text-white">
                          {document.verifiedBy}
                        </span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-600 dark:text-gray-400">
                          Verified At:
                        </span>
                        <span className="text-gray-900 dark:text-white">
                          {document.verifiedAt
                            ?.toDate?.()
                            ?.toLocaleDateString() || "N/A"}
                        </span>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* Document Preview */}
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                  Document Preview
                </h3>
                <button
                  onClick={handleDownload}
                  className="flex items-center gap-2 rounded-lg bg-blue-600 px-3 py-2 text-sm font-medium text-white hover:bg-blue-700"
                >
                  <FiDownload className="h-4 w-4" />
                  Download
                </button>
              </div>

              {/* Document Preview Area */}
              <div className="rounded-lg border-2 border-dashed border-gray-300 p-8 dark:border-gray-600">
                {document.fileUrl ? (
                  <div className="text-center">
                    {document.fileName.toLowerCase().endsWith(".pdf") ? (
                      <div className="space-y-4">
                        <FiFileText className="mx-auto h-16 w-16 text-gray-400" />
                        <div>
                          <p className="text-lg font-medium text-gray-900 dark:text-white">
                            PDF Document
                          </p>
                          <p className="text-sm text-gray-600 dark:text-gray-400">
                            Click download to view the PDF document
                          </p>
                        </div>
                        <button
                          onClick={handleDownload}
                          className="inline-flex items-center gap-2 rounded-lg bg-gray-100 px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-200 dark:bg-gray-700 dark:text-gray-300 dark:hover:bg-gray-600"
                        >
                          <FiEye className="h-4 w-4" />
                          View PDF
                        </button>
                      </div>
                    ) : (
                      <div className="space-y-4">
                        <img
                          src={document.fileUrl}
                          alt={document.documentName}
                          className="mx-auto max-h-64 rounded-lg object-contain"
                          onError={(e) => {
                            const target = e.target as HTMLImageElement;
                            target.style.display = "none";
                            target.nextElementSibling?.classList.remove(
                              "hidden",
                            );
                          }}
                        />
                        <div className="hidden text-center">
                          <FiFileText className="mx-auto h-16 w-16 text-gray-400" />
                          <p className="mt-2 text-sm text-gray-600 dark:text-gray-400">
                            Image preview not available
                          </p>
                        </div>
                      </div>
                    )}
                  </div>
                ) : (
                  <div className="text-center">
                    <FiFileText className="mx-auto h-16 w-16 text-gray-400" />
                    <p className="mt-2 text-sm text-gray-600 dark:text-gray-400">
                      No preview available
                    </p>
                  </div>
                )}
              </div>

              {/* Verification Actions */}
              {document.verificationStatus === "pending" && (
                <div className="space-y-4">
                  <h4 className="text-md font-semibold text-gray-900 dark:text-white">
                    Verification Actions
                  </h4>

                  {/* Verification Notes */}
                  <div>
                    <label className="mb-2 block text-sm font-medium text-gray-700 dark:text-gray-300">
                      Verification Notes (Optional)
                    </label>
                    <textarea
                      value={verificationNotes}
                      onChange={(e) => setVerificationNotes(e.target.value)}
                      className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm dark:border-gray-600 dark:bg-gray-700 dark:text-white"
                      rows={3}
                      placeholder="Add notes about this verification..."
                    />
                  </div>

                  {/* Action Buttons */}
                  <div className="flex gap-3">
                    <button
                      onClick={() => handleVerify("verified")}
                      disabled={isVerifying}
                      className="flex flex-1 items-center justify-center gap-2 rounded-lg bg-green-600 px-4 py-2 text-sm font-medium text-white hover:bg-green-700 disabled:opacity-50"
                    >
                      <FiCheck className="h-4 w-4" />
                      {isVerifying ? "Verifying..." : "Approve"}
                    </button>
                    <button
                      onClick={() => handleVerify("rejected")}
                      disabled={isVerifying}
                      className="flex flex-1 items-center justify-center gap-2 rounded-lg bg-red-600 px-4 py-2 text-sm font-medium text-white hover:bg-red-700 disabled:opacity-50"
                    >
                      <FiReject className="h-4 w-4" />
                      {isVerifying ? "Rejecting..." : "Reject"}
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
