"use client";
import React, { useEffect, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import UserHeader from "@/components/User/userHeader";
import { db } from "@/lib/firebase";
import { doc, getDoc } from "firebase/firestore";
import PropertyVerificationHistoryTimeline from "@/components/Property/PropertyVerificationHistoryTimeline";

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
}

export default function UserPropertyDetails() {
  const [property, setProperty] = useState<PropertyDetails | null>(null);
  const [loading, setLoading] = useState(true);
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
          setProperty({
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
          });
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

  const getStatusColor = (status: string) => {
    switch (status) {
      case "verified":
        return "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300";
      case "pending":
        return "bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-300";
      case "rejected":
        return "bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-300";
      default:
        return "bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-300";
    }
  };

  if (loading) {
    return (
      <>
        <UserHeader />
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
        <UserHeader />
        <div className="flex min-h-screen items-center justify-center bg-gray-50 dark:bg-gray-900">
          <div className="text-center">
            <h2 className="mb-4 text-2xl font-bold text-gray-900 dark:text-white">
              Property Not Found
            </h2>
            <p className="mb-4 text-gray-600 dark:text-gray-400">
              The property you're looking for doesn't exist.
            </p>
            <button
              onClick={() => router.push("/user/userPropertyList")}
              className="rounded-md bg-blue-600 px-4 py-2 text-white hover:bg-blue-700"
            >
              Back to My Properties
            </button>
          </div>
        </div>
      </>
    );
  }

  return (
    <>
      <UserHeader />
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
        <div className="container mx-auto px-4 py-8">
          <div className="mx-auto max-w-3xl">
            <div className="mb-8 flex items-center justify-between">
              <div>
                <h1 className="mb-2 text-3xl font-bold text-gray-900 dark:text-white">
                  {property.title}
                </h1>
                <p className="text-gray-600 dark:text-gray-400">
                  {property.address}
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
                  onClick={() => router.push("/user/userPropertyList")}
                  className="rounded-md bg-gray-600 px-4 py-2 text-white hover:bg-gray-700"
                >
                  Back to List
                </button>
              </div>
            </div>
            <div className="rounded-lg bg-white p-6 shadow-md dark:bg-gray-800">
              <h3 className="mb-4 text-xl font-semibold text-gray-900 dark:text-white">
                Property Information
              </h3>
              <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
                <div>
                  <div className="mb-2">
                    <span className="font-medium text-gray-700 dark:text-gray-300">
                      Description:{" "}
                    </span>
                    <span className="text-gray-900 dark:text-white">
                      {property.description}
                    </span>
                  </div>
                  <div className="mb-2">
                    <span className="font-medium text-gray-700 dark:text-gray-300">
                      Type:{" "}
                    </span>
                    <span className="text-gray-900 dark:text-white">
                      {property.type}
                    </span>
                  </div>
                  <div className="mb-2">
                    <span className="font-medium text-gray-700 dark:text-gray-300">
                      Price:{" "}
                    </span>
                    <span className="text-gray-900 dark:text-white">
                      RM{property.price.toLocaleString()}
                    </span>
                  </div>
                  <div className="mb-2">
                    <span className="font-medium text-gray-700 dark:text-gray-300">
                      Size:{" "}
                    </span>
                    <span className="text-gray-900 dark:text-white">
                      {property.size} sqft
                    </span>
                  </div>
                  <div className="mb-2">
                    <span className="font-medium text-gray-700 dark:text-gray-300">
                      Bedrooms:{" "}
                    </span>
                    <span className="text-gray-900 dark:text-white">
                      {property.bedrooms}
                    </span>
                  </div>
                  <div className="mb-2">
                    <span className="font-medium text-gray-700 dark:text-gray-300">
                      Bathrooms:{" "}
                    </span>
                    <span className="text-gray-900 dark:text-white">
                      {property.bathrooms}
                    </span>
                  </div>
                </div>
                <div>
                  <div className="mb-2">
                    <span className="font-medium text-gray-700 dark:text-gray-300">
                      City:{" "}
                    </span>
                    <span className="text-gray-900 dark:text-white">
                      {property.city}
                    </span>
                  </div>
                  <div className="mb-2">
                    <span className="font-medium text-gray-700 dark:text-gray-300">
                      Postcode:{" "}
                    </span>
                    <span className="text-gray-900 dark:text-white">
                      {property.postcode}
                    </span>
                  </div>
                  <div className="mb-2">
                    <span className="font-medium text-gray-700 dark:text-gray-300">
                      Agent:{" "}
                    </span>
                    <span className="text-gray-900 dark:text-white">
                      {property.agentName}
                    </span>
                  </div>
                  <div className="mb-2">
                    <span className="font-medium text-gray-700 dark:text-gray-300">
                      Created At:{" "}
                    </span>
                    <span className="text-gray-900 dark:text-white">
                      {property.createdAt}
                    </span>
                  </div>
                  <div className="mb-2">
                    <span className="font-medium text-gray-700 dark:text-gray-300">
                      Updated At:{" "}
                    </span>
                    <span className="text-gray-900 dark:text-white">
                      {property.updatedAt}
                    </span>
                  </div>
                </div>
              </div>
            </div>
            {property && (
              <PropertyVerificationHistoryTimeline propertyId={property.id} />
            )}
          </div>
        </div>
      </div>
    </>
  );
}
