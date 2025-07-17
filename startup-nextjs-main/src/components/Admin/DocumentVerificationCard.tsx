"use client";
import { useState } from "react";
import { PropertyDocument } from "@/types/property";
import {
  FiDownload,
  FiEye,
  FiCheck,
  FiX,
  FiClock,
  FiAlertCircle,
  FiFileText,
} from "react-icons/fi";

interface Props {
  document: PropertyDocument;
  onVerify: (
    documentId: string,
    status: "verified" | "rejected",
    notes: string,
  ) => void;
  onView: (document: PropertyDocument) => void;
}

export default function DocumentVerificationCard({
  document,
  onVerify,
  onView,
}: Props) {
  const [showVerificationModal, setShowVerificationModal] = useState(false);
  const [verificationNotes, setVerificationNotes] = useState("");
  const [verificationStatus, setVerificationStatus] = useState<
    "verified" | "rejected" | null
  >(null);

  const getStatusColor = (status: string) => {
    switch (status) {
      case "verified":
        return "text-green-500 bg-green-500/10";
      case "rejected":
        return "text-red-500 bg-red-500/10";
      case "pending":
        return "text-yellow-500 bg-yellow-500/10";
      default:
        return "text-gray-500 bg-gray-500/10";
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "verified":
        return <FiCheck className="text-green-500" />;
      case "rejected":
        return <FiX className="text-red-500" />;
      case "pending":
        return <FiClock className="text-yellow-500" />;
      default:
        return <FiAlertCircle className="text-gray-500" />;
    }
  };

  const getDocumentTypeIcon = (type: string) => {
    switch (type) {
      case "title_deed":
        return <FiFileText className="text-blue-500" />;
      case "land_certificate":
        return <FiFileText className="text-green-500" />;
      case "building_plan":
        return <FiFileText className="text-purple-500" />;
      case "survey_plan":
        return <FiFileText className="text-orange-500" />;
      default:
        return <FiFileText className="text-gray-500" />;
    }
  };

  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return "0 Bytes";
    const k = 1024;
    const sizes = ["Bytes", "KB", "MB", "GB"];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + " " + sizes[i];
  };

  const handleVerification = () => {
    if (verificationStatus && verificationNotes.trim()) {
      onVerify(document.documentId, verificationStatus, verificationNotes);
      setShowVerificationModal(false);
      setVerificationNotes("");
      setVerificationStatus(null);
    }
  };

  return (
    <>
      <div className="rounded-lg border border-gray-700 bg-gray-900 p-6 transition-all hover:border-gray-600">
        <div className="mb-4 flex items-start justify-between">
          <div className="flex items-center gap-3">
            {getDocumentTypeIcon(document.documentType)}
            <div>
              <h3 className="text-lg font-semibold text-white">
                {document.documentName}
              </h3>
              <p className="text-sm text-gray-400 capitalize">
                {document.documentType.replace("_", " ")}
              </p>
            </div>
          </div>
          <span
            className={`inline-flex items-center gap-1 rounded-full px-3 py-1 text-sm font-medium ${getStatusColor(document.verificationStatus)}`}
          >
            {getStatusIcon(document.verificationStatus)}
            {document.verificationStatus}
          </span>
        </div>

        <div className="mb-4 space-y-3">
          <div className="flex justify-between text-sm">
            <span className="text-gray-400">Property ID:</span>
            <span className="text-white">{document.propertyId}</span>
          </div>
          <div className="flex justify-between text-sm">
            <span className="text-gray-400">File Size:</span>
            <span className="text-white">
              {formatFileSize(document.fileSize)}
            </span>
          </div>
          <div className="flex justify-between text-sm">
            <span className="text-gray-400">Uploaded By:</span>
            <span className="text-white">{document.uploadedBy}</span>
          </div>
          <div className="flex justify-between text-sm">
            <span className="text-gray-400">Upload Date:</span>
            <span className="text-white">
              {document.uploadedAt?.toDate?.().toLocaleDateString() || "N/A"}
            </span>
          </div>
          {document.verifiedBy && (
            <div className="flex justify-between text-sm">
              <span className="text-gray-400">Verified By:</span>
              <span className="text-white">{document.verifiedBy}</span>
            </div>
          )}
          {document.verifiedAt && (
            <div className="flex justify-between text-sm">
              <span className="text-gray-400">Verified Date:</span>
              <span className="text-white">
                {document.verifiedAt?.toDate?.().toLocaleDateString() || "N/A"}
              </span>
            </div>
          )}
          {document.verificationNotes && (
            <div className="text-sm">
              <span className="text-gray-400">Notes:</span>
              <p className="mt-1 text-white">{document.verificationNotes}</p>
            </div>
          )}
        </div>

        <div className="flex gap-2">
          <button
            className="flex items-center gap-2 rounded bg-blue-600 px-3 py-2 text-sm text-white transition-colors hover:bg-blue-500"
            onClick={() => onView(document)}
          >
            <FiEye />
            View Document
          </button>
          <button
            className="flex items-center gap-2 rounded bg-gray-600 px-3 py-2 text-sm text-white transition-colors hover:bg-gray-500"
            onClick={() => window.open(document.fileUrl, "_blank")}
          >
            <FiDownload />
            Download
          </button>
          {document.verificationStatus === "pending" && (
            <>
              <button
                className="flex items-center gap-2 rounded bg-green-600 px-3 py-2 text-sm text-white transition-colors hover:bg-green-500"
                onClick={() => {
                  setVerificationStatus("verified");
                  setShowVerificationModal(true);
                }}
              >
                <FiCheck />
                Verify
              </button>
              <button
                className="flex items-center gap-2 rounded bg-red-600 px-3 py-2 text-sm text-white transition-colors hover:bg-red-500"
                onClick={() => {
                  setVerificationStatus("rejected");
                  setShowVerificationModal(true);
                }}
              >
                <FiX />
                Reject
              </button>
            </>
          )}
        </div>
      </div>

      {/* Verification Modal */}
      {showVerificationModal && (
        <div className="bg-opacity-50 fixed inset-0 z-50 flex items-center justify-center bg-black">
          <div className="w-full max-w-md rounded-lg bg-gray-900 p-6">
            <h3 className="mb-4 text-xl font-semibold text-white">
              {verificationStatus === "verified"
                ? "Verify Document"
                : "Reject Document"}
            </h3>

            <div className="mb-4">
              <label className="mb-2 block text-sm font-medium text-gray-300">
                Verification Notes
              </label>
              <textarea
                className="w-full rounded border border-gray-700 bg-gray-800 p-3 text-white"
                rows={4}
                value={verificationNotes}
                onChange={(e) => setVerificationNotes(e.target.value)}
                placeholder={`Enter notes for ${verificationStatus === "verified" ? "verification" : "rejection"}...`}
              />
            </div>

            <div className="flex justify-end gap-3">
              <button
                className="rounded bg-gray-600 px-4 py-2 text-white hover:bg-gray-500"
                onClick={() => {
                  setShowVerificationModal(false);
                  setVerificationNotes("");
                  setVerificationStatus(null);
                }}
              >
                Cancel
              </button>
              <button
                className={`rounded px-4 py-2 text-white ${
                  verificationStatus === "verified"
                    ? "bg-green-600 hover:bg-green-500"
                    : "bg-red-600 hover:bg-red-500"
                }`}
                onClick={handleVerification}
                disabled={!verificationNotes.trim()}
              >
                {verificationStatus === "verified" ? "Verify" : "Reject"}
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
