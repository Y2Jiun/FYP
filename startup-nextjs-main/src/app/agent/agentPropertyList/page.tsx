"use client";

import React, { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import AgentHeader from "@/components/Agent/agentHeader";
import { db } from "@/lib/firebase";
import { collection, getDocs } from "firebase/firestore";

interface Property {
  id: string;
  title: string;
  address: string;
  price: number;
  type: string;
  status: "pending" | "verified" | "rejected";
  image1?: string;
}

function getStatusColor(status: string) {
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
}

export default function AgentPropertyList() {
  const [properties, setProperties] = useState<Property[]>([]);
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    const fetchProperties = async () => {
      setLoading(true);
      try {
        const querySnapshot = await getDocs(collection(db, "properties"));
        const propertyList: Property[] = querySnapshot.docs.map((doc) => {
          const data = doc.data();
          return {
            id: data.propertyId || doc.id,
            title: data.title || "Untitled Property",
            address: data.address || "-",
            price: data.price || 0,
            type: data.propertyType || "-",
            status: data.status || "pending",
            image1: data.image1 || "",
          };
        });
        setProperties(propertyList);
      } catch (error) {
        console.error("Error fetching properties:", error);
      } finally {
        setLoading(false);
      }
    };
    fetchProperties();
  }, []);

  return (
    <>
      <AgentHeader />
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
        <div className="container mx-auto px-4 py-8">
          <div className="mx-auto max-w-6xl">
            <div className="mb-8 flex items-center justify-between">
              <div>
                <h1 className="mb-2 text-3xl font-bold text-gray-900 dark:text-white">
                  Property List
                </h1>
                <p className="text-gray-600 dark:text-gray-400">
                  View and manage your listed properties
                </p>
              </div>
              <button
                onClick={() => router.push("/agent/createProperty")}
                className="rounded-md bg-blue-600 px-4 py-2 text-white hover:bg-blue-700"
              >
                Create Property
              </button>
            </div>

            {/* Card Grid Layout */}
            {loading ? (
              <div className="flex items-center justify-center py-12">
                <div className="h-10 w-10 animate-spin rounded-full border-b-2 border-blue-600"></div>
                <span className="ml-4 text-gray-600 dark:text-gray-300">
                  Loading properties...
                </span>
              </div>
            ) : (
              <div className="grid grid-cols-1 gap-8 sm:grid-cols-2 md:grid-cols-3">
                {properties.map((property) => (
                  <div
                    key={property.id}
                    className="flex flex-col overflow-hidden rounded-lg border border-gray-100 bg-white shadow-md transition-shadow hover:shadow-lg dark:border-gray-700 dark:bg-gray-800"
                  >
                    <img
                      src={
                        property.image1 && property.image1 !== ""
                          ? property.image1
                          : "/images/property-placeholder.png"
                      }
                      alt={property.title}
                      className="h-48 w-full bg-gray-100 object-cover dark:bg-gray-700"
                    />
                    <div className="flex flex-1 flex-col p-5">
                      <h2 className="mb-2 text-xl font-semibold text-gray-900 dark:text-white">
                        {property.title}
                      </h2>
                      <p className="mb-1 text-gray-600 dark:text-gray-300">
                        <span className="font-medium">Address:</span>{" "}
                        {property.address}
                      </p>
                      <p className="mb-1 text-gray-600 dark:text-gray-300">
                        <span className="font-medium">Type:</span>{" "}
                        {property.type}
                      </p>
                      <p className="mb-1 text-gray-600 dark:text-gray-300">
                        <span className="font-medium">Price:</span> RM
                        {property.price.toLocaleString()}
                      </p>
                      <div className="mt-1 mb-3">
                        <span
                          className={`rounded-full px-3 py-1 text-xs font-medium ${getStatusColor(property.status)}`}
                        >
                          {property.status.charAt(0).toUpperCase() +
                            property.status.slice(1)}
                        </span>
                      </div>
                      <div className="mt-auto flex gap-2">
                        <button
                          onClick={() =>
                            router.push(
                              `/agent/agentPropertyDetails?id=${property.id}`,
                            )
                          }
                          className="w-1/2 rounded bg-blue-500 px-4 py-2 text-sm text-white shadow hover:bg-blue-600"
                        >
                          View Details
                        </button>
                        <button
                          onClick={() =>
                            router.push("/agent/agentDocumentUpload")
                          }
                          className="w-1/2 rounded bg-green-500 px-4 py-2 text-sm text-white shadow hover:bg-green-600"
                        >
                          Upload Document
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </>
  );
}
