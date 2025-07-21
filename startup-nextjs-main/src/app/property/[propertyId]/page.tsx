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

  return (
    <>
      <UserHeader />
      <div className="mx-auto max-w-3xl p-8">
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
          <>
            <h1 className="mb-4 text-3xl font-bold">{property.title}</h1>
            <p className="mb-2 text-lg">
              {property.address}, {property.city} {property.postcode}
            </p>
            <p className="mb-2">
              Type: {property.propertyType} | Size: {property.size} sqft
            </p>
            <p className="mb-2">Price: RM {property.price?.toLocaleString()}</p>
            <p className="mb-2">
              Bedrooms: {property.bedrooms} | Bathrooms: {property.bathrooms}
            </p>
            <p className="mb-4">Description: {property.description}</p>
            <div className="mb-6 rounded bg-gray-100 p-4 dark:bg-gray-800">
              <div className="font-semibold">Agent Info</div>
              <div>Name: {property.agentName}</div>
              <div>Agent ID: {property.agentId}</div>
            </div>
            <button
              className="bg-primary hover:bg-primary/90 rounded px-6 py-3 font-semibold text-white transition"
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
          </>
        )}
      </div>
    </>
  );
}
