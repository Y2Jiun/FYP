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
  getDoc,
  onSnapshot,
  updateDoc,
  arrayUnion,
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

function ChatUserListModal({
  propertyId,
  agentUID,
  onClose,
  refreshUnreadCount,
}) {
  const [userChats, setUserChats] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedUser, setSelectedUser] = useState(null);
  const [showChat, setShowChat] = useState(false);
  const [agentData, setAgentData] = useState(null);
  const [activeTab, setActiveTab] = useState(null);

  // Mark all messages in a chat as read for the current agent
  const markChatMessagesAsRead = async (chatId) => {
    const currentUser = auth.currentUser;
    if (!currentUser) return;

    try {
      console.log("Marking messages as read for chat:", chatId);
      const messagesQuery = query(
        collection(db, "chats", chatId, "messages"),
        where("moderationStatus", "==", "approved"),
      );
      const snapshot = await getDocs(messagesQuery);

      const updatePromises = snapshot.docs.map(async (docSnap) => {
        const data = docSnap.data();
        if (!data.readBy || !data.readBy.includes(currentUser.uid)) {
          await updateDoc(docSnap.ref, {
            readBy: arrayUnion(currentUser.uid),
          });
        }
      });

      await Promise.all(updatePromises);
      console.log(`Marked ${snapshot.docs.length} messages as read for agent`);
    } catch (error) {
      console.error("Error marking messages as read:", error);
    }
  };

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
        const currentUser = auth.currentUser;
        if (!currentUser) {
          console.log("❌ No current user found for chat fetching");
          return;
        }

        console.log("🔍 DEBUGGING CHAT FETCHING:");
        console.log("📍 Current agent UID:", currentUser.uid);
        console.log("📍 Property ID:", propertyId);
        console.log("📍 Property agentUID:", agentUID);

        // STEP 1: Check ALL chats in the database
        console.log("📊 STEP 1: Checking ALL chats in database...");
        const allChatsInDB = await getDocs(collection(db, "chats"));
        console.log("📊 Total chats in database:", allChatsInDB.docs.length);
        allChatsInDB.docs.forEach((doc, index) => {
          const data = doc.data();
          console.log(`📊 Chat ${index + 1} (${doc.id}):`, {
            propertyId: data.propertyId,
            agentUID: data.agentUID,
            userUID: data.userUID,
            userID: data.userID,
          });
        });

        // STEP 2: Check ALL chats for this specific property
        console.log("📊 STEP 2: Checking ALL chats for this property...");
        const allChatsQuery = query(
          collection(db, "chats"),
          where("propertyId", "==", propertyId),
        );
        const allChatsSnapshot = await getDocs(allChatsQuery);
        console.log(
          "📊 All chats for this property:",
          allChatsSnapshot.docs.length,
        );
        allChatsSnapshot.docs.forEach((doc, index) => {
          const data = doc.data();
          console.log(`📊 Property Chat ${index + 1} (${doc.id}):`, {
            propertyId: data.propertyId,
            agentUID: data.agentUID,
            userUID: data.userUID,
            userID: data.userID,
            chatId: data.chatId,
          });
        });

        // STEP 3: Check chats for this property and current agent
        console.log(
          "📊 STEP 3: Checking chats for property + current agent...",
        );

        // Now that ChatButton creates unique chats, we can filter by current agent
        const q = query(
          collection(db, "chats"),
          where("propertyId", "==", propertyId),
          where("agentUID", "==", currentUser.uid),
        );
        const snapshot = await getDocs(q);

        console.log(
          "📊 Found",
          snapshot.docs.length,
          "chats for this property and current agent",
        );
        snapshot.docs.forEach((doc, index) => {
          const data = doc.data();
          console.log(`📊 Agent Chat ${index + 1} (${doc.id}):`, data);
        });

        const chats = await Promise.all(
          snapshot.docs.map(async (docSnap) => {
            const chat = docSnap.data();
            console.log("📊 Processing chat:", chat);

            // Count unread messages for this chat
            const msgQ = query(
              collection(db, "chats", docSnap.id, "messages"),
              where("moderationStatus", "==", "approved"),
            );
            const msgSnap = await getDocs(msgQ);

            // Count messages where current agent's UID is not in readBy array
            const unreadCount = msgSnap.docs.filter((doc) => {
              const messageData = doc.data();
              const readBy = messageData.readBy || [];
              return !readBy.includes(currentUser.uid);
            }).length;

            return {
              ...chat,
              chatId: docSnap.id,
              unread: unreadCount,
            };
          }),
        );

        console.log("📊 Final processed chats:", chats);
        setUserChats(chats);

        // Set first chat as active if available and no active tab is set
        if (chats.length > 0 && !activeTab) {
          console.log("📊 Setting first chat as active:", chats[0].chatId);
          setActiveTab(chats[0].chatId);
          setSelectedUser(chats[0]);
        }
      } catch (error) {
        console.error("❌ Error fetching chats:", error);
      } finally {
        setLoading(false);
      }
    }
    fetchChats();
  }, [propertyId, agentUID]); // Removed activeTab from dependencies

  // Function to create a new chat if it doesn't exist
  const createNewChat = async (userUID, userID) => {
    try {
      console.log("🔧 CREATING NEW CHAT:");
      console.log("📍 User UID:", userUID);
      console.log("📍 User ID:", userID);
      console.log("📍 Property ID:", propertyId);

      if (!agentData) {
        console.error("❌ Agent data not available");
        return null;
      }

      const currentUser = auth.currentUser;
      if (!currentUser) {
        console.error("❌ No current user found for chat creation");
        return null;
      }

      console.log("📍 Current Agent UID:", currentUser.uid);
      console.log("📍 Agent Data:", agentData);

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

      console.log("📍 Generated chat ID:", nextChatId);

      // Create new chat with all required fields
      const chatData = {
        chatId: nextChatId,
        propertyId,
        agentID: agentData.agentID,
        agentUID: currentUser.uid, // Use current agent's UID
        userID,
        userUID,
        createdAt: serverTimestamp(),
      };

      console.log("📍 Creating chat with data:", chatData);

      await setDoc(doc(db, "chats", nextChatId), chatData);
      console.log("✅ Chat created successfully with ID:", nextChatId);

      // Verify the chat was created correctly
      const verifyDoc = await getDoc(doc(db, "chats", nextChatId));
      console.log(
        "📍 Verification - Chat data after creation:",
        verifyDoc.data(),
      );

      return nextChatId;
    } catch (error) {
      console.error("❌ Error creating chat:", error);
      console.error("📍 Agent data:", agentData);
      console.error("📍 User UID:", userUID);
      console.error("📍 User ID:", userID);
      console.error("📍 Property ID:", propertyId);
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
    setActiveTab(chat.chatId);
    setShowChat(true);
    await markChatMessagesAsRead(chat.chatId); // Mark messages as read when opening chat
    refreshUnreadCount(propertyId); // Refresh unread count after marking as read
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
      <div className="flex h-3/4 w-full max-w-4xl flex-col rounded-lg bg-white dark:bg-gray-800">
        <div className="flex items-center justify-between border-b border-gray-200 p-4 dark:border-gray-700">
          <h2 className="text-lg font-semibold text-gray-900 dark:text-white">
            Property Chat Management
          </h2>
          <button
            onClick={onClose}
            className="text-gray-500 hover:text-gray-700"
          >
            ✕
          </button>
        </div>

        <div className="flex flex-1 overflow-hidden">
          {/* Left Sidebar - User List */}
          <div className="w-1/3 overflow-y-auto border-r border-gray-200 dark:border-gray-700">
            <div className="p-4">
              <div className="mb-3 flex items-center justify-between">
                <h3 className="text-sm font-medium text-gray-700 dark:text-gray-300">
                  User Chats ({userChats.length})
                </h3>
                <button
                  onClick={() => {
                    console.log("🔄 MANUAL REFRESH TRIGGERED");
                    setLoading(true);
                    // Force refresh by clearing and refetching
                    setUserChats([]);
                    setActiveTab(null);
                    setSelectedUser(null);
                    // The useEffect will automatically refetch
                  }}
                  className="rounded p-1 text-gray-500 hover:bg-gray-100 dark:hover:bg-gray-600"
                  title="Refresh chats"
                >
                  🔄
                </button>
                <button
                  onClick={async () => {
                    console.log("🔍 MANUAL CHECK ALL CHATS");
                    try {
                      const allChats = await getDocs(collection(db, "chats"));
                      console.log(
                        "🔍 ALL CHATS IN DATABASE:",
                        allChats.docs.length,
                      );
                      allChats.docs.forEach((doc, index) => {
                        const data = doc.data();
                        console.log(`🔍 Chat ${index + 1}:`, {
                          id: doc.id,
                          propertyId: data.propertyId,
                          agentUID: data.agentUID,
                          userUID: data.userUID,
                          userID: data.userID,
                        });
                      });
                      alert(
                        `Found ${allChats.docs.length} total chats in database. Check console for details.`,
                      );
                    } catch (error) {
                      console.error("Error checking chats:", error);
                    }
                  }}
                  className="rounded p-1 text-blue-500 hover:bg-blue-100 dark:hover:bg-blue-600"
                  title="Check all chats"
                >
                  🔍
                </button>
              </div>
              {userChats.length === 0 ? (
                <div className="text-sm text-gray-600 dark:text-gray-300">
                  {loading ? "Loading chats..." : "No user chats yet."}
                </div>
              ) : (
                <div className="space-y-2">
                  {userChats.map((chat) => (
                    <div
                      key={chat.chatId}
                      className={`cursor-pointer rounded-lg p-3 transition-colors ${
                        activeTab === chat.chatId
                          ? "border border-blue-300 bg-blue-100 dark:border-blue-600 dark:bg-blue-900"
                          : "bg-gray-50 hover:bg-gray-100 dark:bg-gray-700 dark:hover:bg-gray-600"
                      }`}
                      onClick={() => handleOpenChat(chat)}
                    >
                      <div className="flex items-center justify-between">
                        <div className="flex-1">
                          <div className="text-sm font-medium text-gray-900 dark:text-white">
                            User: {chat.userID || chat.userUid || "Unknown"}
                          </div>
                          <div className="text-xs text-gray-500 dark:text-gray-400">
                            Chat ID: {chat.chatId}
                          </div>
                          <div className="text-xs text-gray-500 dark:text-gray-400">
                            User UID: {chat.userUID || "Unknown"}
                          </div>
                        </div>
                        {chat.unread > 0 && (
                          <span className="inline-flex h-5 w-5 items-center justify-center rounded-full bg-red-600 text-xs text-white">
                            {chat.unread}
                          </span>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* Right Side - Chat Window */}
          <div className="flex flex-1 flex-col">
            {showChat && selectedUser && agentData ? (
              <PropertyChat
                propertyId={propertyId}
                agentUID={auth.currentUser?.uid || ""}
                agentID={agentData.agentID}
                userUID={selectedUser.userUID}
                userID={selectedUser.userID}
                chatId={selectedUser.chatId}
                onClose={() => {
                  setShowChat(false);
                  setSelectedUser(null);
                  setActiveTab(null);
                  // Refresh unread count when chat is closed
                  refreshUnreadCount(propertyId);
                }}
              />
            ) : (
              <div className="flex flex-1 items-center justify-center">
                <div className="text-center">
                  <div className="mb-4 text-6xl text-gray-400 dark:text-gray-500">
                    💬
                  </div>
                  <h3 className="mb-2 text-lg font-medium text-gray-900 dark:text-white">
                    Select a User Chat
                  </h3>
                  <p className="text-gray-600 dark:text-gray-400">
                    Choose a user from the list to start messaging
                  </p>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

export default function AgentPropertyList() {
  const [properties, setProperties] = useState<Property[]>([]);
  const [loading, setLoading] = useState(true);
  const router = useRouter();
  const [showUserList, setShowUserList] = useState<string | null>(null);
  const [propertyUnreadCounts, setPropertyUnreadCounts] = useState<{
    [key: string]: number;
  }>({});

  // Function to refresh unread counts for a specific property
  const refreshUnreadCount = async (propertyId: string) => {
    const currentUser = auth.currentUser;
    if (!currentUser) return;

    try {
      // Get all chats for this property and current agent
      const chatsQuery = query(
        collection(db, "chats"),
        where("propertyId", "==", propertyId),
        where("agentUID", "==", currentUser.uid),
      );
      const chatsSnapshot = await getDocs(chatsQuery);

      let totalUnread = 0;
      for (const chatDoc of chatsSnapshot.docs) {
        // Get all messages in this chat
        const messagesQuery = query(
          collection(db, "chats", chatDoc.id, "messages"),
          where("moderationStatus", "==", "approved"),
        );
        const messagesSnapshot = await getDocs(messagesQuery);

        // Count unread messages
        const unreadInChat = messagesSnapshot.docs.filter((doc) => {
          const messageData = doc.data();
          const readBy = messageData.readBy || [];
          return !readBy.includes(currentUser.uid);
        }).length;

        totalUnread += unreadInChat;
      }

      setPropertyUnreadCounts((prev) => ({
        ...prev,
        [propertyId]: totalUnread,
      }));
    } catch (error) {
      console.error(
        `Error refreshing unread count for property ${propertyId}:`,
        error,
      );
    }
  };

  useEffect(() => {
    const fetchProperties = async () => {
      setLoading(true);
      try {
        const currentUser = auth.currentUser;
        if (!currentUser) {
          console.log("No current user found");
          setProperties([]);
          setLoading(false);
          return;
        }

        console.log("Fetching properties for agent:", currentUser.uid);

        // Get current agent's user data to find their agentId
        const userQuery = query(
          collection(db, "users"),
          where("firebaseUID", "==", currentUser.uid),
        );
        const userSnapshot = await getDocs(userQuery);

        if (userSnapshot.empty) {
          console.log("Agent user data not found");
          setProperties([]);
          setLoading(false);
          return;
        }

        const userData = userSnapshot.docs[0].data();
        const agentId = userData.userID || userSnapshot.docs[0].id;

        console.log("Agent ID:", agentId);
        console.log("Agent UID:", currentUser.uid);

        // Fetch only properties that belong to this agent
        const q = query(
          collection(db, "properties"),
          where("agentId", "==", agentId),
          where("status", "!=", "rejected"),
        );
        const querySnapshot = await getDocs(q);

        console.log("Found properties for agent:", querySnapshot.docs.length);

        const propertyList: Property[] = querySnapshot.docs
          .map((doc) => {
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
          })
          .filter((property) => property.status !== "rejected");
        setProperties(propertyList);

        // Calculate unread counts for each property
        const unreadCounts: { [key: string]: number } = {};
        for (const property of propertyList) {
          try {
            // Get all chats for this property and current agent
            const currentUser = auth.currentUser;
            if (!currentUser) continue;
            const chatsQuery = query(
              collection(db, "chats"),
              where("propertyId", "==", property.id),
              where("agentUID", "==", currentUser.uid),
            );
            const chatsSnapshot = await getDocs(chatsQuery);

            let totalUnread = 0;
            for (const chatDoc of chatsSnapshot.docs) {
              // Get all messages in this chat
              const messagesQuery = query(
                collection(db, "chats", chatDoc.id, "messages"),
                where("moderationStatus", "==", "approved"),
              );
              const messagesSnapshot = await getDocs(messagesQuery);

              // Count unread messages
              const unreadInChat = messagesSnapshot.docs.filter((doc) => {
                const messageData = doc.data();
                const readBy = messageData.readBy || [];
                return !readBy.includes(currentUser.uid);
              }).length;

              totalUnread += unreadInChat;
            }

            unreadCounts[property.id] = totalUnread;
          } catch (error) {
            unreadCounts[property.id] = 0;
          }
        }
        setPropertyUnreadCounts(unreadCounts);
      } catch (error) {
        console.error("Error fetching properties:", error);
      } finally {
        setLoading(false);
      }
    };
    fetchProperties();
  }, []);

  // Real-time listener for new messages to update unread counts
  useEffect(() => {
    const currentUser = auth.currentUser;
    if (!currentUser || properties.length === 0) return;

    console.log("Setting up real-time message listener for unread counts");

    // Listen to all chats for this agent
    const chatsQuery = query(
      collection(db, "chats"),
      where("agentUID", "==", currentUser.uid),
    );

    const unsubscribe = onSnapshot(
      chatsQuery,
      async (chatsSnapshot) => {
        console.log("Real-time chat update received, updating unread counts");

        // Recalculate unread counts for all properties
        const newUnreadCounts: { [key: string]: number } = {};

        for (const property of properties) {
          try {
            // Get all chats for this property and current agent
            const propertyChatsQuery = query(
              collection(db, "chats"),
              where("propertyId", "==", property.id),
              where("agentUID", "==", currentUser.uid),
            );
            const propertyChatsSnapshot = await getDocs(propertyChatsQuery);

            let totalUnread = 0;
            for (const chatDoc of propertyChatsSnapshot.docs) {
              // Get all messages in this chat
              const messagesQuery = query(
                collection(db, "chats", chatDoc.id, "messages"),
                where("moderationStatus", "==", "approved"),
              );
              const messagesSnapshot = await getDocs(messagesQuery);

              // Count unread messages
              const unreadInChat = messagesSnapshot.docs.filter((doc) => {
                const messageData = doc.data();
                const readBy = messageData.readBy || [];
                return !readBy.includes(currentUser.uid);
              }).length;

              totalUnread += unreadInChat;
            }

            newUnreadCounts[property.id] = totalUnread;
          } catch (error) {
            console.error(
              `Error calculating unread count for property ${property.id}:`,
              error,
            );
            newUnreadCounts[property.id] = 0;
          }
        }

        setPropertyUnreadCounts(newUnreadCounts);
      },
      (error) => {
        console.error("Error in real-time unread count listener:", error);
      },
    );

    return () => unsubscribe();
  }, [properties]);

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
                            onClick={() => {
                              setShowUserList(property.id);
                              // Refresh unread count when opening chat modal
                              refreshUnreadCount(property.id);
                            }}
                          >
                            <FaComments className="h-5 w-5 text-blue-600" />
                            {/* Show unread count badge if there are unread messages */}
                            {propertyUnreadCounts[property.id] > 0 && (
                              <span className="absolute -top-1 -right-1 flex h-5 w-5 items-center justify-center rounded-full bg-red-600 text-xs font-medium text-white">
                                {propertyUnreadCounts[property.id] > 99
                                  ? "99+"
                                  : propertyUnreadCounts[property.id]}
                              </span>
                            )}
                          </button>
                          {showUserList === property.id && (
                            <ChatUserListModal
                              propertyId={property.id}
                              agentUID={property.agentUID || ""}
                              onClose={() => setShowUserList(null)}
                              refreshUnreadCount={refreshUnreadCount}
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
