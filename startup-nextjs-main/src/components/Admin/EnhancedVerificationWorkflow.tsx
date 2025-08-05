"use client";
import { useState, useEffect } from "react";
import {
  FiShield,
  FiGavel,
  FiDollarSign,
  FiHome,
  FiFileText,
  FiCheck,
  FiX,
  FiClock,
  FiAlertCircle,
  FiTrendingUp,
  FiBarChart3,
  FiFilter,
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

interface EnhancedVerificationWorkflowProps {
  documents: PropertyDocument[];
  onDocumentSelect: (document: PropertyDocument) => void;
  onFilterChange: (filter: string) => void;
  onStatusFilterChange: (status: string) => void;
}

// Document categories with icons and colors
const DOCUMENT_CATEGORIES = {
  ownership: {
    name: "Ownership Documents",
    icon: FiShield,
    color: "bg-blue-100 text-blue-800",
    borderColor: "border-blue-200",
    description: "Property ownership and title documents",
  },
  legal: {
    name: "Legal Documents",
    icon: FaGavel, // Use FontAwesome Gavel
    color: "bg-purple-100 text-purple-800",
    borderColor: "border-purple-200",
    description: "Legal contracts and agreements",
  },
  financial: {
    name: "Financial Documents",
    icon: FiDollarSign,
    color: "bg-green-100 text-green-800",
    borderColor: "border-green-200",
    description: "Financial statements and payment records",
  },
  structural: {
    name: "Structural Documents",
    icon: FiHome,
    color: "bg-orange-100 text-orange-800",
    borderColor: "border-orange-200",
    description: "Building plans and structural information",
  },
};

// Verification status with progress indicators
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
    icon: FiX,
    color: "bg-red-100 text-red-800",
    progress: 0,
  },
};

export default function EnhancedVerificationWorkflow({
  documents,
  onDocumentSelect,
  onFilterChange,
  onStatusFilterChange,
}: EnhancedVerificationWorkflowProps) {
  const [selectedCategory, setSelectedCategory] = useState("all");
  const [selectedStatus, setSelectedStatus] = useState("all");
  const [showRequiredOnly, setShowRequiredOnly] = useState(false);

  // Calculate statistics
  const totalDocuments = documents.length;
  const verifiedDocuments = documents.filter(
    (doc) => doc.verificationStatus === "verified",
  ).length;
  const pendingDocuments = documents.filter(
    (doc) => doc.verificationStatus === "pending",
  ).length;
  const rejectedDocuments = documents.filter(
    (doc) => doc.verificationStatus === "rejected",
  ).length;
  const requiredDocuments = documents.filter((doc) => doc.isRequired).length;
  const verifiedRequiredDocuments = documents.filter(
    (doc) => doc.isRequired && doc.verificationStatus === "verified",
  ).length;

  // Calculate verification progress
  const overallProgress =
    totalDocuments > 0 ? (verifiedDocuments / totalDocuments) * 100 : 0;
  const requiredProgress =
    requiredDocuments > 0
      ? (verifiedRequiredDocuments / requiredDocuments) * 100
      : 0;

  // Filter documents based on selected filters
  const filteredDocuments = documents.filter((doc) => {
    const categoryMatch =
      selectedCategory === "all" || doc.documentType === selectedCategory;
    const statusMatch =
      selectedStatus === "all" || doc.verificationStatus === selectedStatus;
    const requiredMatch = !showRequiredOnly || doc.isRequired;
    return categoryMatch && statusMatch && requiredMatch;
  });

  const handleCategoryFilter = (category: string) => {
    setSelectedCategory(category);
    onFilterChange(category);
  };

  const handleStatusFilter = (status: string) => {
    setSelectedStatus(status);
    onStatusFilterChange(status);
  };

  return (
    <div className="space-y-6">
      {/* Statistics Overview */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <div className="rounded-lg border border-gray-200 bg-white p-4 shadow-sm dark:border-gray-700 dark:bg-gray-800">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600 dark:text-gray-400">
                Total Documents
              </p>
              <p className="text-2xl font-bold text-gray-900 dark:text-white">
                {totalDocuments}
              </p>
            </div>
            <FiFileText className="h-8 w-8 text-blue-600" />
          </div>
        </div>

        <div className="rounded-lg border border-gray-200 bg-white p-4 shadow-sm dark:border-gray-700 dark:bg-gray-800">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600 dark:text-gray-400">
                Verified
              </p>
              <p className="text-2xl font-bold text-green-600">
                {verifiedDocuments}
              </p>
            </div>
            <FiCheck className="h-8 w-8 text-green-600" />
          </div>
        </div>

        <div className="rounded-lg border border-gray-200 bg-white p-4 shadow-sm dark:border-gray-700 dark:bg-gray-800">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600 dark:text-gray-400">
                Pending
              </p>
              <p className="text-2xl font-bold text-yellow-600">
                {pendingDocuments}
              </p>
            </div>
            <FiClock className="h-8 w-8 text-yellow-600" />
          </div>
        </div>

        <div className="rounded-lg border border-gray-200 bg-white p-4 shadow-sm dark:border-gray-700 dark:bg-gray-800">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600 dark:text-gray-400">
                Required Verified
              </p>
              <p className="text-2xl font-bold text-purple-600">
                {verifiedRequiredDocuments}/{requiredDocuments}
              </p>
            </div>
            <FiShield className="h-8 w-8 text-purple-600" />
          </div>
        </div>
      </div>

      {/* Progress Indicators */}
      <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
        <div className="rounded-lg border border-gray-200 bg-white p-4 shadow-sm dark:border-gray-700 dark:bg-gray-800">
          <h3 className="mb-3 text-lg font-semibold text-gray-900 dark:text-white">
            Overall Verification Progress
          </h3>
          <div className="mb-2 flex justify-between text-sm text-gray-600 dark:text-gray-400">
            <span>Progress</span>
            <span>{overallProgress.toFixed(1)}%</span>
          </div>
          <div className="h-3 w-full rounded-full bg-gray-200 dark:bg-gray-700">
            <div
              className="h-3 rounded-full bg-blue-500 transition-all duration-300"
              style={{ width: `${overallProgress}%` }}
            ></div>
          </div>
          <p className="mt-2 text-xs text-gray-500 dark:text-gray-400">
            {verifiedDocuments} of {totalDocuments} documents verified
          </p>
        </div>

        <div className="rounded-lg border border-gray-200 bg-white p-4 shadow-sm dark:border-gray-700 dark:bg-gray-800">
          <h3 className="mb-3 text-lg font-semibold text-gray-900 dark:text-white">
            Required Documents Progress
          </h3>
          <div className="mb-2 flex justify-between text-sm text-gray-600 dark:text-gray-400">
            <span>Progress</span>
            <span>{requiredProgress.toFixed(1)}%</span>
          </div>
          <div className="h-3 w-full rounded-full bg-gray-200 dark:bg-gray-700">
            <div
              className="h-3 rounded-full bg-purple-500 transition-all duration-300"
              style={{ width: `${requiredProgress}%` }}
            ></div>
          </div>
          <p className="mt-2 text-xs text-gray-500 dark:text-gray-400">
            {verifiedRequiredDocuments} of {requiredDocuments} required
            documents verified
          </p>
        </div>
      </div>

      {/* Filters */}
      <div className="rounded-lg border border-gray-200 bg-white p-4 shadow-sm dark:border-gray-700 dark:bg-gray-800">
        <h3 className="mb-4 text-lg font-semibold text-gray-900 dark:text-white">
          Filters
        </h3>

        {/* Document Categories */}
        <div className="mb-4">
          <h4 className="mb-2 text-sm font-medium text-gray-700 dark:text-gray-300">
            Document Categories
          </h4>
          <div className="flex flex-wrap gap-2">
            <button
              onClick={() => handleCategoryFilter("all")}
              className={`rounded-full px-3 py-1 text-xs font-medium transition-colors ${
                selectedCategory === "all"
                  ? "bg-blue-600 text-white"
                  : "bg-gray-100 text-gray-700 hover:bg-gray-200 dark:bg-gray-700 dark:text-gray-300 dark:hover:bg-gray-600"
              }`}
            >
              All Categories
            </button>
            {Object.entries(DOCUMENT_CATEGORIES).map(([key, category]) => {
              const CategoryIcon = category.icon;
              return (
                <button
                  key={key}
                  onClick={() => handleCategoryFilter(key)}
                  className={`inline-flex items-center gap-1 rounded-full px-3 py-1 text-xs font-medium transition-colors ${
                    selectedCategory === key
                      ? category.color
                      : "bg-gray-100 text-gray-700 hover:bg-gray-200 dark:bg-gray-700 dark:text-gray-300 dark:hover:bg-gray-600"
                  }`}
                >
                  <CategoryIcon className="h-3 w-3" />
                  {category.name}
                </button>
              );
            })}
          </div>
        </div>

        {/* Status Filters */}
        <div className="mb-4">
          <h4 className="mb-2 text-sm font-medium text-gray-700 dark:text-gray-300">
            Verification Status
          </h4>
          <div className="flex flex-wrap gap-2">
            <button
              onClick={() => handleStatusFilter("all")}
              className={`rounded-full px-3 py-1 text-xs font-medium transition-colors ${
                selectedStatus === "all"
                  ? "bg-blue-600 text-white"
                  : "bg-gray-100 text-gray-700 hover:bg-gray-200 dark:bg-gray-700 dark:text-gray-300 dark:hover:bg-gray-600"
              }`}
            >
              All Status
            </button>
            {Object.entries(VERIFICATION_STATUS).map(([key, status]) => {
              const StatusIcon = status.icon;
              return (
                <button
                  key={key}
                  onClick={() => handleStatusFilter(key)}
                  className={`inline-flex items-center gap-1 rounded-full px-3 py-1 text-xs font-medium transition-colors ${
                    selectedStatus === key
                      ? status.color
                      : "bg-gray-100 text-gray-700 hover:bg-gray-200 dark:bg-gray-700 dark:text-gray-300 dark:hover:bg-gray-600"
                  }`}
                >
                  <StatusIcon className="h-3 w-3" />
                  {status.name}
                </button>
              );
            })}
          </div>
        </div>

        {/* Additional Filters */}
        <div className="flex items-center gap-4">
          <label className="flex items-center gap-2">
            <input
              type="checkbox"
              checked={showRequiredOnly}
              onChange={(e) => setShowRequiredOnly(e.target.checked)}
              className="rounded border-gray-300 text-blue-600 focus:ring-blue-500 dark:border-gray-600"
            />
            <span className="text-sm text-gray-700 dark:text-gray-300">
              Show required documents only
            </span>
          </label>
        </div>
      </div>

      {/* Document List */}
      <div className="rounded-lg border border-gray-200 bg-white shadow-sm dark:border-gray-700 dark:bg-gray-800">
        <div className="border-b border-gray-200 px-6 py-4 dark:border-gray-700">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
            Documents ({filteredDocuments.length})
          </h3>
        </div>

        <div className="divide-y divide-gray-200 dark:divide-gray-700">
          {filteredDocuments.length === 0 ? (
            <div className="p-6 text-center">
              <FiFileText className="mx-auto h-12 w-12 text-gray-400" />
              <p className="mt-2 text-sm text-gray-500 dark:text-gray-400">
                No documents found with current filters
              </p>
            </div>
          ) : (
            filteredDocuments.map((document) => {
              const category = DOCUMENT_CATEGORIES[
                document.documentType as keyof typeof DOCUMENT_CATEGORIES
              ] || {
                name: "Other",
                icon: FiFileText,
                color: "bg-gray-100 text-gray-800",
                borderColor: "border-gray-200",
              };
              const status =
                VERIFICATION_STATUS[
                  document.verificationStatus as keyof typeof VERIFICATION_STATUS
                ] || VERIFICATION_STATUS.pending;
              const CategoryIcon = category.icon;
              const StatusIcon = status.icon;

              return (
                <div
                  key={document.documentId}
                  className="flex items-center justify-between p-4 hover:bg-gray-50 dark:hover:bg-gray-700"
                >
                  <div className="flex items-center gap-4">
                    <div className={`rounded-lg p-2 ${category.color}`}>
                      <CategoryIcon className="h-5 w-5" />
                    </div>
                    <div className="flex-1">
                      <div className="flex items-center gap-2">
                        <h4 className="font-medium text-gray-900 dark:text-white">
                          {document.documentName}
                        </h4>
                        {document.isRequired && (
                          <span className="rounded-full bg-red-100 px-2 py-1 text-xs font-semibold text-red-800 dark:bg-red-900 dark:text-red-200">
                            Required
                          </span>
                        )}
                      </div>
                      <p className="text-sm text-gray-600 dark:text-gray-400">
                        {document.fileName} • Uploaded by {document.uploadedBy}
                      </p>
                      <p className="text-xs text-gray-500 dark:text-gray-500">
                        {document.uploadedAt
                          ?.toDate?.()
                          ?.toLocaleDateString() || "N/A"}
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center gap-3">
                    <span
                      className={`inline-flex items-center gap-1 rounded-full px-2 py-1 text-xs font-semibold ${status.color}`}
                    >
                      <StatusIcon className="h-3 w-3" />
                      {status.name}
                    </span>
                    <button
                      onClick={() => onDocumentSelect(document)}
                      className="rounded-lg bg-blue-600 px-3 py-1 text-xs font-medium text-white hover:bg-blue-700"
                    >
                      Preview
                    </button>
                  </div>
                </div>
              );
            })
          )}
        </div>
      </div>
    </div>
  );
}
