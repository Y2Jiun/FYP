"use client";

import React, { useState, useRef } from "react";
import { useRouter } from "next/navigation";
import AgentHeader from "@/components/Agent/agentHeader";

interface UploadedFile {
  id: string;
  name: string;
  type: string;
  size: number;
  status: "uploading" | "success" | "error";
  progress: number;
}

export default function AgentDocumentUpload() {
  const [selectedFiles, setSelectedFiles] = useState<UploadedFile[]>([]);
  const [documentType, setDocumentType] = useState("");
  const [uploading, setUploading] = useState(false);
  const [message, setMessage] = useState("");
  const fileInputRef = useRef<HTMLInputElement>(null);
  const router = useRouter();

  const documentTypes = [
    "Property Title Deed",
    "Building Permit",
    "Tax Assessment",
    "Insurance Certificate",
    "Utility Bills",
    "Floor Plan",
    "Property Photos",
    "Other",
  ];

  const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(event.target.files || []);
    const newFiles: UploadedFile[] = files.map((file, index) => ({
      id: Date.now() + index.toString(),
      name: file.name,
      type: file.type,
      size: file.size,
      status: "uploading",
      progress: 0,
    }));
    setSelectedFiles((prev) => [...prev, ...newFiles]);
  };

  const handleUpload = async () => {
    if (!documentType) {
      setMessage("Please select a document type");
      return;
    }
    if (selectedFiles.length === 0) {
      setMessage("Please select files to upload");
      return;
    }

    setUploading(true);
    setMessage("");

    try {
      // Simulate upload process
      for (let i = 0; i < selectedFiles.length; i++) {
        const file = selectedFiles[i];

        // Simulate progress
        for (let progress = 0; progress <= 100; progress += 10) {
          setSelectedFiles((prev) =>
            prev.map((f) =>
              f.id === file.id
                ? {
                    ...f,
                    progress,
                    status: progress === 100 ? "success" : "uploading",
                  }
                : f,
            ),
          );
          await new Promise((resolve) => setTimeout(resolve, 100));
        }
      }

      setMessage("All documents uploaded successfully!");
      setTimeout(() => {
        setSelectedFiles([]);
        setDocumentType("");
        setMessage("");
      }, 2000);
    } catch (error) {
      setMessage("Upload failed. Please try again.");
    } finally {
      setUploading(false);
    }
  };

  const removeFile = (fileId: string) => {
    setSelectedFiles((prev) => prev.filter((file) => file.id !== fileId));
  };

  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return "0 Bytes";
    const k = 1024;
    const sizes = ["Bytes", "KB", "MB", "GB"];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + " " + sizes[i];
  };

  return (
    <>
      <AgentHeader />
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
        <div className="container mx-auto px-4 py-8">
          <div className="mx-auto max-w-4xl">
            {/* Header */}
            <div className="mb-8">
              <h1 className="mb-2 text-3xl font-bold text-gray-900 dark:text-white">
                Document Upload
              </h1>
              <p className="text-gray-600 dark:text-gray-400">
                Upload property documents and certificates for verification
              </p>
            </div>

            {/* Upload Form */}
            <div className="mb-6 rounded-lg bg-white p-6 shadow-md dark:bg-gray-800">
              <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
                {/* Document Type Selection */}
                <div>
                  <label className="mb-2 block text-sm font-medium text-gray-700 dark:text-gray-300">
                    Document Type *
                  </label>
                  <select
                    value={documentType}
                    onChange={(e) => setDocumentType(e.target.value)}
                    className="w-full rounded-md border border-gray-300 px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:outline-none dark:border-gray-600 dark:bg-gray-700 dark:text-white"
                  >
                    <option value="">Select document type</option>
                    {documentTypes.map((type) => (
                      <option key={type} value={type}>
                        {type}
                      </option>
                    ))}
                  </select>
                </div>

                {/* File Upload */}
                <div>
                  <label className="mb-2 block text-sm font-medium text-gray-700 dark:text-gray-300">
                    Select Files
                  </label>
                  <div className="rounded-lg border-2 border-dashed border-gray-300 p-6 text-center transition-colors hover:border-blue-500 dark:border-gray-600 dark:hover:border-blue-400">
                    <input
                      ref={fileInputRef}
                      type="file"
                      multiple
                      onChange={handleFileSelect}
                      className="hidden"
                      accept=".pdf,.doc,.docx,.jpg,.jpeg,.png"
                    />
                    <button
                      onClick={() => fileInputRef.current?.click()}
                      className="w-full rounded-md bg-blue-600 px-4 py-2 text-white transition-colors hover:bg-blue-700"
                    >
                      Choose Files
                    </button>
                    <p className="mt-2 text-sm text-gray-500 dark:text-gray-400">
                      PDF, DOC, DOCX, JPG, PNG (Max 10MB each)
                    </p>
                  </div>
                </div>
              </div>

              {/* Upload Button */}
              <div className="mt-6">
                <button
                  onClick={handleUpload}
                  disabled={
                    uploading || selectedFiles.length === 0 || !documentType
                  }
                  className="w-full rounded-md bg-green-600 px-4 py-3 text-white transition-colors hover:bg-green-700 disabled:cursor-not-allowed disabled:bg-gray-400"
                >
                  {uploading ? "Uploading..." : "Upload Documents"}
                </button>
              </div>

              {/* Message */}
              {message && (
                <div
                  className={`mt-4 rounded-md p-3 ${
                    message.includes("successfully")
                      ? "bg-green-100 text-green-700 dark:bg-green-900 dark:text-green-300"
                      : "bg-red-100 text-red-700 dark:bg-red-900 dark:text-red-300"
                  }`}
                >
                  {message}
                </div>
              )}
            </div>

            {/* Selected Files List */}
            {selectedFiles.length > 0 && (
              <div className="rounded-lg bg-white p-6 shadow-md dark:bg-gray-800">
                <h3 className="mb-4 text-lg font-semibold text-gray-900 dark:text-white">
                  Selected Files ({selectedFiles.length})
                </h3>
                <div className="space-y-3">
                  {selectedFiles.map((file) => (
                    <div
                      key={file.id}
                      className="flex items-center justify-between rounded-md bg-gray-50 p-3 dark:bg-gray-700"
                    >
                      <div className="flex items-center space-x-3">
                        <div className="flex h-8 w-8 items-center justify-center rounded-full bg-blue-100 dark:bg-blue-900">
                          <svg
                            className="h-4 w-4 text-blue-600 dark:text-blue-400"
                            fill="currentColor"
                            viewBox="0 0 20 20"
                          >
                            <path
                              fillRule="evenodd"
                              d="M4 4a2 2 0 012-2h4.586A2 2 0 0112 2.586L15.414 6A2 2 0 0116 7.414V16a2 2 0 01-2 2H6a2 2 0 01-2-2V4zm2 6a1 1 0 011-1h6a1 1 0 110 2H7a1 1 0 01-1-1zm1 3a1 1 0 100 2h6a1 1 0 100-2H7z"
                              clipRule="evenodd"
                            />
                          </svg>
                        </div>
                        <div>
                          <p className="text-sm font-medium text-gray-900 dark:text-white">
                            {file.name}
                          </p>
                          <p className="text-xs text-gray-500 dark:text-gray-400">
                            {formatFileSize(file.size)}
                          </p>
                        </div>
                      </div>

                      <div className="flex items-center space-x-2">
                        {/* Progress Bar */}
                        {file.status === "uploading" && (
                          <div className="h-2 w-20 rounded-full bg-gray-200 dark:bg-gray-600">
                            <div
                              className="h-2 rounded-full bg-blue-600 transition-all duration-300"
                              style={{ width: `${file.progress}%` }}
                            ></div>
                          </div>
                        )}

                        {/* Status Icon */}
                        {file.status === "success" && (
                          <div className="flex h-5 w-5 items-center justify-center rounded-full bg-green-500">
                            <svg
                              className="h-3 w-3 text-white"
                              fill="currentColor"
                              viewBox="0 0 20 20"
                            >
                              <path
                                fillRule="evenodd"
                                d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                                clipRule="evenodd"
                              />
                            </svg>
                          </div>
                        )}

                        {/* Remove Button */}
                        <button
                          onClick={() => removeFile(file.id)}
                          className="text-red-500 hover:text-red-700 dark:text-red-400 dark:hover:text-red-300"
                        >
                          <svg
                            className="h-4 w-4"
                            fill="currentColor"
                            viewBox="0 0 20 20"
                          >
                            <path
                              fillRule="evenodd"
                              d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z"
                              clipRule="evenodd"
                            />
                          </svg>
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Quick Actions */}
            <div className="mt-6 grid grid-cols-1 gap-4 md:grid-cols-3">
              <button
                onClick={() => router.push("/agent/agent-dashboard")}
                className="rounded-lg bg-blue-50 p-4 transition-colors hover:bg-blue-100 dark:bg-blue-900/20 dark:hover:bg-blue-900/30"
              >
                <div className="flex items-center space-x-3">
                  <svg
                    className="h-6 w-6 text-blue-600 dark:text-blue-400"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6"
                    />
                  </svg>
                  <span className="font-medium text-blue-600 dark:text-blue-400">
                    Dashboard
                  </span>
                </div>
              </button>

              <button
                onClick={() => router.push("/agent/agentPropertyList")}
                className="rounded-lg bg-green-50 p-4 transition-colors hover:bg-green-100 dark:bg-green-900/20 dark:hover:bg-green-900/30"
              >
                <div className="flex items-center space-x-3">
                  <svg
                    className="h-6 w-6 text-green-600 dark:text-green-400"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4"
                    />
                  </svg>
                  <span className="font-medium text-green-600 dark:text-green-400">
                    Property List
                  </span>
                </div>
              </button>

              <button
                onClick={() => router.push("/agent/agentNotification")}
                className="rounded-lg bg-purple-50 p-4 transition-colors hover:bg-purple-100 dark:bg-purple-900/20 dark:hover:bg-purple-900/30"
              >
                <div className="flex items-center space-x-3">
                  <svg
                    className="h-6 w-6 text-purple-600 dark:text-purple-400"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M15 17h5l-5 5v-5zM4.19 4a2 2 0 00-1.81 1.85V19a2 2 0 002 2h12a2 2 0 002-2V5.85A2 2 0 0019.81 4H4.19z"
                    />
                  </svg>
                  <span className="font-medium text-purple-600 dark:text-purple-400">
                    Notifications
                  </span>
                </div>
              </button>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
