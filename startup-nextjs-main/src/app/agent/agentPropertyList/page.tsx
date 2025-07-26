"use client";

import React, { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import AgentHeader from "@/components/Agent/agentHeader";
import PropertyChat from "@/components/Chat/PropertyChat";
import { FaComments } from "react-icons/fa";
import { db, auth } from "@/lib/firebase";
import {
  collection,
  getDocs,
  query,
  where,
  orderBy,
  addDoc,
  setDoc,
  doc,
} from "firebase/firestore";
import { serverTimestamp } from "firebase/firestore";

interface Property {
  id: string;
  title: string;
  address: string;
  price: number;
  type: string;
  status: "pending" | "verified" | "rejected";
  image1?: string;
  agentUID?: string;
  agentId?: string;
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

function ChatUserListModal({ propertyId, agentUID, onClose }) {
  const [userChats, setUserChats] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedUser, setSelectedUser] = useState(null);
  const [showChat, setShowChat] = useState(false);
  const [agentData, setAgentData] = useState(null);

  // Fetch agent data
  useEffect(() => {
    const fetchAgentData = async () => {
      try {
        const currentUser = auth.currentUser;
        if (currentUser) {
          console.log("Fetching agent data for email:", currentUser.email);
          const usersRef = collection(db, "users");
          const q = query(usersRef, where("email", "==", currentUser.email));
          const querySnapshot = await getDocs(q);

          console.log(
            "Agent query result:",
            querySnapshot.size,
            "documents found",
          );

          if (!querySnapshot.empty) {
            const agentDoc = querySnapshot.docs[0];
            const agentData = agentDoc.data();
            console.log("Found agent data:", agentData);

            const finalAgentData = {
              agentID:
                agentData.userID ||
                agentData.userId ||
                currentUser.uid ||
                `UID${Math.floor(Math.random() * 1000)}`,
              agentName:
                agentData.username ||
                agentData.name ||
                currentUser.displayName ||
                "Agent",
            };

            console.log("Setting agent data:", finalAgentData);
            setAgentData(finalAgentData);
          } else {
            console.log("Agent not found in Firestore, using fallback");
            const fallbackAgentData = {
              agentID:
                currentUser.uid || `UID${Math.floor(Math.random() * 1000)}`,
              agentName: currentUser.displayName || "Agent",
            };
            console.log("Fallback agent data:", fallbackAgentData);
            setAgentData(fallbackAgentData);
          }
        } else {
          console.log("No current agent user found");
        }
      } catch (error) {
        console.error("Error fetching agent data:", error);
        const currentUser = auth.currentUser;
        if (currentUser) {
          const errorFallbackData = {
            agentID:
              currentUser.uid || `UID${Math.floor(Math.random() * 1000)}`,
            agentName: currentUser.displayName || "Agent",
          };
          console.log("Error fallback agent data:", errorFallbackData);
          setAgentData(errorFallbackData);
        }
      }
    };

    fetchAgentData();
  }, []);

  useEffect(() => {
    async function fetchChats() {
      setLoading(true);
      try {
        // Find all chats for this property and agent
        const q = query(
          collection(db, "chats"),
          where("propertyId", "==", propertyId),
          where("agentUID", "==", agentUID),
        );
        const snapshot = await getDocs(q);
        const chats = await Promise.all(
          snapshot.docs.map(async (docSnap) => {
            const chat = docSnap.data();
            // Count unread messages for this chat
            const msgQ = query(
              collection(db, "chats", docSnap.id, "messages"),
              where("moderationStatus", "==", "approved"),
              where("readByAgent", "==", false),
            );
            const msgSnap = await getDocs(msgQ);
            return {
              ...chat,
              chatId: docSnap.id,
              unread: msgSnap.size,
            };
          }),
        );
        setUserChats(chats);
      } catch (error) {
        console.error("Error fetching chats:", error);
      } finally {
        setLoading(false);
      }
    }
    fetchChats();
  }, [propertyId, agentUID, showChat]);

  // Function to create a new chat if it doesn't exist
  const createNewChat = async (userUID, userID) => {
    try {
      if (!agentData) {
        console.error("Agent data not available");
        return null;
      }

      console.log("Creating new chat with agent data:", agentData);
      console.log("User UID:", userUID);
      console.log("User ID:", userID);
      console.log("Property ID:", propertyId);
      console.log("Agent UID:", agentUID);

      // Generate next chat ID
      const querySnapshot = await getDocs(collection(db, "chats"));
      let maxId = 0;
      querySnapshot.forEach((doc) => {
        const data = doc.data();
        const idStr = (data.chatId || doc.id || "").replace("CHAT", "");
        const idNum = parseInt(idStr, 10);
        if (!isNaN(idNum) && idNum > maxId) maxId = idNum;
      });
      const nextChatId = `CHAT${String(maxId + 1).padStart(3, "0")}`;

      console.log("Generated chat ID:", nextChatId);

      // Create new chat with all required fields
      const chatData = {
        chatId: nextChatId,
        propertyId,
        agentID: agentData.agentID,
        agentUID,
        userID,
        userUID,
        createdAt: serverTimestamp(),
      };

      console.log("Creating chat with data:", chatData);

      await setDoc(doc(db, "chats", nextChatId), chatData);
      console.log("Chat created successfully");
      return nextChatId;
    } catch (error) {
      console.error("Error creating chat:", error);
      console.error("Agent data:", agentData);
      console.error("User UID:", userUID);
      console.error("User ID:", userID);
      console.error("Property ID:", propertyId);
      console.error("Agent UID:", agentUID);
      return null;
    }
  };

  const handleOpenChat = async (chat) => {
    if (!chat.chatId) {
      // If no chat exists, create one
      const newChatId = await createNewChat(chat.userUID, chat.userID);
      if (newChatId) {
        chat.chatId = newChatId;
      }
    }
    setSelectedUser(chat);
    setShowChat(true);
  };

  if (loading)
    return (
      <div className="bg-opacity-50 fixed inset-0 z-50 flex items-center justify-center bg-black">
        <div className="rounded-lg bg-white p-6 dark:bg-gray-800">
          Loading...
        </div>
      </div>
    );

  return (
    <div className="bg-opacity-50 fixed inset-0 z-50 flex items-center justify-center bg-black">
      <div className="w-full max-w-lg rounded-lg bg-white p-6 dark:bg-gray-800">
        <div className="mb-4 flex items-center justify-between">
          <h2 className="text-lg font-semibold text-gray-900 dark:text-white">
            Chats for this Property
          </h2>
          <button
            onClick={onClose}
            className="text-gray-500 hover:text-gray-700"
          >
            ✕
          </button>
        </div>
        {userChats.length === 0 ? (
          <div className="text-gray-600 dark:text-gray-300">
            No user chats yet.
          </div>
        ) : (
          <ul className="divide-y divide-gray-200 dark:divide-gray-700">
            {userChats.map((chat) => (
              <li
                key={chat.chatId}
                className="flex items-center justify-between py-3"
              >
                <div>
                  <div className="font-medium text-gray-900 dark:text-white">
                    User ID: {chat.userID || chat.userUid}
                  </div>
                  <div className="text-xs text-gray-500">
                    Chat ID: {chat.chatId}
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  {chat.unread > 0 && (
                    <span className="inline-flex h-5 w-5 items-center justify-center rounded-full bg-red-600 text-xs text-white">
                      {chat.unread}
                    </span>
                  )}
                  <button
                    className="rounded bg-blue-500 px-3 py-1 text-white hover:bg-blue-600"
                    onClick={() => handleOpenChat(chat)}
                  >
                    Open Chat
                  </button>
                </div>
              </li>
            ))}
          </ul>
        )}
        {showChat && selectedUser && agentData ? (
          <PropertyChat
            propertyId={propertyId}
            agentUID={agentUID}
            agentID={agentData.agentID}
            userUID={selectedUser.userUID}
            userID={selectedUser.userID}
            chatId={selectedUser.chatId}
            onClose={() => {
              setShowChat(false);
              setSelectedUser(null);
            }}
          />
        ) : showChat && selectedUser && !agentData ? (
          <div className="bg-opacity-50 fixed inset-0 z-50 flex items-center justify-center bg-black">
            <div className="rounded-lg bg-white p-6 dark:bg-gray-800">
              <p className="text-center text-gray-600 dark:text-gray-300">
                Loading agent data...
              </p>
              <button
                onClick={() => {
                  setShowChat(false);
                  setSelectedUser(null);
                }}
                className="mt-4 w-full rounded bg-blue-500 px-4 py-2 text-white hover:bg-blue-600"
              >
                Close
              </button>
            </div>
          </div>
        ) : null}
      </div>
    </div>
  );
}

export default function AgentPropertyList() {
  const [properties, setProperties] = useState<Property[]>([]);
  const [loading, setLoading] = useState(true);
  const router = useRouter();
  const [showUserList, setShowUserList] = useState<string | null>(null);

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
            agentUID: data.agentUID || "",
            agentId: data.agentId || "",
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
                      <div className="mt-auto space-y-2">
                        <div className="flex gap-2">
                          <button
                            onClick={() =>
                              router.push(
                                `/agent/agentPropertyDetails?id=${property.id}`,
                              )
                            }
                            className="flex-1 rounded bg-blue-500 px-4 py-2 text-sm text-white shadow hover:bg-blue-600"
                          >
                            View Details
                          </button>
                          <button
                            onClick={() =>
                              router.push("/agent/agentDocumentUpload")
                            }
                            className="flex-1 rounded bg-green-500 px-4 py-2 text-sm text-white shadow hover:bg-green-600"
                          >
                            Upload Document
                          </button>
                        </div>
                        <div className="flex items-center gap-2">
                          <button
                            className="relative flex items-center justify-center rounded-full bg-gray-200 p-2 hover:bg-blue-100 dark:bg-gray-700 dark:hover:bg-blue-900"
                            title="View User Chats"
                            onClick={() => setShowUserList(property.id)}
                          >
                            <FaComments className="h-5 w-5 text-blue-600" />
                            {/* Notification badge logic: if any user chat for this property has unread messages, show red dot */}
                            {/* This will be implemented with state, for now just placeholder */}
                            {/* <span className="absolute -top-1 -right-1 h-3 w-3 rounded-full bg-red-600"></span> */}
                          </button>
                          {showUserList === property.id && (
                            <ChatUserListModal
                              propertyId={property.id}
                              agentUID={property.agentUID || ""}
                              onClose={() => setShowUserList(null)}
                            />
                          )}
                        </div>
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
