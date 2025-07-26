"use client";
import React, { useState, useEffect } from "react";
import { db, auth } from "@/lib/firebase";
import {
  collection,
  getDocs,
  setDoc,
  doc,
  query,
  where,
  addDoc,
  serverTimestamp,
} from "firebase/firestore";
import { useRouter } from "next/navigation";

// Add this to declare window.cloudinary for TypeScript
declare global {
  interface Window {
    cloudinary: any;
  }
}

const malaysianStates = [
  "Perlis",
  "Melaka",
  "Kelantan",
  "Putrajaya",
  "Selangor",
  "Pulau Pinang",
  "Terengganu",
  "Sarawak",
  "Perak",
  "Pahang",
  "Kuala Lumpur",
  "Labuan",
  "Sabah",
  "Johor",
  "Negeri Sembilan",
  "Kedah",
];

const initialForm = {
  title: "",
  address: "",
  price: "",
  propertyType: "", // Changed from 'type' to 'propertyType' to match DB
  status: "pending",
  description: "",
  bedrooms: "",
  bathrooms: "",
  city: "",
  postcode: "",
  size: "",
  image1: "",
  image2: "",
  image3: "",
};

export default function CreatePropertyPage() {
  const [form, setForm] = useState(initialForm);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");
  const [currentUser, setCurrentUser] = useState<any>(null);
  const [userData, setUserData] = useState<any>(null);
  const router = useRouter();

  // Get current user data on component mount
  useEffect(() => {
    const fetchCurrentUser = async () => {
      const user = auth.currentUser;
      if (user) {
        setCurrentUser(user);

        // Fetch user data from Firestore
        const email = localStorage.getItem("userEmail");
        if (email) {
          const q = query(collection(db, "users"), where("email", "==", email));
          const querySnapshot = await getDocs(q);
          if (!querySnapshot.empty) {
            const userDoc = querySnapshot.docs[0];
            setUserData(userDoc.data());
          }
        }
      }
    };

    fetchCurrentUser();
  }, []);

  // Helper to get next propertyId (PROP001, PROP002, ...)
  const getNextPropertyId = async () => {
    const querySnapshot = await getDocs(collection(db, "properties"));
    let maxId = 0;
    querySnapshot.forEach((doc) => {
      const data = doc.data();
      const idStr = (data.propertyId || doc.id || "").replace("PROP", "");
      const idNum = parseInt(idStr, 10);
      if (!isNaN(idNum) && idNum > maxId) maxId = idNum;
    });
    return `PROP${String(maxId + 1).padStart(3, "0")}`;
  };

  const handleChange = (
    e: React.ChangeEvent<
      HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement
    >,
  ) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleCloudinaryUpload = (field: "image1" | "image2" | "image3") => {
    if (!window.cloudinary) return;
    window.cloudinary.openUploadWidget(
      {
        cloudName: "dvl5whm1n",
        uploadPreset: "derrick",
        sources: ["local", "url", "camera"],
        multiple: false,
        cropping: false,
        defaultSource: "local",
      },
      (error: any, result: any) => {
        if (!error && result && result.event === "success") {
          setForm((prev) => ({ ...prev, [field]: result.info.secure_url }));
        }
      },
    );
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    setError("");

    // Validate that we have user data
    if (!currentUser || !userData) {
      setError("User authentication required. Please log in again.");
      setSubmitting(false);
      return;
    }

    try {
      const propertyId = await getNextPropertyId();

      // Prepare property data with all required fields
      const propertyData = {
        ...form,
        propertyId,
        price: Number(form.price),
        bedrooms: Number(form.bedrooms),
        bathrooms: Number(form.bathrooms),
        size: Number(form.size),
        postcode: Number(form.postcode),
        status: "pending",
        createdAt: new Date(),
        updatedAt: new Date(),

        // Agent information (current logged-in user)
        agentId: userData.userID || "",
        agentName: userData.username || "",
        agentUID: currentUser.uid,

        // Owner information (all users can view, so set to current user for now)
        ownerId: userData.userID || "",
        userUID: currentUser.uid,

        // Verification status
        verificationStatus: {
          overall: "pending",
        },
      };

      // Create the property
      await setDoc(doc(db, "properties", propertyId), propertyData);

      // Note: Chat document will be created automatically when a user starts chatting
      // This prevents permission issues with empty userUID/agentUID fields

      router.push("/agent/agentPropertyList");
    } catch (err) {
      console.error("Error creating property:", err);
      setError("Failed to create property. Please try again.");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-indigo-50 py-8 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900">
      <div className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8">
        {/* Header Section */}
        <div className="mb-8 text-center">
          <h1 className="text-4xl font-bold text-gray-900 sm:text-5xl dark:text-white">
            Create New Property
          </h1>
          <p className="mt-3 text-lg text-gray-600 dark:text-gray-300">
            Add a new property to your portfolio
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-8">
          {/* Basic Information Card */}
          <div className="rounded-xl bg-white p-6 shadow-lg sm:p-8 dark:bg-gray-800">
            <h2 className="mb-6 text-2xl font-semibold text-gray-900 dark:text-white">
              Basic Information
            </h2>
            <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
              <div className="sm:col-span-2">
                <label className="mb-2 block text-sm font-medium text-gray-700 dark:text-gray-300">
                  Property Title
                </label>
                <input
                  name="title"
                  value={form.title}
                  onChange={handleChange}
                  required
                  placeholder="Enter property title"
                  className="w-full rounded-lg border border-gray-300 px-4 py-3 focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 focus:outline-none dark:border-gray-600 dark:bg-gray-700 dark:text-white dark:focus:border-blue-400"
                />
              </div>

              <div className="sm:col-span-2">
                <label className="mb-2 block text-sm font-medium text-gray-700 dark:text-gray-300">
                  Address
                </label>
                <input
                  name="address"
                  value={form.address}
                  onChange={handleChange}
                  required
                  placeholder="Enter full address"
                  className="w-full rounded-lg border border-gray-300 px-4 py-3 focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 focus:outline-none dark:border-gray-600 dark:bg-gray-700 dark:text-white dark:focus:border-blue-400"
                />
              </div>

              <div>
                <label className="mb-2 block text-sm font-medium text-gray-700 dark:text-gray-300">
                  State
                </label>
                <select
                  name="city"
                  value={form.city}
                  onChange={handleChange}
                  required
                  className="w-full rounded-lg border border-gray-300 px-4 py-3 focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 focus:outline-none dark:border-gray-600 dark:bg-gray-700 dark:text-white dark:focus:border-blue-400"
                >
                  <option value="">Select State</option>
                  {malaysianStates.map((state) => (
                    <option key={state} value={state}>
                      {state}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="mb-2 block text-sm font-medium text-gray-700 dark:text-gray-300">
                  Postcode
                </label>
                <input
                  name="postcode"
                  value={form.postcode}
                  onChange={handleChange}
                  required
                  type="number"
                  placeholder="Enter postcode"
                  className="w-full rounded-lg border border-gray-300 px-4 py-3 focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 focus:outline-none dark:border-gray-600 dark:bg-gray-700 dark:text-white dark:focus:border-blue-400"
                />
              </div>
            </div>
          </div>

          {/* Property Details Card */}
          <div className="rounded-xl bg-white p-6 shadow-lg sm:p-8 dark:bg-gray-800">
            <h2 className="mb-6 text-2xl font-semibold text-gray-900 dark:text-white">
              Property Details
            </h2>
            <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
              <div>
                <label className="mb-2 block text-sm font-medium text-gray-700 dark:text-gray-300">
                  Price (RM)
                </label>
                <input
                  name="price"
                  value={form.price}
                  onChange={handleChange}
                  required
                  type="number"
                  placeholder="0"
                  className="w-full rounded-lg border border-gray-300 px-4 py-3 focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 focus:outline-none dark:border-gray-600 dark:bg-gray-700 dark:text-white dark:focus:border-blue-400"
                />
              </div>

              <div>
                <label className="mb-2 block text-sm font-medium text-gray-700 dark:text-gray-300">
                  Bedrooms
                </label>
                <input
                  name="bedrooms"
                  value={form.bedrooms}
                  onChange={handleChange}
                  required
                  type="number"
                  placeholder="0"
                  className="w-full rounded-lg border border-gray-300 px-4 py-3 focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 focus:outline-none dark:border-gray-600 dark:bg-gray-700 dark:text-white dark:focus:border-blue-400"
                />
              </div>

              <div>
                <label className="mb-2 block text-sm font-medium text-gray-700 dark:text-gray-300">
                  Bathrooms
                </label>
                <input
                  name="bathrooms"
                  value={form.bathrooms}
                  onChange={handleChange}
                  required
                  type="number"
                  placeholder="0"
                  className="w-full rounded-lg border border-gray-300 px-4 py-3 focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 focus:outline-none dark:border-gray-600 dark:bg-gray-700 dark:text-white dark:focus:border-blue-400"
                />
              </div>

              <div>
                <label className="mb-2 block text-sm font-medium text-gray-700 dark:text-gray-300">
                  Size (sqft)
                </label>
                <input
                  name="size"
                  value={form.size}
                  onChange={handleChange}
                  required
                  type="number"
                  placeholder="0"
                  className="w-full rounded-lg border border-gray-300 px-4 py-3 focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 focus:outline-none dark:border-gray-600 dark:bg-gray-700 dark:text-white dark:focus:border-blue-400"
                />
              </div>
            </div>

            <div className="mt-6">
              <label className="mb-2 block text-sm font-medium text-gray-700 dark:text-gray-300">
                Property Type
              </label>
              <select
                name="propertyType"
                value={form.propertyType}
                onChange={handleChange}
                required
                className="w-full rounded-lg border border-gray-300 px-4 py-3 focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 focus:outline-none sm:max-w-xs dark:border-gray-600 dark:bg-gray-700 dark:text-white dark:focus:border-blue-400"
              >
                <option value="">Select Property Type</option>
                <option value="condo">Condo</option>
                <option value="apartment">Apartment</option>
                <option value="landed">Landed</option>
                <option value="terrace">Terrace</option>
                <option value="bungalow">Bungalow</option>
                <option value="other">Other</option>
              </select>
            </div>
          </div>

          {/* Description Card */}
          <div className="rounded-xl bg-white p-6 shadow-lg sm:p-8 dark:bg-gray-800">
            <h2 className="mb-6 text-2xl font-semibold text-gray-900 dark:text-white">
              Description
            </h2>
            <div>
              <label className="mb-2 block text-sm font-medium text-gray-700 dark:text-gray-300">
                Property Description
              </label>
              <textarea
                name="description"
                value={form.description}
                onChange={handleChange}
                required
                placeholder="Describe the property features, amenities, and highlights..."
                rows={4}
                className="w-full rounded-lg border border-gray-300 px-4 py-3 focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 focus:outline-none dark:border-gray-600 dark:bg-gray-700 dark:text-white dark:focus:border-blue-400"
              />
            </div>
          </div>

          {/* Images Card */}
          <div className="rounded-xl bg-white p-6 shadow-lg sm:p-8 dark:bg-gray-800">
            <h2 className="mb-6 text-2xl font-semibold text-gray-900 dark:text-white">
              Property Images
            </h2>
            <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
              {["image1", "image2", "image3"].map((field, idx) => (
                <div key={field} className="space-y-3">
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                    Image {idx + 1}
                  </label>
                  <button
                    type="button"
                    className="w-full rounded-lg bg-gradient-to-r from-blue-500 to-blue-600 px-4 py-3 font-medium text-white transition-all hover:from-blue-600 hover:to-blue-700 focus:ring-2 focus:ring-blue-500/20 focus:outline-none"
                    onClick={() => handleCloudinaryUpload(field as any)}
                  >
                    Upload Image {idx + 1}
                  </button>
                  {form[field as keyof typeof form] && (
                    <div className="overflow-hidden rounded-lg border border-gray-200 dark:border-gray-600">
                      <img
                        src={form[field as keyof typeof form] as string}
                        alt={`Property image ${idx + 1}`}
                        className="h-32 w-full object-cover"
                      />
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>

          {/* Error Message */}
          {error && (
            <div className="rounded-lg bg-red-50 p-4 text-center text-red-600 dark:bg-red-900/20 dark:text-red-400">
              {error}
            </div>
          )}

          {/* Submit Button */}
          <div className="flex justify-center">
            <button
              type="submit"
              className="rounded-lg bg-gradient-to-r from-green-500 to-green-600 px-8 py-4 font-semibold text-white transition-all hover:from-green-600 hover:to-green-700 focus:ring-2 focus:ring-green-500/20 focus:outline-none disabled:opacity-60"
              disabled={submitting}
            >
              {submitting ? (
                <div className="flex items-center space-x-2">
                  <div className="h-5 w-5 animate-spin rounded-full border-2 border-white border-t-transparent"></div>
                  <span>Creating Property...</span>
                </div>
              ) : (
                "Create Property"
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
