"use client";
import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import { db, auth } from "@/lib/firebase";
import {
  doc,
  getDoc,
  collection,
  query,
  where,
  getDocs,
  setDoc,
  deleteDoc,
  onSnapshot,
} from "firebase/firestore";
import ChatButton from "@/components/Chat/ChatButton";
import UserHeader from "@/components/User/userHeader";
import { TrustScoreBadge } from "@/components/TrustScore";
import { FiHeart } from "react-icons/fi";

export default function PropertyDetailsPage() {
  const { propertyId } = useParams();
  const [property, setProperty] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [isSaved, setIsSaved] = useState(false);
  const [saving, setSaving] = useState(false);

  // Get current user's real UID
  const userUID = typeof window !== "undefined" ? auth.currentUser?.uid : null;

  useEffect(() => {
    async function fetchProperty() {
      setLoading(true);
      setError("");
      try {
        const docRef = doc(db, "properties", propertyId as string);
        const docSnap = await getDoc(docRef);
        if (docSnap.exists()) {
          setProperty(docSnap.data());
        } else {
          setError("Property not found.");
        }
      } catch (err) {
        setError("Failed to fetch property.");
      }
      setLoading(false);
    }
    if (propertyId) fetchProperty();
  }, [propertyId]);

  // Check if property is saved by current user
  useEffect(() => {
    if (!userUID || !propertyId) return;

    const savedPropertyRef = doc(
      db,
      "savedProperties",
      `${userUID}_${propertyId}`,
    );

    const unsubscribe = onSnapshot(savedPropertyRef, (doc) => {
      setIsSaved(doc.exists());
    });

    return () => unsubscribe();
  }, [userUID, propertyId]);

  const handleSaveProperty = async () => {
    if (!userUID || !propertyId) return;

    setSaving(true);
    try {
      const savedPropertyRef = doc(
        db,
        "savedProperties",
        `${userUID}_${propertyId}`,
      );

      if (isSaved) {
        // Remove from saved properties
        await deleteDoc(savedPropertyRef);
        setIsSaved(false);
      } else {
        // Add to saved properties
        await setDoc(savedPropertyRef, {
          userId: userUID,
          propertyId: propertyId,
          savedAt: new Date(),
          propertyData: {
            title: property.title,
            address: property.address,
            price: property.price,
            image1: property.image1,
            trustScore: property.trustScore,
            trustBadge: property.trustBadge,
          },
        });
        setIsSaved(true);
      }
    } catch (error) {
      console.error("Error saving/unsaving property:", error);
    } finally {
      setSaving(false);
    }
  };

  if (loading) return <div className="p-8 text-center">Loading...</div>;
  if (error) return <div className="p-8 text-center text-red-500">{error}</div>;
  if (!property) return null;

  // Prepare image gallery
  const images = [property.image1, property.image2, property.image3].filter(
    (img) => img && img !== "",
  );
  const placeholder = "/images/property-placeholder.png";

  // Debug: Log property data
  console.log("Property data for chat:", {
    propertyId: propertyId,
    agentUID: property.agentUID,
    agentId: property.agentId,
    agentName: property.agentName,
    fullProperty: property,
  });

  return (
    <>
      <UserHeader />
      <div className="mx-auto max-w-3xl p-4 sm:p-8">
        {!userUID ? (
          <div className="mt-12 text-center">
            <div className="mb-4 text-lg font-semibold text-red-500">
              You must be signed in to chat with the agent.
            </div>
            <a href="/signin">
              <button className="bg-primary hover:bg-primary/90 rounded px-6 py-3 font-semibold text-white transition">
                Sign In
              </button>
            </a>
          </div>
        ) : (
          <div className="flex flex-col gap-6 rounded-xl bg-white p-6 shadow-lg sm:p-10 dark:bg-gray-900">
            {/* Image Gallery */}
            <div className="flex w-full flex-col gap-2">
              <div className="flex w-full justify-center">
                <img
                  src={images[0] || placeholder}
                  alt={property.title}
                  className="max-h-72 w-full rounded-lg border border-gray-200 bg-gray-100 object-cover shadow dark:border-gray-700 dark:bg-gray-800"
                />
              </div>
              {images.length > 1 && (
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

            {/* Property Info */}
            <div className="flex flex-col gap-2">
              <div className="flex items-start justify-between">
                <h1 className="mb-2 text-3xl font-bold text-gray-900 dark:text-white">
                  {property.title}
                </h1>
                {/* Save Property Button */}
                <button
                  onClick={handleSaveProperty}
                  disabled={saving}
                  className={`ml-4 flex items-center gap-2 rounded-lg px-4 py-2 transition-all ${
                    isSaved
                      ? "bg-red-500 text-white hover:bg-red-600"
                      : "bg-gray-100 text-gray-700 hover:bg-gray-200 dark:bg-gray-700 dark:text-gray-300 dark:hover:bg-gray-600"
                  } ${saving ? "cursor-not-allowed opacity-50" : ""}`}
                >
                  <FiHeart
                    className={`h-5 w-5 ${isSaved ? "fill-current" : ""}`}
                  />
                  <span className="text-sm font-medium">
                    {saving ? "..." : isSaved ? "Saved" : "Save"}
                  </span>
                </button>
              </div>
              <p className="mb-1 text-lg text-gray-700 dark:text-gray-200">
                {property.address}, {property.city} {property.postcode}
              </p>
              <div className="mb-1 flex flex-wrap gap-2">
                <span className="inline-block rounded bg-blue-100 px-3 py-1 text-xs font-semibold text-blue-800 dark:bg-blue-900 dark:text-blue-200">
                  {property.propertyType}
                </span>
                <span className="inline-block rounded bg-gray-100 px-3 py-1 text-xs font-semibold text-gray-800 dark:bg-gray-800 dark:text-gray-200">
                  {property.size} sqft
                </span>
                <span className="inline-block rounded bg-green-100 px-3 py-1 text-xs font-semibold text-green-800 dark:bg-green-900 dark:text-green-200">
                  RM {property.price?.toLocaleString()}
                </span>
              </div>
              <div className="mb-1 flex flex-wrap gap-2">
                <span className="inline-block rounded bg-purple-100 px-3 py-1 text-xs font-semibold text-purple-800 dark:bg-purple-900 dark:text-purple-200">
                  Bedrooms: {property.bedrooms}
                </span>
                <span className="inline-block rounded bg-yellow-100 px-3 py-1 text-xs font-semibold text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200">
                  Bathrooms: {property.bathrooms}
                </span>
              </div>
              {/* Trust Score Badge */}
              <div className="mb-2">
                <TrustScoreBadge
                  trustScore={property.trustScore || 0}
                  trustBadge={property.trustBadge || "bronze"}
                  showScore={true}
                  showDescription={true}
                  size="md"
                />
              </div>
              <p className="mb-2 text-gray-600 dark:text-gray-300">
                {property.description}
              </p>
            </div>

            {/* Agent Info Card */}
            <div className="flex flex-col gap-1 rounded-lg bg-gray-100 p-4 shadow-sm dark:bg-gray-800">
              <div className="mb-1 font-semibold text-gray-900 dark:text-white">
                Agent Info
              </div>
              <div className="text-gray-700 dark:text-gray-200">
                Name: {property.agentName}
              </div>
              <div className="text-gray-700 dark:text-gray-200">
                Agent ID: {property.agentId}
              </div>
            </div>

            {/* Chat Button */}
            <div className="flex justify-center">
              <ChatButton
                propertyId={propertyId as string}
                agentUID={property.agentUID || ""}
                agentID={property.agentId || ""}
                className="w-full sm:w-auto"
              />
            </div>
          </div>
        )}
      </div>
    </>
  );
}
