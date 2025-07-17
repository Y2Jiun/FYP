"use client";
import { useEffect, useState } from "react";
import { db } from "@/lib/firebase";
import {
  collection,
  getDocs,
  doc,
  updateDoc,
  query,
  where,
  orderBy,
  Timestamp,
  addDoc,
} from "firebase/firestore";
import AdminHeader from "@/components/Admin/AdminHeader";
import {
  FiSearch,
  FiFilter,
  FiEye,
  FiCheck,
  FiX,
  FiDownload,
  FiClock,
  FiAlertCircle,
} from "react-icons/fi";

interface Property {
  propertyId: string;
  title: string;
  price: number;
  location: {
    address: string;
    city: string;
  };
  agentId: string;
  agentName: string;
  status: string;
  verificationStatus: {
    documents: string;
    details: string;
    images: string;
    overall: string;
  };
  createdAt: any;
  updatedAt: any;
}

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
}

interface VerificationHistory {
  historyId: string;
  propertyId: string;
  action: string;
  performedBy: string;
  performedAt: any;
  details: any;
  adminNotes?: string;
  verificationScore?: number;
}

export default function PropertyVerificationPage() {
  const [properties, setProperties] = useState<Property[]>([]);
  const [documents, setDocuments] = useState<PropertyDocument[]>([]);
  const [verificationHistory, setVerificationHistory] = useState<
    VerificationHistory[]
  >([]);
  const [loading, setLoading] = useState(true);
  const [selectedProperty, setSelectedProperty] = useState<Property | null>(
    null,
  );
  const [selectedDocument, setSelectedDocument] =
    useState<PropertyDocument | null>(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [filterStatus, setFilterStatus] = useState("all");
  const [notification, setNotification] = useState("");
  const [verificationNotes, setVerificationNotes] = useState("");
  const [activeTab, setActiveTab] = useState("properties");

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    setLoading(true);
    try {
      // Fetch properties
      const propertiesSnapshot = await getDocs(collection(db, "properties"));
      const propertiesData = propertiesSnapshot.docs.map((doc) => ({
        propertyId: doc.id,
        ...doc.data(),
      })) as Property[];

      // Fetch documents
      const documentsSnapshot = await getDocs(
        collection(db, "propertyDocuments"),
      );
      const documentsData = documentsSnapshot.docs.map((doc) => ({
        documentId: doc.id,
        ...doc.data(),
      })) as PropertyDocument[];

      // Fetch verification history
      const historySnapshot = await getDocs(
        collection(db, "propertyVerificationHistory"),
      );
      const historyData = historySnapshot.docs.map((doc) => ({
        historyId: doc.id,
        ...doc.data(),
      })) as VerificationHistory[];

      setProperties(propertiesData);
      setDocuments(documentsData);
      setVerificationHistory(historyData);
    } catch (error) {
      console.error("Error fetching data:", error);
      setNotification("Error fetching data");
    } finally {
      setLoading(false);
    }
  };

  const handleDocumentVerification = async (
    documentId: string,
    status: "verified" | "rejected",
  ) => {
    try {
      const adminId = localStorage.getItem("userID") || "ADMIN001";
      await fetch("/api/property-verification/verify-document", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          documentId: documentId,
          status: status,
          notes: verificationNotes,
          adminId: adminId,
        }),
      });

      setNotification(`Document ${status} successfully`);
      setVerificationNotes("");
      setSelectedDocument(null);
      fetchData();
    } catch (error) {
      console.error("Error updating document:", error);
      setNotification("Error updating document");
    }
  };

  const handlePropertyVerification = async (
    propertyId: string,
    status: "verified" | "rejected",
  ) => {
    try {
      const adminId = localStorage.getItem("userID") || "ADMIN001";
      await fetch("/api/property-verification/verify-property", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          propertyId: propertyId,
          status: status,
          notes: verificationNotes,
          adminId: adminId,
        }),
      });

      setNotification(`Property ${status} successfully`);
      setVerificationNotes("");
      setSelectedProperty(null);
      fetchData();
    } catch (error) {
      console.error("Error updating property:", error);
      setNotification("Error updating property");
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "verified":
        return "text-green-500";
      case "rejected":
        return "text-red-500";
      case "pending":
        return "text-yellow-500";
      default:
        return "text-gray-500";
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

  const filteredProperties = properties.filter((property) => {
    const matchesSearch =
      property.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      property.propertyId.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesFilter =
      filterStatus === "all" || property.status === filterStatus;
    return matchesSearch && matchesFilter;
  });

  const filteredDocuments = documents.filter((doc) => {
    const matchesSearch =
      doc.documentName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      doc.propertyId.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesFilter =
      filterStatus === "all" || doc.verificationStatus === filterStatus;
    return matchesSearch && matchesFilter;
  });

  return (
    <>
      <AdminHeader />
      <div className="container mx-auto py-8">
        <div className="mb-8">
          <h1 className="mb-4 text-3xl font-bold text-white">
            Property Verification & Documentation
          </h1>
          <p className="text-gray-300">
            Manage property verification, document authenticity, and audit
            trails
          </p>
        </div>

        {notification && (
          <div className="mb-6 rounded-lg border border-blue-700 bg-blue-900/80 px-4 py-3 text-blue-200">
            {notification}
          </div>
        )}

        {/* Search and Filter */}
        <div className="mb-6 flex flex-wrap gap-4">
          <div className="min-w-[300px] flex-1">
            <div className="relative">
              <FiSearch className="absolute top-1/2 left-3 -translate-y-1/2 text-gray-400" />
              <input
                type="text"
                placeholder="Search properties, documents..."
                className="w-full rounded-lg border border-gray-700 bg-gray-900 px-4 py-2 pl-10 text-white placeholder-gray-400 focus:border-blue-500 focus:outline-none"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
          </div>
          <div className="flex items-center gap-2">
            <FiFilter className="text-gray-400" />
            <select
              className="rounded-lg border border-gray-700 bg-gray-900 px-4 py-2 text-white focus:border-blue-500 focus:outline-none"
              value={filterStatus}
              onChange={(e) => setFilterStatus(e.target.value)}
            >
              <option value="all">All Status</option>
              <option value="pending">Pending</option>
              <option value="verified">Verified</option>
              <option value="rejected">Rejected</option>
            </select>
          </div>
        </div>

        {/* Tabs */}
        <div className="mb-6 flex gap-4 border-b border-gray-700">
          <button
            className={`px-4 py-2 font-semibold ${activeTab === "properties" ? "border-b-2 border-blue-400 text-blue-400" : "text-gray-400"}`}
            onClick={() => setActiveTab("properties")}
          >
            Properties ({properties.length})
          </button>
          <button
            className={`px-4 py-2 font-semibold ${activeTab === "documents" ? "border-b-2 border-blue-400 text-blue-400" : "text-gray-400"}`}
            onClick={() => setActiveTab("documents")}
          >
            Documents ({documents.length})
          </button>
          <button
            className={`px-4 py-2 font-semibold ${activeTab === "history" ? "border-b-2 border-blue-400 text-blue-400" : "text-gray-400"}`}
            onClick={() => setActiveTab("history")}
          >
            Verification History ({verificationHistory.length})
          </button>
        </div>

        {loading ? (
          <div className="py-8 text-center">
            <div className="text-gray-300">Loading...</div>
          </div>
        ) : (
          <div className="space-y-6">
            {activeTab === "properties" && (
              <div className="overflow-x-auto rounded-lg border border-gray-700 bg-gray-900">
                <table className="min-w-full text-white">
                  <thead>
                    <tr className="border-b border-gray-700 bg-gray-800">
                      <th className="px-6 py-4 text-left font-semibold">
                        Property ID
                      </th>
                      <th className="px-6 py-4 text-left font-semibold">
                        Title
                      </th>
                      <th className="px-6 py-4 text-left font-semibold">
                        Price
                      </th>
                      <th className="px-6 py-4 text-left font-semibold">
                        Location
                      </th>
                      <th className="px-6 py-4 text-left font-semibold">
                        Agent
                      </th>
                      <th className="px-6 py-4 text-left font-semibold">
                        Status
                      </th>
                      <th className="px-6 py-4 text-left font-semibold">
                        Verification
                      </th>
                      <th className="px-6 py-4 text-left font-semibold">
                        Actions
                      </th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredProperties.map((property) => (
                      <tr
                        key={property.propertyId}
                        className="border-b border-gray-700 hover:bg-gray-800"
                      >
                        <td className="px-6 py-4">{property.propertyId}</td>
                        <td className="px-6 py-4">{property.title}</td>
                        <td className="px-6 py-4">
                          RM {property.price?.toLocaleString()}
                        </td>
                        <td className="px-6 py-4">
                          {property.location?.address}
                        </td>
                        <td className="px-6 py-4">
                          {property.agentName || property.agentId}
                        </td>
                        <td className="px-6 py-4">
                          <span
                            className={`inline-flex items-center gap-1 ${getStatusColor(property.status)}`}
                          >
                            {getStatusIcon(property.status)}
                            {property.status}
                          </span>
                        </td>
                        <td className="px-6 py-4">
                          <div className="text-sm">
                            <div>
                              Documents:{" "}
                              <span
                                className={getStatusColor(
                                  property.verificationStatus?.documents,
                                )}
                              >
                                {property.verificationStatus?.documents}
                              </span>
                            </div>
                            <div>
                              Details:{" "}
                              <span
                                className={getStatusColor(
                                  property.verificationStatus?.details,
                                )}
                              >
                                {property.verificationStatus?.details}
                              </span>
                            </div>
                            <div>
                              Images:{" "}
                              <span
                                className={getStatusColor(
                                  property.verificationStatus?.images,
                                )}
                              >
                                {property.verificationStatus?.images}
                              </span>
                            </div>
                          </div>
                        </td>
                        <td className="px-6 py-4">
                          <button
                            className="mr-2 rounded bg-blue-600 px-3 py-1 text-sm text-white hover:bg-blue-500"
                            onClick={() => setSelectedProperty(property)}
                          >
                            View
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}

            {activeTab === "documents" && (
              <div className="overflow-x-auto rounded-lg border border-gray-700 bg-gray-900">
                <table className="min-w-full text-white">
                  <thead>
                    <tr className="border-b border-gray-700 bg-gray-800">
                      <th className="px-6 py-4 text-left font-semibold">
                        Document ID
                      </th>
                      <th className="px-6 py-4 text-left font-semibold">
                        Property ID
                      </th>
                      <th className="px-6 py-4 text-left font-semibold">
                        Document Type
                      </th>
                      <th className="px-6 py-4 text-left font-semibold">
                        Document Name
                      </th>
                      <th className="px-6 py-4 text-left font-semibold">
                        Uploaded By
                      </th>
                      <th className="px-6 py-4 text-left font-semibold">
                        Status
                      </th>
                      <th className="px-6 py-4 text-left font-semibold">
                        Actions
                      </th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredDocuments.map((document) => (
                      <tr
                        key={document.documentId}
                        className="border-b border-gray-700 hover:bg-gray-800"
                      >
                        <td className="px-6 py-4">{document.documentId}</td>
                        <td className="px-6 py-4">{document.propertyId}</td>
                        <td className="px-6 py-4">{document.documentType}</td>
                        <td className="px-6 py-4">{document.documentName}</td>
                        <td className="px-6 py-4">{document.uploadedBy}</td>
                        <td className="px-6 py-4">
                          <span
                            className={`inline-flex items-center gap-1 ${getStatusColor(document.verificationStatus)}`}
                          >
                            {getStatusIcon(document.verificationStatus)}
                            {document.verificationStatus}
                          </span>
                        </td>
                        <td className="px-6 py-4">
                          <div className="flex gap-2">
                            <button
                              className="rounded bg-blue-600 px-3 py-1 text-sm text-white hover:bg-blue-500"
                              onClick={() => setSelectedDocument(document)}
                            >
                              <FiEye className="mr-1 inline" />
                              View
                            </button>
                            <button
                              className="rounded bg-green-600 px-3 py-1 text-sm text-white hover:bg-green-500"
                              onClick={() =>
                                handleDocumentVerification(
                                  document.documentId,
                                  "verified",
                                )
                              }
                            >
                              <FiCheck className="mr-1 inline" />
                              Verify
                            </button>
                            <button
                              className="rounded bg-red-600 px-3 py-1 text-sm text-white hover:bg-red-500"
                              onClick={() =>
                                handleDocumentVerification(
                                  document.documentId,
                                  "rejected",
                                )
                              }
                            >
                              <FiX className="mr-1 inline" />
                              Reject
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}

            {activeTab === "history" && (
              <div className="overflow-x-auto rounded-lg border border-gray-700 bg-gray-900">
                <table className="min-w-full text-white">
                  <thead>
                    <tr className="border-b border-gray-700 bg-gray-800">
                      <th className="px-6 py-4 text-left font-semibold">
                        History ID
                      </th>
                      <th className="px-6 py-4 text-left font-semibold">
                        Property ID
                      </th>
                      <th className="px-6 py-4 text-left font-semibold">
                        Action
                      </th>
                      <th className="px-6 py-4 text-left font-semibold">
                        Performed By
                      </th>
                      <th className="px-6 py-4 text-left font-semibold">
                        Date
                      </th>
                      <th className="px-6 py-4 text-left font-semibold">
                        Details
                      </th>
                    </tr>
                  </thead>
                  <tbody>
                    {verificationHistory.map((history) => (
                      <tr
                        key={history.historyId}
                        className="border-b border-gray-700 hover:bg-gray-800"
                      >
                        <td className="px-6 py-4">{history.historyId}</td>
                        <td className="px-6 py-4">{history.propertyId}</td>
                        <td className="px-6 py-4">{history.action}</td>
                        <td className="px-6 py-4">{history.performedBy}</td>
                        <td className="px-6 py-4">
                          {history.performedAt?.toDate?.().toLocaleString() ||
                            "N/A"}
                        </td>
                        <td className="px-6 py-4">
                          <div className="text-sm">
                            {history.details?.notes && (
                              <div>Notes: {history.details.notes}</div>
                            )}
                            {history.adminNotes && (
                              <div>Admin Notes: {history.adminNotes}</div>
                            )}
                            {history.verificationScore && (
                              <div>Score: {history.verificationScore}%</div>
                            )}
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        )}

        {/* Verification Modal */}
        {(selectedProperty || selectedDocument) && (
          <div className="bg-opacity-50 fixed inset-0 z-50 flex items-center justify-center bg-black">
            <div className="w-full max-w-2xl rounded-lg bg-gray-900 p-6">
              <h3 className="mb-4 text-xl font-semibold text-white">
                {selectedProperty
                  ? "Property Verification"
                  : "Document Verification"}
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
                  placeholder="Enter verification notes..."
                />
              </div>

              <div className="flex justify-end gap-3">
                <button
                  className="rounded bg-gray-600 px-4 py-2 text-white hover:bg-gray-500"
                  onClick={() => {
                    setSelectedProperty(null);
                    setSelectedDocument(null);
                    setVerificationNotes("");
                  }}
                >
                  Cancel
                </button>
                {selectedProperty && (
                  <>
                    <button
                      className="rounded bg-green-600 px-4 py-2 text-white hover:bg-green-500"
                      onClick={() =>
                        handlePropertyVerification(
                          selectedProperty.propertyId,
                          "verified",
                        )
                      }
                    >
                      Verify Property
                    </button>
                    <button
                      className="rounded bg-red-600 px-4 py-2 text-white hover:bg-red-500"
                      onClick={() =>
                        handlePropertyVerification(
                          selectedProperty.propertyId,
                          "rejected",
                        )
                      }
                    >
                      Reject Property
                    </button>
                  </>
                )}
                {selectedDocument && (
                  <>
                    <button
                      className="rounded bg-green-600 px-4 py-2 text-white hover:bg-green-500"
                      onClick={() =>
                        handleDocumentVerification(
                          selectedDocument.documentId,
                          "verified",
                        )
                      }
                    >
                      Verify Document
                    </button>
                    <button
                      className="rounded bg-red-600 px-4 py-2 text-white hover:bg-red-500"
                      onClick={() =>
                        handleDocumentVerification(
                          selectedDocument.documentId,
                          "rejected",
                        )
                      }
                    >
                      Reject Document
                    </button>
                  </>
                )}
              </div>
            </div>
          </div>
        )}
      </div>
    </>
  );
}
