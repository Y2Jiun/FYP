"use client";
import React, { useEffect, useState } from "react";
import { db } from "@/lib/firebase";
import { collection, query, where, getDocs } from "firebase/firestore";
import { useRouter } from "next/navigation";
import AdminHeader from "@/components/Admin/AdminHeader";

interface PropertyQueueItem {
  propertyId: string;
  title: string;
  address: string;
  status: string;
}

export default function AdminVerificationQueue() {
  const [properties, setProperties] = useState<PropertyQueueItem[]>([]);
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    const fetchQueue = async () => {
      setLoading(true);
      const q = query(
        collection(db, "properties"),
        where("status", "in", ["pending_verification", "pending"]),
      );
      const querySnapshot = await getDocs(q);
      const items: PropertyQueueItem[] = [];
      querySnapshot.forEach((doc) => {
        const data = doc.data();
        items.push({
          propertyId: data.propertyId || doc.id,
          title: data.title || "Untitled Property",
          address: data.address || "-",
          status: data.status || "pending",
        });
      });
      setProperties(items);
      setLoading(false);
    };
    fetchQueue();
  }, []);

  return (
    <>
      <AdminHeader />
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
        <div className="container mx-auto px-4 py-8">
          <h1 className="mb-8 text-3xl font-bold text-gray-900 dark:text-white">
            Verification Queue
          </h1>
          {loading ? (
            <div className="text-gray-600 dark:text-gray-300">
              Loading queue...
            </div>
          ) : properties.length === 0 ? (
            <div className="text-gray-400">
              No properties pending verification.
            </div>
          ) : (
            <div className="overflow-x-auto rounded-lg bg-white p-6 shadow-md dark:bg-gray-800">
              <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
                <thead>
                  <tr>
                    <th className="px-4 py-2 text-left text-sm font-semibold text-gray-700 dark:text-gray-300">
                      Title
                    </th>
                    <th className="px-4 py-2 text-left text-sm font-semibold text-gray-700 dark:text-gray-300">
                      Address
                    </th>
                    <th className="px-4 py-2 text-left text-sm font-semibold text-gray-700 dark:text-gray-300">
                      Status
                    </th>
                    <th className="px-4 py-2"></th>
                  </tr>
                </thead>
                <tbody>
                  {properties.map((prop) => (
                    <tr
                      key={prop.propertyId}
                      className="border-b dark:border-gray-700"
                    >
                      <td className="px-4 py-2 text-gray-900 dark:text-white">
                        {prop.title}
                      </td>
                      <td className="px-4 py-2 text-gray-700 dark:text-gray-300">
                        {prop.address}
                      </td>
                      <td className="px-4 py-2">
                        <span className="rounded-full bg-yellow-100 px-3 py-1 text-xs font-medium text-yellow-800 dark:bg-yellow-900 dark:text-yellow-300">
                          {prop.status.charAt(0).toUpperCase() +
                            prop.status.slice(1)}
                        </span>
                      </td>
                      <td className="px-4 py-2">
                        <button
                          onClick={() =>
                            router.push(
                              `/admin/adminPropertyDetails?id=${prop.propertyId}`,
                            )
                          }
                          className="rounded bg-blue-600 px-4 py-2 text-white hover:bg-blue-700"
                        >
                          View Details
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    </>
  );
}
