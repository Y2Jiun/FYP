"use client";
import React, { useState, useEffect } from "react";
import { db, auth } from "@/lib/firebase";
import {
  collection,
  query,
  where,
  getDocs,
  deleteDoc,
  doc,
  onSnapshot,
} from "firebase/firestore";
import UserHeader from "@/components/User/userHeader";
import { TrustScoreBadge } from "@/components/TrustScore";
import { FiHeart, FiTrash2, FiEye } from "react-icons/fi";
import Link from "next/link";

interface SavedProperty {
  id: string;
  userId: string;
  propertyId: string;
  savedAt: any;
  propertyData: {
    title: string;
    address: string;
    price: number;
    image1?: string;
    trustScore?: number;
    trustBadge?: string;
  };
}

export default function SavedPropertiesPage() {
  const [savedProperties, setSavedProperties] = useState<SavedProperty[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [userUID, setUserUID] = useState<string | null>(null);

  useEffect(() => {
    const user = auth.currentUser;
    if (user) {
      setUserUID(user.uid);
      fetchSavedProperties(user.uid);
    }
  }, []);

  const fetchSavedProperties = (uid: string) => {
    const savedPropertiesQuery = query(
      collection(db, "savedProperties"),
      where("userId", "==", uid),
    );

    const unsubscribe = onSnapshot(
      savedPropertiesQuery,
      (snapshot) => {
        const properties = snapshot.docs.map((doc) => ({
          id: doc.id,
          ...doc.data(),
        })) as SavedProperty[];

        setSavedProperties(properties);
        setLoading(false);
      },
      (error) => {
        console.error("Error fetching saved properties:", error);
        setError("Failed to load saved properties");
        setLoading(false);
      },
    );

    return unsubscribe;
  };

  const handleUnsaveProperty = async (savedPropertyId: string) => {
    try {
      await deleteDoc(doc(db, "savedProperties", savedPropertyId));
    } catch (error) {
      console.error("Error removing saved property:", error);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
        <UserHeader />
        <div className="flex h-64 items-center justify-center">
          <div className="h-12 w-12 animate-spin rounded-full border-b-2 border-blue-500"></div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
        <UserHeader />
        <div className="flex h-64 items-center justify-center">
          <div className="text-center">
            <p className="mb-4 text-red-500 dark:text-red-400">
              Error loading saved properties
            </p>
            <p className="text-sm text-gray-500 dark:text-gray-400">{error}</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <UserHeader />

      <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
            Saved Properties
          </h1>
          <p className="mt-2 text-gray-600 dark:text-gray-400">
            Your favorite properties ({savedProperties.length})
          </p>
        </div>

        {savedProperties.length === 0 ? (
          <div className="py-12 text-center">
            <FiHeart className="mx-auto mb-4 h-16 w-16 text-gray-400" />
            <h3 className="mb-2 text-lg font-medium text-gray-900 dark:text-white">
              No saved properties yet
            </h3>
            <p className="mb-6 text-gray-600 dark:text-gray-400">
              Start browsing properties and save your favorites to see them
              here.
            </p>
            <Link
              href="/user/userPropertyList"
              className="inline-flex items-center rounded-lg bg-blue-600 px-4 py-2 text-white transition hover:bg-blue-700"
            >
              Browse Properties
            </Link>
          </div>
        ) : (
          <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
            {savedProperties.map((savedProperty) => (
              <div
                key={savedProperty.id}
                className="overflow-hidden rounded-lg bg-white shadow-md transition-shadow hover:shadow-lg dark:bg-gray-800"
              >
                {/* Property Image */}
                <div className="relative h-48 bg-gray-200 dark:bg-gray-700">
                  <img
                    src={
                      savedProperty.propertyData.image1 ||
                      "/images/property-placeholder.png"
                    }
                    alt={savedProperty.propertyData.title}
                    className="h-full w-full object-cover"
                  />
                  <div className="absolute top-2 right-2">
                    <TrustScoreBadge
                      trustScore={savedProperty.propertyData.trustScore || 0}
                      trustBadge={
                        savedProperty.propertyData.trustBadge || "bronze"
                      }
                      showScore={false}
                      showDescription={false}
                      size="sm"
                    />
                  </div>
                </div>

                {/* Property Info */}
                <div className="p-4">
                  <h3 className="mb-2 text-lg font-semibold text-gray-900 dark:text-white">
                    {savedProperty.propertyData.title}
                  </h3>
                  <p className="mb-3 text-sm text-gray-600 dark:text-gray-400">
                    {savedProperty.propertyData.address}
                  </p>
                  <div className="mb-4 flex items-center justify-between">
                    <span className="text-xl font-bold text-green-600 dark:text-green-400">
                      RM {savedProperty.propertyData.price?.toLocaleString()}
                    </span>
                    <span className="text-sm text-gray-500 dark:text-gray-400">
                      Saved{" "}
                      {savedProperty.savedAt
                        ?.toDate?.()
                        ?.toLocaleDateString() || "recently"}
                    </span>
                  </div>

                  {/* Action Buttons */}
                  <div className="flex gap-2">
                    <Link
                      href={`/property/${savedProperty.propertyId}`}
                      className="flex flex-1 items-center justify-center gap-2 rounded-lg bg-blue-600 px-3 py-2 text-white transition hover:bg-blue-700"
                    >
                      <FiEye className="h-4 w-4" />
                      View Details
                    </Link>
                    <button
                      onClick={() => handleUnsaveProperty(savedProperty.id)}
                      className="flex items-center justify-center gap-2 rounded-lg bg-red-100 px-3 py-2 text-red-600 transition hover:bg-red-200 dark:bg-red-900 dark:text-red-300 dark:hover:bg-red-800"
                      title="Remove from saved"
                    >
                      <FiTrash2 className="h-4 w-4" />
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
