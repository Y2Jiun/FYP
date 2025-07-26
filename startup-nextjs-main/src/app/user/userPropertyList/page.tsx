"use client";
import React, { useEffect, useState } from "react";
import UserHeader from "@/components/User/userHeader";
import { db } from "@/lib/firebase";
import {
  collection,
  getDocs,
  query,
  where,
  setDoc,
  doc,
  serverTimestamp,
  getDoc,
} from "firebase/firestore";
import Link from "next/link";
import { FlagIcon } from "@heroicons/react/24/outline";

interface Property {
  id: string;
  title: string;
  address: string;
  price: number;
  type: string;
  status: "pending" | "verified" | "rejected";
  image1?: string;
  agentId?: string;
  agentUID?: string;
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

const REPORT_REASONS = [
  "Fraud",
  "Inappropriate Content",
  "Incorrect Info",
  "Other",
];

export default function UserPropertyList() {
  const [properties, setProperties] = useState<Property[]>([]);
  const [loading, setLoading] = useState(true);
  const [userId, setUserId] = useState<string | null>(null);
  const [showReportModal, setShowReportModal] = useState(false);
  const [reportProperty, setReportProperty] = useState<Property | null>(null);
  const [reportReason, setReportReason] = useState("");
  const [reportDesc, setReportDesc] = useState("");
  const [reportLoading, setReportLoading] = useState(false);
  const [reportSuccess, setReportSuccess] = useState("");

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
            image1: data.image1 || "",
            agentId: data.agentId || "",
            agentUID: data.agentUID || "",
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

  const handleReport = (property: Property) => {
    setReportProperty(property);
    setShowReportModal(true);
    setReportReason("");
    setReportDesc("");
    setReportSuccess("");
  };

  const handleSubmitReport = async () => {
    if (!reportProperty || !reportReason) return;
    setReportLoading(true);
    try {
      // Fetch property to get agentId and agentUID
      const propertySnap = await getDoc(
        doc(db, "properties", reportProperty.id),
      );
      console.log("propertySnap.exists:", propertySnap.exists());
      const propertyData = propertySnap.exists() ? propertySnap.data() : {};
      console.log("propertyData:", propertyData);
      const agentId = propertyData.agentId || "";
      const agentUID = propertyData.agentUID || "";
      const propertyId = reportProperty.id;

      // Write to propertyReports
      const reportId = `${propertyId}_${Date.now()}`;
      await setDoc(doc(db, "propertyReports", reportId), {
        propertyId,
        agentId,
        agentUID,
        userId: userId || "",
        reason: reportReason,
        description: reportDesc,
        createdAt: serverTimestamp(),
        status: "pending",
      });

      // Create notification for agent (sequential NotificationID)
      // Get current max NotificationID
      const notifSnap = await getDocs(collection(db, "notification"));
      let maxNotifNum = 0;
      notifSnap.forEach((doc) => {
        const idStr = (doc.id || "").replace("NID", "");
        const idNum = parseInt(idStr, 10);
        if (!isNaN(idNum) && idNum > maxNotifNum) maxNotifNum = idNum;
      });
      const nextNotifId = `NID${maxNotifNum + 1}`;
      await setDoc(doc(db, "notification", nextNotifId), {
        NotificationID: nextNotifId,
        propertyId,
        agentId,
        agentUID,
        audience: 2, // agent only
        content: `You received a report for reason: ${reportReason}. Description: ${reportDesc}`,
        createdAt: serverTimestamp(),
        createdBy: "system",
        title: "You received a report",
        type: 2, // alert
      });

      // --- WARNING LOGIC ---
      // Count alert notifications (type:2) for this agent
      const alertQuery = query(
        collection(db, "notification"),
        where("agentId", "==", agentId),
        where("type", "==", 2),
      );
      const alertSnap = await getDocs(alertQuery);
      if (alertSnap.size > 0 && alertSnap.size % 3 === 0) {
        // Create a warning notification
        const nextWarnId = `NID${maxNotifNum + 2}`;
        await setDoc(doc(db, "notification", nextWarnId), {
          NotificationID: nextWarnId,
          propertyId,
          agentId,
          agentUID,
          audience: 2,
          content: `You have received ${alertSnap.size} reports. This is a warning.`,
          createdAt: serverTimestamp(),
          createdBy: "system",
          title: "Warning: Multiple Reports",
          type: 3, // warning
        });
        // Count warnings for this agent
        const warnQuery = query(
          collection(db, "notification"),
          where("agentId", "==", agentId),
          where("type", "==", 3),
        );
        const warnSnap = await getDocs(warnQuery);
        if (warnSnap.size === 3) {
          // Ban agent (set banned: true, do NOT change roles)
          const usersQuery = query(
            collection(db, "users"),
            where("userID", "==", agentId),
          );
          const usersSnap = await getDocs(usersQuery);
          if (!usersSnap.empty) {
            const agentDocId = usersSnap.docs[0].id;
            await setDoc(
              doc(db, "users", agentDocId),
              { banned: true },
              { merge: true },
            );
          }
        }
      }

      setReportSuccess("Report submitted successfully!");
      setTimeout(() => {
        setShowReportModal(false);
        setReportSuccess("");
      }, 1500);
    } catch (err) {
      console.error("Report submit error:", err);
      setReportSuccess("Failed to submit report. Try again.");
    } finally {
      setReportLoading(false);
    }
  };

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
                    className="relative rounded-xl bg-white p-6 shadow dark:bg-gray-800"
                  >
                    {/* Report Icon */}
                    <button
                      className="absolute top-4 right-4 z-10 flex h-10 w-10 items-center justify-center rounded-full border-2 border-red-400 bg-white shadow-lg transition-all duration-200 hover:bg-red-100"
                      title="Report this property"
                      onClick={() => handleReport(property)}
                    >
                      <FlagIcon className="h-6 w-6 text-red-500" />
                    </button>
                    <Link href={`/property/${property.id}`}>
                      <img
                        src={
                          property.image1 || "/images/property-placeholder.png"
                        }
                        alt={property.title}
                        className="mb-4 h-40 w-full rounded-lg object-cover"
                      />
                      <h2 className="mb-2 text-xl font-semibold text-gray-900 dark:text-white">
                        {property.title}
                      </h2>
                      <p className="mb-1 text-gray-600 dark:text-gray-300">
                        {property.address}
                      </p>
                      <div className="mb-2 flex flex-wrap gap-2">
                        <span className="inline-block rounded bg-blue-100 px-3 py-1 text-xs font-semibold text-blue-800 dark:bg-blue-900 dark:text-blue-200">
                          {property.type}
                        </span>
                        <span className="inline-block rounded bg-green-100 px-3 py-1 text-xs font-semibold text-green-800 dark:bg-green-900 dark:text-green-200">
                          RM {property.price?.toLocaleString()}
                        </span>
                        <span
                          className={`inline-block rounded px-3 py-1 text-xs font-semibold ${getStatusColor(property.status)}`}
                        >
                          {property.status}
                        </span>
                      </div>
                    </Link>
                  </div>
                ))}
              </div>
            )}
            {/* Report Modal */}
            {showReportModal && (
              <div className="bg-opacity-50 fixed inset-0 z-50 flex items-center justify-center bg-black">
                <div className="w-full max-w-md rounded-lg bg-white p-6 shadow-lg dark:bg-gray-800">
                  <h3 className="mb-4 text-lg font-semibold text-gray-900 dark:text-white">
                    Report Property
                  </h3>
                  <div className="mb-4">
                    <label className="mb-2 block text-sm font-medium text-gray-700 dark:text-gray-300">
                      Reason
                    </label>
                    <select
                      className="w-full rounded border border-gray-300 px-3 py-2 dark:border-gray-600 dark:bg-gray-700 dark:text-white"
                      value={reportReason}
                      onChange={(e) => setReportReason(e.target.value)}
                    >
                      <option value="">Select a reason</option>
                      {REPORT_REASONS.map((reason) => (
                        <option key={reason} value={reason}>
                          {reason}
                        </option>
                      ))}
                    </select>
                  </div>
                  <div className="mb-4">
                    <label className="mb-2 block text-sm font-medium text-gray-700 dark:text-gray-300">
                      Description (optional)
                    </label>
                    <textarea
                      className="w-full rounded border border-gray-300 px-3 py-2 dark:border-gray-600 dark:bg-gray-700 dark:text-white"
                      rows={3}
                      value={reportDesc}
                      onChange={(e) => setReportDesc(e.target.value)}
                      placeholder="Describe the issue..."
                    />
                  </div>
                  {reportSuccess && (
                    <div className="mb-2 text-green-600 dark:text-green-400">
                      {reportSuccess}
                    </div>
                  )}
                  <div className="flex justify-end gap-2">
                    <button
                      className="rounded bg-gray-200 px-4 py-2 text-gray-700 hover:bg-gray-300 dark:bg-gray-700 dark:text-gray-200 dark:hover:bg-gray-600"
                      onClick={() => setShowReportModal(false)}
                      disabled={reportLoading}
                    >
                      Cancel
                    </button>
                    <button
                      className="rounded bg-red-500 px-4 py-2 text-white hover:bg-red-600 disabled:opacity-50"
                      onClick={handleSubmitReport}
                      disabled={reportLoading || !reportReason}
                    >
                      {reportLoading ? "Submitting..." : "Submit Report"}
                    </button>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </>
  );
}
