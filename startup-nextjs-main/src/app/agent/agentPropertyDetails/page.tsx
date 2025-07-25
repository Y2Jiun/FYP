"use client";

import React, { useState, useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import AgentHeader from "@/components/Agent/agentHeader";
import { db } from "@/lib/firebase";
import { doc, getDoc, updateDoc } from "firebase/firestore";
import { storage } from "@/lib/firebase";
import { ref, uploadBytesResumable, getDownloadURL } from "firebase/storage";
import imageCompression from "browser-image-compression";

interface PropertyDetails {
  id: string;
  title: string;
  address: string;
  price: number;
  type: string;
  status: "pending" | "verified" | "rejected";
  description: string;
  bedrooms: number;
  bathrooms: number;
  city: string;
  postcode: string;
  size: number;
  agentName?: string;
  createdAt?: string;
  updatedAt?: string;
  image1?: string;
  image2?: string;
  image3?: string;
  // Add more fields as needed
}

// Add this to declare window.cloudinary for TypeScript
declare global {
  interface Window {
    cloudinary: any;
  }
}

export default function AgentPropertyDetails() {
  const [property, setProperty] = useState<PropertyDetails | null>(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState("overview");
  const [editMode, setEditMode] = useState(false);
  const [editData, setEditData] = useState<PropertyDetails | null>(null);
  const [saving, setSaving] = useState(false);
  const [uploading, setUploading] = useState([false, false, false]);
  const router = useRouter();
  const searchParams = useSearchParams();
  const propertyId = searchParams.get("id");

  useEffect(() => {
    const fetchPropertyDetails = async () => {
      setLoading(true);
      try {
        if (!propertyId) {
          setProperty(null);
          setLoading(false);
          return;
        }
        const docRef = doc(db, "properties", propertyId);
        const docSnap = await getDoc(docRef);
        if (docSnap.exists()) {
          const data = docSnap.data();
          const prop: PropertyDetails = {
            id: data.propertyId || propertyId,
            title: data.title || "Untitled Property",
            address: data.address || "-",
            price: data.price || 0,
            type: data.propertyType || "-",
            status: data.status || "pending",
            description: data.description || "-",
            bedrooms: data.bedrooms || 0,
            bathrooms: data.bathrooms || 0,
            city: data.city || "-",
            postcode: data.postcode || "-",
            size: data.size || 0,
            agentName: data.agentName || "-",
            createdAt:
              data.createdAt && data.createdAt.toDate
                ? data.createdAt.toDate().toLocaleString()
                : "-",
            updatedAt:
              data.updatedAt && data.updatedAt.toDate
                ? data.updatedAt.toDate().toLocaleString()
                : "-",
            image1: data.image1 || "",
            image2: data.image2 || "",
            image3: data.image3 || "",
          };
          setProperty(prop);
          setEditData(prop);
        } else {
          setProperty(null);
        }
      } catch (error) {
        console.error("Error fetching property details:", error);
        setProperty(null);
      } finally {
        setLoading(false);
      }
    };
    fetchPropertyDetails();
  }, [propertyId]);

  // Handle edit changes
  const handleEditChange = (field: keyof PropertyDetails, value: any) => {
    if (!editData) return;
    setEditData({ ...editData, [field]: value });
  };

  // Add Cloudinary upload handler for property images
  const handleCloudinaryImageUpload = (idx: number) => {
    if (!window.cloudinary) return;
    window.cloudinary.openUploadWidget(
      {
        cloudName: "dvl5whm1n", // your Cloudinary cloud name
        uploadPreset: "derrick", // your unsigned preset name
        sources: ["local", "url", "camera"],
        multiple: false,
        cropping: false,
        defaultSource: "local",
      },
      async (error, result) => {
        if (!error && result && result.event === "success") {
          handleEditChange(`image${idx + 1}` as any, result.info.secure_url);
        }
      },
    );
  };

  // Save edits to Firestore
  const handleSave = async () => {
    if (!editData) return;
    setSaving(true);
    try {
      const docRef = doc(db, "properties", propertyId!);
      await updateDoc(docRef, {
        title: editData.title,
        address: editData.address,
        price: editData.price,
        propertyType: editData.type,
        status: editData.status,
        description: editData.description,
        bedrooms: editData.bedrooms,
        bathrooms: editData.bathrooms,
        city: editData.city,
        postcode: editData.postcode,
        size: editData.size,
        agentName: editData.agentName,
        image1: editData.image1 || "",
        image2: editData.image2 || "",
        image3: editData.image3 || "",
      });
      setProperty(editData);
      setEditMode(false);
    } catch (err) {
      alert("Failed to save changes.");
    } finally {
      setSaving(false);
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "verified":
      case "approved":
        return "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300";
      case "pending":
        return "bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-300";
      case "rejected":
        return "bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-300";
      default:
        return "bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-300";
    }
  };

  // Prepare image gallery
  const images = [property?.image1, property?.image2, property?.image3].filter(
    (img) => img && img !== "",
  );
  const placeholder = "/images/property-placeholder.png";

  // Dropdown options
  const typeOptions = ["condo", "apartment", "landed", "bangulow"];
  const cityOptions = [
    "kuala lumpur",
    "selangor",
    "perlis",
    "kedah",
    "pulau pinang",
    "terengganu",
    "kelantan",
    "pahang",
    "perak",
    "putrajaya",
    "cyberjaya",
    "melaka",
    "johor",
    "negeri sembilan",
    "sabah",
    "sarawak",
    "labuan",
  ];

  if (loading) {
    return (
      <>
        <AgentHeader />
        <div className="flex min-h-screen items-center justify-center bg-gray-50 dark:bg-gray-900">
          <div className="text-center">
            <div className="mx-auto h-12 w-12 animate-spin rounded-full border-b-2 border-blue-600"></div>
            <p className="mt-4 text-gray-600 dark:text-gray-400">
              Loading property details...
            </p>
          </div>
        </div>
      </>
    );
  }

  if (!property) {
    return (
      <>
        <AgentHeader />
        <div className="flex min-h-screen items-center justify-center bg-gray-50 dark:bg-gray-900">
          <div className="text-center">
            <h2 className="mb-4 text-2xl font-bold text-gray-900 dark:text-white">
              Property Not Found
            </h2>
            <p className="mb-4 text-gray-600 dark:text-gray-400">
              The property you're looking for doesn't exist.
            </p>
            <button
              onClick={() => router.push("/agent/agentPropertyList")}
              className="rounded-md bg-blue-600 px-4 py-2 text-white hover:bg-blue-700"
            >
              Back to Property List
            </button>
          </div>
        </div>
      </>
    );
  }

  return (
    <>
      <AgentHeader />
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
        <div className="container mx-auto px-4 py-8">
          <div className="mx-auto max-w-3xl">
            <div className="mb-8 flex items-center justify-between">
              <div>
                {editMode ? (
                  <input
                    className="mb-2 w-full rounded border px-2 py-1 text-3xl font-bold text-gray-900 dark:bg-gray-800 dark:text-white"
                    value={editData?.title || ""}
                    onChange={(e) => handleEditChange("title", e.target.value)}
                  />
                ) : (
                  <h1 className="mb-2 text-3xl font-bold text-gray-900 dark:text-white">
                    {property.title}
                  </h1>
                )}
                <p className="text-gray-600 dark:text-gray-400">
                  {editMode ? (
                    <input
                      className="w-full rounded border px-2 py-1 dark:bg-gray-800 dark:text-white"
                      value={editData?.address || ""}
                      onChange={(e) =>
                        handleEditChange("address", e.target.value)
                      }
                    />
                  ) : (
                    property.address
                  )}
                </p>
              </div>
              <div className="flex items-center space-x-4">
                <span
                  className={`rounded-full px-3 py-1 text-sm font-medium ${getStatusColor(property.status)}`}
                >
                  {property.status.charAt(0).toUpperCase() +
                    property.status.slice(1)}
                </span>
                <button
                  onClick={() => router.push("/agent/agentPropertyList")}
                  className="rounded-md bg-gray-600 px-4 py-2 text-white hover:bg-gray-700"
                >
                  Back to List
                </button>
                <button
                  onClick={() => setEditMode((v) => !v)}
                  className="rounded-md bg-blue-600 px-4 py-2 text-white hover:bg-blue-700"
                  disabled={saving}
                >
                  {editMode ? "Cancel" : "Edit"}
                </button>
                {editMode && (
                  <button
                    onClick={handleSave}
                    className="rounded-md bg-green-600 px-4 py-2 text-white hover:bg-green-700"
                    disabled={saving || uploading.some(Boolean)}
                  >
                    {saving
                      ? "Saving..."
                      : uploading.some(Boolean)
                        ? "Uploading..."
                        : "Save"}
                  </button>
                )}
              </div>
            </div>
            {/* Image Gallery (Editable) */}
            <div className="mb-8 flex w-full flex-col gap-2">
              <div className="flex w-full justify-center">
                {editMode ? (
                  <div className="flex w-full flex-col gap-2">
                    {[0, 1, 2].map((idx) => (
                      <div key={idx} className="mb-2 flex items-center gap-2">
                        <button
                          type="button"
                          className="rounded bg-blue-500 px-3 py-1 text-white hover:bg-blue-600 focus:outline-none"
                          onClick={() => handleCloudinaryImageUpload(idx)}
                        >
                          Upload Image {idx + 1}
                        </button>
                        <img
                          src={
                            editData && editData[`image${idx + 1}`]
                              ? editData[`image${idx + 1}`]
                              : placeholder
                          }
                          alt={`Property image ${idx + 1}`}
                          className="h-16 w-24 rounded border border-gray-200 bg-gray-100 object-cover shadow-sm dark:border-gray-700 dark:bg-gray-800"
                        />
                      </div>
                    ))}
                  </div>
                ) : (
                  <img
                    src={images[0] || placeholder}
                    alt={property.title}
                    className="max-h-72 w-full rounded-lg border border-gray-200 bg-gray-100 object-cover shadow dark:border-gray-700 dark:bg-gray-800"
                  />
                )}
              </div>
              {!editMode && images.length > 1 && (
                <div className="mt-2 flex justify-center gap-2">
                  {images.map((img, idx) => (
                    <img
                      key={idx}
                      src={img || placeholder}
                      alt={`Property image ${idx + 1}`}
                      className="h-16 w-24 rounded border border-gray-200 bg-gray-100 object-cover shadow-sm dark:border-gray-700 dark:bg-gray-800"
                    />
                  ))}
                </div>
              )}
            </div>
            <div className="rounded-2xl border border-gray-200 bg-white p-8 shadow-xl dark:border-gray-700 dark:bg-gray-800">
              <h3 className="mb-6 border-b pb-2 text-2xl font-bold text-gray-900 dark:text-white">
                Property Information
              </h3>
              <div className="grid grid-cols-1 gap-8 md:grid-cols-2">
                <div className="space-y-4">
                  <div>
                    <label className="mb-1 block text-sm font-semibold text-gray-700 dark:text-gray-300">
                      Description:
                    </label>
                    {editMode ? (
                      <input
                        className="w-full rounded border px-3 py-2 dark:bg-gray-800 dark:text-white"
                        value={editData?.description || ""}
                        onChange={(e) =>
                          handleEditChange("description", e.target.value)
                        }
                      />
                    ) : (
                      <div className="text-gray-900 dark:text-white">
                        {property.description}
                      </div>
                    )}
                  </div>
                  <div>
                    <label className="mb-1 block text-sm font-semibold text-gray-700 dark:text-gray-300">
                      Type:
                    </label>
                    {editMode ? (
                      <select
                        className="w-full rounded border px-3 py-2 dark:bg-gray-800 dark:text-white"
                        value={editData?.type || ""}
                        onChange={(e) =>
                          handleEditChange("type", e.target.value)
                        }
                      >
                        <option value="">Select type</option>
                        {typeOptions.map((opt) => (
                          <option key={opt} value={opt}>
                            {opt.charAt(0).toUpperCase() + opt.slice(1)}
                          </option>
                        ))}
                      </select>
                    ) : (
                      <div className="text-gray-900 dark:text-white">
                        {property.type}
                      </div>
                    )}
                  </div>
                  <div>
                    <label className="mb-1 block text-sm font-semibold text-gray-700 dark:text-gray-300">
                      Price:
                    </label>
                    {editMode ? (
                      <input
                        type="number"
                        className="w-full rounded border px-3 py-2 dark:bg-gray-800 dark:text-white"
                        value={editData?.price || 0}
                        onChange={(e) =>
                          handleEditChange("price", Number(e.target.value))
                        }
                      />
                    ) : (
                      <div className="text-gray-900 dark:text-white">
                        RM{property.price.toLocaleString()}
                      </div>
                    )}
                  </div>
                  <div>
                    <label className="mb-1 block text-sm font-semibold text-gray-700 dark:text-gray-300">
                      Size:
                    </label>
                    {editMode ? (
                      <input
                        type="number"
                        className="w-full rounded border px-3 py-2 dark:bg-gray-800 dark:text-white"
                        value={editData?.size || 0}
                        onChange={(e) =>
                          handleEditChange("size", Number(e.target.value))
                        }
                      />
                    ) : (
                      <div className="text-gray-900 dark:text-white">
                        {property.size} sqft
                      </div>
                    )}
                  </div>
                  <div>
                    <label className="mb-1 block text-sm font-semibold text-gray-700 dark:text-gray-300">
                      Bedrooms:
                    </label>
                    {editMode ? (
                      <input
                        type="number"
                        className="w-full rounded border px-3 py-2 dark:bg-gray-800 dark:text-white"
                        value={editData?.bedrooms || 0}
                        onChange={(e) =>
                          handleEditChange("bedrooms", Number(e.target.value))
                        }
                      />
                    ) : (
                      <div className="text-gray-900 dark:text-white">
                        {property.bedrooms}
                      </div>
                    )}
                  </div>
                  <div>
                    <label className="mb-1 block text-sm font-semibold text-gray-700 dark:text-gray-300">
                      Bathrooms:
                    </label>
                    {editMode ? (
                      <input
                        type="number"
                        className="w-full rounded border px-3 py-2 dark:bg-gray-800 dark:text-white"
                        value={editData?.bathrooms || 0}
                        onChange={(e) =>
                          handleEditChange("bathrooms", Number(e.target.value))
                        }
                      />
                    ) : (
                      <div className="text-gray-900 dark:text-white">
                        {property.bathrooms}
                      </div>
                    )}
                  </div>
                </div>
                <div className="space-y-4">
                  <div>
                    <label className="mb-1 block text-sm font-semibold text-gray-700 dark:text-gray-300">
                      City:
                    </label>
                    {editMode ? (
                      <select
                        className="w-full rounded border px-3 py-2 dark:bg-gray-800 dark:text-white"
                        value={editData?.city || ""}
                        onChange={(e) =>
                          handleEditChange("city", e.target.value)
                        }
                      >
                        <option value="">Select city</option>
                        {cityOptions.map((opt) => (
                          <option key={opt} value={opt}>
                            {opt.charAt(0).toUpperCase() + opt.slice(1)}
                          </option>
                        ))}
                      </select>
                    ) : (
                      <div className="text-gray-900 dark:text-white">
                        {property.city}
                      </div>
                    )}
                  </div>
                  <div>
                    <label className="mb-1 block text-sm font-semibold text-gray-700 dark:text-gray-300">
                      Postcode:
                    </label>
                    {editMode ? (
                      <input
                        className="w-full rounded border px-3 py-2 dark:bg-gray-800 dark:text-white"
                        value={editData?.postcode || ""}
                        onChange={(e) =>
                          handleEditChange("postcode", e.target.value)
                        }
                      />
                    ) : (
                      <div className="text-gray-900 dark:text-white">
                        {property.postcode}
                      </div>
                    )}
                  </div>
                  <div>
                    <label className="mb-1 block text-sm font-semibold text-gray-700 dark:text-gray-300">
                      Agent:
                    </label>
                    <div className="cursor-not-allowed rounded bg-gray-100 px-3 py-2 text-gray-900 dark:bg-gray-700 dark:text-white">
                      {property.agentName}
                    </div>
                  </div>
                  <div>
                    <label className="mb-1 block text-sm font-semibold text-gray-700 dark:text-gray-300">
                      Created At:
                    </label>
                    <div className="text-gray-900 dark:text-white">
                      {property.createdAt}
                    </div>
                  </div>
                  <div>
                    <label className="mb-1 block text-sm font-semibold text-gray-700 dark:text-gray-300">
                      Updated At:
                    </label>
                    <div className="text-gray-900 dark:text-white">
                      {property.updatedAt}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
