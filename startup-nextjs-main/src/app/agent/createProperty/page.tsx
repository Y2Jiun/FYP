"use client";
import React, { useState } from "react";
import { db } from "@/lib/firebase";
import { collection, getDocs, setDoc, doc } from "firebase/firestore";
import { useRouter } from "next/navigation";

// Add this to declare window.cloudinary for TypeScript
declare global {
  interface Window {
    cloudinary: any;
  }
}

const initialForm = {
  title: "",
  address: "",
  price: "",
  type: "",
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
  const router = useRouter();

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
    try {
      const propertyId = await getNextPropertyId();
      await setDoc(doc(db, "properties", propertyId), {
        ...form,
        propertyId,
        price: Number(form.price),
        bedrooms: Number(form.bedrooms),
        bathrooms: Number(form.bathrooms),
        size: Number(form.size),
        status: "pending",
        createdAt: new Date(),
        updatedAt: new Date(),
      });
      router.push("/agent/agentPropertyList");
    } catch (err) {
      setError("Failed to create property. Please try again.");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-gray-50 py-8 dark:bg-gray-900">
      <div className="w-full max-w-2xl rounded-lg bg-white p-8 shadow-xl dark:bg-gray-800">
        <h1 className="mb-6 text-center text-3xl font-bold text-gray-900 dark:text-white">
          Create New Property
        </h1>
        <form onSubmit={handleSubmit} className="space-y-4">
          <input
            name="title"
            value={form.title}
            onChange={handleChange}
            required
            placeholder="Title"
            className="w-full rounded border px-3 py-2 dark:bg-gray-700 dark:text-white"
          />
          <input
            name="address"
            value={form.address}
            onChange={handleChange}
            required
            placeholder="Address"
            className="w-full rounded border px-3 py-2 dark:bg-gray-700 dark:text-white"
          />
          <input
            name="city"
            value={form.city}
            onChange={handleChange}
            required
            placeholder="City"
            className="w-full rounded border px-3 py-2 dark:bg-gray-700 dark:text-white"
          />
          <input
            name="postcode"
            value={form.postcode}
            onChange={handleChange}
            required
            placeholder="Postcode"
            className="w-full rounded border px-3 py-2 dark:bg-gray-700 dark:text-white"
          />
          <input
            name="price"
            value={form.price}
            onChange={handleChange}
            required
            type="number"
            placeholder="Price"
            className="w-full rounded border px-3 py-2 dark:bg-gray-700 dark:text-white"
          />
          <input
            name="bedrooms"
            value={form.bedrooms}
            onChange={handleChange}
            required
            type="number"
            placeholder="Bedrooms"
            className="w-full rounded border px-3 py-2 dark:bg-gray-700 dark:text-white"
          />
          <input
            name="bathrooms"
            value={form.bathrooms}
            onChange={handleChange}
            required
            type="number"
            placeholder="Bathrooms"
            className="w-full rounded border px-3 py-2 dark:bg-gray-700 dark:text-white"
          />
          <input
            name="size"
            value={form.size}
            onChange={handleChange}
            required
            type="number"
            placeholder="Size (sqft)"
            className="w-full rounded border px-3 py-2 dark:bg-gray-700 dark:text-white"
          />
          <select
            name="type"
            value={form.type}
            onChange={handleChange}
            required
            className="w-full rounded border px-3 py-2 dark:bg-gray-700 dark:text-white"
          >
            <option value="">Select Type</option>
            <option value="condo">Condo</option>
            <option value="apartment">Apartment</option>
            <option value="landed">Landed</option>
            <option value="terrace">Terrace</option>
            <option value="bungalow">Bungalow</option>
            <option value="other">Other</option>
          </select>
          <textarea
            name="description"
            value={form.description}
            onChange={handleChange}
            required
            placeholder="Description"
            className="w-full rounded border px-3 py-2 dark:bg-gray-700 dark:text-white"
          />
          <div className="flex flex-col gap-2">
            {["image1", "image2", "image3"].map((field, idx) => (
              <div key={field} className="flex items-center gap-2">
                <button
                  type="button"
                  className="rounded bg-blue-500 px-3 py-1 text-white hover:bg-blue-600 focus:outline-none"
                  onClick={() => handleCloudinaryUpload(field as any)}
                >
                  Upload Image {idx + 1}
                </button>
                {form[field as keyof typeof form] && (
                  <img
                    src={form[field as keyof typeof form] as string}
                    alt={`Property image ${idx + 1}`}
                    className="h-16 w-24 rounded border border-gray-200 bg-gray-100 object-cover shadow-sm dark:border-gray-700 dark:bg-gray-800"
                  />
                )}
              </div>
            ))}
          </div>
          {error && <div className="text-center text-red-500">{error}</div>}
          <button
            type="submit"
            className="w-full rounded bg-green-600 px-4 py-2 font-bold text-white hover:bg-green-700 disabled:opacity-60"
            disabled={submitting}
          >
            {submitting ? "Creating..." : "Create Property"}
          </button>
        </form>
      </div>
    </div>
  );
}
