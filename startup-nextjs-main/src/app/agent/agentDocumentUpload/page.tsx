"use client";

import React, { useState, useRef, useEffect } from "react";
import { useRouter } from "next/navigation";
import AgentHeader from "@/components/Agent/agentHeader";
import { db, auth } from "@/lib/firebase";
import {
  collection,
  addDoc,
  getDocs,
  query,
  where,
  serverTimestamp,
} from "firebase/firestore";

interface UploadedFile {
  id: string;
  name: string;
  type: string;
  size: number;
  status: "uploading" | "success" | "error";
  progress: number;
  file: File; // Store the actual File object
}

interface Property {
  id: string;
  title: string;
  address: string;
}

export default function AgentDocumentUpload() {
  const [selectedFiles, setSelectedFiles] = useState<UploadedFile[]>([]);
  const [documentType, setDocumentType] = useState("");
  const [selectedProperty, setSelectedProperty] = useState("");
  const [properties, setProperties] = useState<Property[]>([]);
  const [uploading, setUploading] = useState(false);
  const [message, setMessage] = useState("");
  const fileInputRef = useRef<HTMLInputElement>(null);
  const router = useRouter();

  // Helper function to upload file to Cloudinary (FREE tier: 25GB storage!)
  const uploadToCloudinary = async (file: File): Promise<string> => {
    try {
      console.log("Uploading to Cloudinary:", file.name, file.type, file.size);

      // Convert file to base64 using FileReader (client-side compatible)
      const base64File = await new Promise<string>((resolve, reject) => {
        const reader = new FileReader();
        reader.onload = () => resolve(reader.result as string);
        reader.onerror = reject;
        reader.readAsDataURL(file);
      });

      const formData = new FormData();
      formData.append("file", base64File); // Already includes data:type;base64, prefix
      formData.append("upload_preset", "derrick");
      formData.append("folder", "property-documents");
      formData.append("resource_type", "auto"); // Handle PDFs and images

      // Use the correct endpoint based on file type
      const isPdf = file.type === "application/pdf";
      const endpoint = isPdf
        ? "https://api.cloudinary.com/v1_1/dvl5whm1n/raw/upload" // For PDFs
        : "https://api.cloudinary.com/v1_1/dvl5whm1n/image/upload"; // For images

      console.log("Using endpoint:", endpoint, "for file type:", file.type);

      const response = await fetch(endpoint, {
        method: "POST",
        body: formData,
      });

      if (!response.ok) {
        const errorText = await response.text();
        console.error("Cloudinary HTTP error:", response.status, errorText);
        throw new Error(
          `HTTP error! status: ${response.status} - ${errorText}`,
        );
      }

      const data = await response.json();
      console.log("Cloudinary response:", data);

      if (data.secure_url) {
        console.log("Upload successful:", data.secure_url);
        return data.secure_url;
      } else {
        console.error("Cloudinary error details:", data);
        throw new Error(
          "Upload failed: " + (data.error?.message || "No secure_url returned"),
        );
      }
    } catch (error) {
      console.error("Cloudinary upload error:", error);
      throw error;
    }
  };

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

  // Fetch agent's properties
  useEffect(() => {
    const fetchProperties = async () => {
      try {
        const currentUser = auth.currentUser;
        if (!currentUser) return;

        // Get current agent's user data to find their agentId
        const userQuery = query(
          collection(db, "users"),
          where("firebaseUID", "==", currentUser.uid),
        );
        const userSnapshot = await getDocs(userQuery);

        if (userSnapshot.empty) return;

        const userData = userSnapshot.docs[0].data();
        const agentId = userData.userID || userSnapshot.docs[0].id;

        // Fetch properties for this agent
        const propertiesQuery = query(
          collection(db, "properties"),
          where("agentId", "==", agentId),
          where("status", "!=", "rejected"),
        );
        const propertiesSnapshot = await getDocs(propertiesQuery);

        const propertyList: Property[] = propertiesSnapshot.docs.map((doc) => {
          const data = doc.data();
          return {
            id: data.propertyId || doc.id,
            title: data.title || "Untitled Property",
            address: data.address || "-",
          };
        });

        setProperties(propertyList);
      } catch (error) {
        console.error("Error fetching properties:", error);
      }
    };

    fetchProperties();
  }, []);

  const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(event.target.files || []);
    const newFiles: UploadedFile[] = files.map((file, index) => ({
      id: Date.now() + index.toString(),
      name: file.name,
      type: file.type,
      size: file.size,
      status: "uploading",
      progress: 0,
      file: file, // Store the actual File object
    }));
    setSelectedFiles((prev) => [...prev, ...newFiles]);
  };

  const handleUpload = async () => {
    if (!documentType) {
      setMessage("Please select a document type");
      return;
    }
    if (!selectedProperty) {
      setMessage("Please select a property");
      return;
    }
    if (selectedFiles.length === 0) {
      setMessage("Please select files to upload");
      return;
    }

    setUploading(true);
    setMessage("");

    try {
      console.log("Starting upload process...");

      const currentUser = auth.currentUser;
      if (!currentUser) {
        setMessage("Please log in to upload documents");
        setUploading(false);
        return;
      }

      console.log("Current user:", currentUser.uid);

      // Get agent data
      const userQuery = query(
        collection(db, "users"),
        where("firebaseUID", "==", currentUser.uid),
      );
      const userSnapshot = await getDocs(userQuery);

      if (userSnapshot.empty) {
        setMessage("Agent data not found");
        setUploading(false);
        return;
      }

      const userData = userSnapshot.docs[0].data();
      const agentId = userData.userID || userSnapshot.docs[0].id;

      console.log("Agent ID:", agentId);
      console.log("Selected Property:", selectedProperty);
      console.log("Document Type:", documentType);

      // Upload each file
      for (let i = 0; i < selectedFiles.length; i++) {
        const file = selectedFiles[i];
        console.log(
          `Uploading file ${i + 1}/${selectedFiles.length}:`,
          file.name,
        );

        // Update progress
        setSelectedFiles((prev) =>
          prev.map((f) =>
            f.id === file.id ? { ...f, progress: 50, status: "uploading" } : f,
          ),
        );

        // Generate next document ID (DOC001, DOC002, etc.)
        const documentsQuery = query(collection(db, "propertyDocuments"));
        const documentsSnapshot = await getDocs(documentsQuery);
        let maxDocNumber = 0;

        documentsSnapshot.docs.forEach((doc) => {
          const data = doc.data();
          const docId = data.documentId;
          if (docId && docId.startsWith("DOC")) {
            const match = docId.match(/DOC(\d+)/);
            if (match) {
              const num = parseInt(match[1], 10);
              if (num > maxDocNumber) maxDocNumber = num;
            }
          }
        });

        const nextDocNumber = maxDocNumber + 1;
        const documentId = `DOC${String(nextDocNumber).padStart(3, "0")}`;
        const documentNumber = `DOC${String(nextDocNumber).padStart(6, "0")}`;

        // Upload file to Cloudinary first
        console.log(`Uploading ${file.name} to Cloudinary...`);
        const cloudinaryUrl = await uploadToCloudinary(file.file); // Use the actual File object
        console.log(`Upload successful: ${cloudinaryUrl}`);

        // Create document data matching the existing structure
        const documentData = {
          documentId: documentId,
          documentName: file.name,
          documentType: documentType.toLowerCase().replace(/\s+/g, "_"), // Convert to snake_case
          documentCategory: "",
          documentNumber: documentNumber, // DOC000001 format
          fileName: file.name,
          fileSize: file.size,
          fileUrl: cloudinaryUrl, // Real Cloudinary URL - FREE 25GB storage!
          documentHash: "",
          isAuthentic: "true", // String "true" as shown in your data
          isRequired: true,
          propertyId: selectedProperty,
          uploadedBy: agentId, // Use agentId instead of UID
          uploadedAt: serverTimestamp(),
          verificationStatus: "pending",
          verificationNotes: "",
          verificationWeight: 20, // Default weight
          verifiedBy: "",
          verifiedAt: null,
          agentId: agentId,
          agentUID: currentUser.uid,
          createdAt: serverTimestamp(),
        };

        console.log("Document data to upload:", documentData);

        try {
          // Add to Firestore with retry logic
          let docRef;
          let retryCount = 0;
          const maxRetries = 3;

          while (retryCount < maxRetries) {
            try {
              docRef = await addDoc(
                collection(db, "propertyDocuments"),
                documentData,
              );
              console.log("Document uploaded successfully with ID:", docRef.id);
              break; // Success, exit retry loop
            } catch (retryError) {
              retryCount++;
              console.log(`Upload attempt ${retryCount} failed:`, retryError);

              if (retryCount >= maxRetries) {
                throw retryError; // Give up after max retries
              }

              // Wait before retrying (exponential backoff)
              await new Promise((resolve) =>
                setTimeout(resolve, 1000 * retryCount),
              );
            }
          }

          // Update progress to success
          setSelectedFiles((prev) =>
            prev.map((f) =>
              f.id === file.id ? { ...f, progress: 100, status: "success" } : f,
            ),
          );

          // Small delay for visual feedback
          await new Promise((resolve) => setTimeout(resolve, 500));
        } catch (fileError) {
          console.error("Error uploading file:", file.name, fileError);
          setSelectedFiles((prev) =>
            prev.map((f) =>
              f.id === file.id ? { ...f, progress: 0, status: "error" } : f,
            ),
          );
          throw fileError;
        }
      }

      setMessage(
        "All documents uploaded successfully! They are now pending admin verification.",
      );
      setTimeout(() => {
        setSelectedFiles([]);
        setDocumentType("");
        setSelectedProperty("");
        setMessage("");
      }, 3000);
    } catch (error) {
      console.error("Upload error:", error);
      setMessage(`Upload failed: ${error.message || "Unknown error"}`);
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
              <div className="grid grid-cols-1 gap-6 md:grid-cols-3">
                {/* Property Selection */}
                <div>
                  <label className="mb-2 block text-sm font-medium text-gray-700 dark:text-gray-300">
                    Select Property *
                  </label>
                  <select
                    value={selectedProperty}
                    onChange={(e) => setSelectedProperty(e.target.value)}
                    className="w-full rounded-md border border-gray-300 px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:outline-none dark:border-gray-600 dark:bg-gray-700 dark:text-white"
                  >
                    <option value="">Select a property</option>
                    {properties.map((property) => (
                      <option key={property.id} value={property.id}>
                        {property.title} - {property.address}
                      </option>
                    ))}
                  </select>
                </div>

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
                  <input
                    ref={fileInputRef}
                    type="file"
                    multiple
                    accept=".pdf,.doc,.docx,.jpg,.jpeg,.png"
                    onChange={handleFileSelect}
                    className="w-full rounded-md border border-gray-300 px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:outline-none dark:border-gray-600 dark:bg-gray-700 dark:text-white"
                  />
                </div>
              </div>

              {/* Upload Button */}
              <div className="mt-6">
                <button
                  onClick={handleUpload}
                  disabled={uploading}
                  className="w-full rounded-md bg-blue-600 px-4 py-2 text-white hover:bg-blue-700 disabled:opacity-50"
                >
                  {uploading ? "Uploading..." : "Upload Documents"}
                </button>
              </div>

              {/* Message */}
              {message && (
                <div className="mt-4 rounded-md bg-blue-100 p-3 text-blue-700 dark:bg-blue-900 dark:text-blue-300">
                  {message}
                </div>
              )}
            </div>

            {/* Selected Files */}
            {selectedFiles.length > 0 && (
              <div className="rounded-lg bg-white p-6 shadow-md dark:bg-gray-800">
                <h3 className="mb-4 text-lg font-semibold text-gray-900 dark:text-white">
                  Selected Files
                </h3>
                <div className="space-y-3">
                  {selectedFiles.map((file) => (
                    <div
                      key={file.id}
                      className="flex items-center justify-between rounded-lg border border-gray-200 p-3 dark:border-gray-700"
                    >
                      <div className="flex-1">
                        <p className="font-medium text-gray-900 dark:text-white">
                          {file.name}
                        </p>
                        <p className="text-sm text-gray-500 dark:text-gray-400">
                          {formatFileSize(file.size)} • {file.type}
                        </p>
                      </div>
                      <div className="flex items-center gap-2">
                        {file.status === "uploading" && (
                          <div className="flex items-center gap-2">
                            <div className="h-2 w-16 rounded-full bg-gray-200 dark:bg-gray-700">
                              <div
                                className="h-2 rounded-full bg-blue-600 transition-all duration-300"
                                style={{ width: `${file.progress}%` }}
                              ></div>
                            </div>
                            <span className="text-sm text-gray-500 dark:text-gray-400">
                              {file.progress}%
                            </span>
                          </div>
                        )}
                        {file.status === "success" && (
                          <span className="text-sm text-green-600 dark:text-green-400">
                            ✓ Uploaded
                          </span>
                        )}
                        {file.status === "error" && (
                          <span className="text-sm text-red-600 dark:text-red-400">
                            ✗ Error
                          </span>
                        )}
                        <button
                          onClick={() => removeFile(file.id)}
                          className="text-red-500 hover:text-red-700"
                        >
                          ✕
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </>
  );
}
