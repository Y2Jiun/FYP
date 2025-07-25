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
} from "firebase/firestore";
import { getOrCreateChat } from "@/lib/chat";
import ChatWindow from "@/components/Chat/ChatWindow";
import UserHeader from "@/components/User/userHeader";

export default function PropertyDetailsPage() {
  const { propertyId } = useParams();
  const [property, setProperty] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [showChat, setShowChat] = useState(false);
  const [chatId, setChatId] = useState<string | null>(null);

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

  async function handleOpenChat() {
    if (!userUID || !property) return;
    // Pass real UIDs directly to getOrCreateChat
    const chatId = await getOrCreateChat(
      propertyId as string,
      userUID,
      property.agentUID,
    );
    setChatId(chatId);
    setShowChat(true);
  }

  if (loading) return <div className="p-8 text-center">Loading...</div>;
  if (error) return <div className="p-8 text-center text-red-500">{error}</div>;
  if (!property) return null;

  // Prepare image gallery
  const images = [property.image1, property.image2, property.image3].filter(
    (img) => img && img !== "",
  );
  const placeholder = "/images/property-placeholder.png";

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
              <h1 className="mb-2 text-3xl font-bold text-gray-900 dark:text-white">
                {property.title}
              </h1>
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
            <button
              className="bg-primary hover:bg-primary/90 mt-2 w-full rounded px-6 py-3 font-semibold text-white transition"
              onClick={handleOpenChat}
            >
              Chat with Agent
            </button>
            {showChat && chatId && (
              <div className="mt-8">
                <ChatWindow
                  chatId={chatId}
                  userId={userUID}
                  agentId={property.agentUID}
                />
              </div>
            )}
          </div>
        )}
      </div>
    </>
  );
}
