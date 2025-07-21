"use client";
import React, { useEffect, useState } from "react";
import UserHeader from "@/components/User/userHeader";
import { db } from "@/lib/firebase";
import { collection, getDocs, query, where } from "firebase/firestore";
import Link from "next/link";

interface Property {
  id: string;
  title: string;
  address: string;
  price: number;
  type: string;
  status: "pending" | "verified" | "rejected";
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

export default function UserPropertyList() {
  const [properties, setProperties] = useState<Property[]>([]);
  const [loading, setLoading] = useState(true);
  const [userId, setUserId] = useState<string | null>(null);

  useEffect(() => {
    if (typeof window !== "undefined") {
      setUserId(localStorage.getItem("userID"));
    }
  }, []);

  useEffect(() => {
    if (!userId) return;
    const fetchProperties = async () => {
      setLoading(true);
      try {
        const q = query(
          collection(db, "properties"),
          where("ownerId", "==", userId),
        );
        const querySnapshot = await getDocs(q);
        const propertyList: Property[] = querySnapshot.docs.map((doc) => {
          const data = doc.data();
          return {
            id: data.propertyId || doc.id,
            title: data.title || "Untitled Property",
            address: data.address || "-",
            price: data.price || 0,
            type: data.propertyType || "-",
            status: data.status || "pending",
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
  }, [userId]);

  return (
    <>
      <UserHeader />
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
        <div className="container mx-auto px-4 py-8">
          <div className="mx-auto max-w-6xl">
            <div className="mb-8 flex items-center justify-between">
              <div>
                <h1 className="mb-2 text-3xl font-bold text-gray-900 dark:text-white">
                  My Properties
                </h1>
                <p className="text-gray-600 dark:text-gray-400">
                  View and manage your properties
                </p>
              </div>
            </div>
            <div className="overflow-x-auto rounded-lg bg-white shadow-md dark:bg-gray-800">
              {loading ? (
                <div className="flex items-center justify-center py-12">
                  <div className="h-10 w-10 animate-spin rounded-full border-b-2 border-blue-600"></div>
                  <span className="ml-4 text-gray-600 dark:text-gray-300">
                    Loading properties...
                  </span>
                </div>
              ) : (
                <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
                  <thead className="bg-gray-100 dark:bg-gray-700">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-medium tracking-wider text-gray-500 uppercase dark:text-gray-300">
                        Title
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium tracking-wider text-gray-500 uppercase dark:text-gray-300">
                        Address
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium tracking-wider text-gray-500 uppercase dark:text-gray-300">
                        Type
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium tracking-wider text-gray-500 uppercase dark:text-gray-300">
                        Price
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium tracking-wider text-gray-500 uppercase dark:text-gray-300">
                        Status
                      </th>
                      <th className="px-6 py-3 text-center text-xs font-medium tracking-wider text-gray-500 uppercase dark:text-gray-300">
                        Actions
                      </th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-200 bg-white dark:divide-gray-700 dark:bg-gray-800">
                    {properties.map((property) => (
                      <tr key={property.id}>
                        <td className="px-6 py-4 text-sm font-medium whitespace-nowrap text-gray-900 dark:text-white">
                          {property.title}
                        </td>
                        <td className="px-6 py-4 text-sm whitespace-nowrap text-gray-700 dark:text-gray-300">
                          {property.address}
                        </td>
                        <td className="px-6 py-4 text-sm whitespace-nowrap text-gray-700 dark:text-gray-300">
                          {property.type}
                        </td>
                        <td className="px-6 py-4 text-sm whitespace-nowrap text-gray-700 dark:text-gray-300">
                          RM{property.price.toLocaleString()}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span
                            className={`rounded-full px-3 py-1 text-xs font-medium ${getStatusColor(property.status)}`}
                          >
                            {property.status.charAt(0).toUpperCase() +
                              property.status.slice(1)}
                          </span>
                        </td>
                        <td className="px-6 py-4 text-center whitespace-nowrap">
                          <Link href={`/property/${property.id}`}>
                            <button className="bg-primary hover:bg-primary/90 mr-2 rounded px-3 py-1 text-xs text-white">
                              Chat about this Property
                            </button>
                          </Link>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              )}
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
