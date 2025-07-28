"use client";
import React, { useEffect, useState } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { db } from "@/lib/firebase";
import { doc, getDoc } from "firebase/firestore";
import PropertyVerificationHistoryTimeline from "@/components/Property/PropertyVerificationHistoryTimeline";

interface PropertyDetails {
  propertyId: string;
  title: string;
  address: string;
  price: number;
  propertyType: string;
  status: string;
  description?: string;
  agentName?: string;
  createdAt?: string;
  updatedAt?: string;
}

export default function AdminPropertyDetails() {
  const [property, setProperty] = useState<PropertyDetails | null>(null);
  const [loading, setLoading] = useState(true);
  const searchParams = useSearchParams();
  const router = useRouter();
  const propertyId = searchParams.get("id");

  useEffect(() => {
    const fetchProperty = async () => {
      setLoading(true);
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
          propertyId: data.propertyId || propertyId,
          title: data.title || "Untitled Property",
          address: data.address || "-",
          price: data.price || 0,
          propertyType: data.propertyType || "-",
          status: data.status || "pending",
          description: data.description || "-",
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
      setLoading(false);
    };
    fetchProperty();
  }, [propertyId]);

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-gray-50 dark:bg-gray-900">
        <div className="text-center">
          <div className="mx-auto h-12 w-12 animate-spin rounded-full border-b-2 border-blue-600"></div>
          <p className="mt-4 text-gray-600 dark:text-gray-400">
            Loading property details...
          </p>
        </div>
      </div>
    );
  }

  if (!property) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-gray-50 dark:bg-gray-900">
        <div className="text-center">
          <h2 className="mb-4 text-2xl font-bold text-gray-900 dark:text-white">
            Property Not Found
          </h2>
          <p className="mb-4 text-gray-600 dark:text-gray-400">
            The property you're looking for doesn't exist.
          </p>
          <button
            onClick={() => router.push("/admin/adminVerificationQueue")}
            className="rounded-md bg-blue-600 px-4 py-2 text-white hover:bg-blue-700"
          >
            Back to Verification Queue
          </button>
        </div>
      </div>
    );
  }

  return (
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
              <span className="rounded-full bg-blue-100 px-3 py-1 text-sm font-medium text-blue-800 dark:bg-blue-900 dark:text-blue-200">
                {property.status.charAt(0).toUpperCase() +
                  property.status.slice(1)}
              </span>
              <button
                onClick={() => router.push("/admin/adminVerificationQueue")}
                className="rounded-md bg-gray-600 px-4 py-2 text-white hover:bg-gray-700"
              >
                Back to Queue
              </button>
            </div>
          </div>
          <div className="mb-8 rounded-lg bg-white p-6 shadow-md dark:bg-gray-800">
            <h3 className="mb-4 text-xl font-semibold text-gray-900 dark:text-white">
              Property Information
            </h3>
            <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
              <div>
                <div className="mb-2">
                  <span className="font-medium text-gray-700 dark:text-gray-300">
                    Description:
                  </span>
                  <span className="text-gray-900 dark:text-white">
                    {property.description}
                  </span>
                </div>
                <div className="mb-2">
                  <span className="font-medium text-gray-700 dark:text-gray-300">
                    Type:
                  </span>
                  <span className="text-gray-900 dark:text-white">
                    {property.propertyType}
                  </span>
                </div>
                <div className="mb-2">
                  <span className="font-medium text-gray-700 dark:text-gray-300">
                    Price:
                  </span>
                  <span className="text-gray-900 dark:text-white">
                    RM{property.price.toLocaleString()}
                  </span>
                </div>
              </div>
              <div>
                <div className="mb-2">
                  <span className="font-medium text-gray-700 dark:text-gray-300">
                    Agent:
                  </span>
                  <span className="text-gray-900 dark:text-white">
                    {property.agentName}
                  </span>
                </div>
                <div className="mb-2">
                  <span className="font-medium text-gray-700 dark:text-gray-300">
                    Created At:
                  </span>
                  <span className="text-gray-900 dark:text-white">
                    {property.createdAt}
                  </span>
                </div>
                <div className="mb-2">
                  <span className="font-medium text-gray-700 dark:text-gray-300">
                    Updated At:
                  </span>
                  <span className="text-gray-900 dark:text-white">
                    {property.updatedAt}
                  </span>
                </div>
              </div>
            </div>
          </div>
          {/* Verification History Timeline */}
          <PropertyVerificationHistoryTimeline
            propertyId={property.propertyId}
          />
        </div>
      </div>
    </div>
  );
}
