"use client";
import React, { useState, useEffect } from "react";
import { auth, db } from "@/lib/firebase";
import {
  collection,
  query,
  where,
  getDocs,
  orderBy,
  onSnapshot,
} from "firebase/firestore";
import AgentHeader from "@/components/Agent/agentHeader";
import PropertyChat from "@/components/Chat/PropertyChat";

type Chat = {
  id: string;
  chatId: string;
  propertyId: string;
  agentUID: string;
  agentID: string;
  participants: Array<{
    userID: string;
    userUID: string;
    username: string;
    joinedAt: any;
  }>;
  createdAt: any;
  lastMessage?: {
    content: string;
    timestamp: any;
    senderName: string;
  };
};

export default function AgentDashboard() {
  const [chats, setChats] = useState<Chat[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedChat, setSelectedChat] = useState<Chat | null>(null);
  const [currentUser, setCurrentUser] = useState<any>(null);

  useEffect(() => {
    const user = auth.currentUser;
    if (user) {
      setCurrentUser(user);
      fetchChats(user.uid);
    }
  }, []);

  const fetchChats = async (agentUID: string) => {
    try {
      const chatsRef = collection(db, "chats");
      const q = query(
        chatsRef,
        where("agentUID", "==", agentUID),
        orderBy("createdAt", "desc")
      );

      const unsubscribe = onSnapshot(q, async (snapshot) => {
        const chatsData = await Promise.all(
          snapshot.docs.map(async (doc) => {
            const data = doc.data();
            
            // Get the last message for this chat
            const messagesRef = collection(db, "chats", doc.id, "messages");
            const messagesQuery = query(messagesRef, orderBy("timestamp", "desc"));
            const messagesSnap = await getDocs(messagesQuery);
            
            let lastMessage = null;
            if (!messagesSnap.empty) {
              const lastMsgData = messagesSnap.docs[0].data();
              lastMessage = {
                content: lastMsgData.content,
                timestamp: lastMsgData.timestamp,
                senderName: lastMsgData.senderName
              };
            }

            return {
              id: doc.id,
              ...data,
              lastMessage
            } as Chat;
          })
        );
        
        setChats(chatsData);
        setLoading(false);
      });

      return unsubscribe;
    } catch (error) {
      console.error("Error fetching chats:", error);
      setLoading(false);
    }
  };

  const formatTime = (timestamp: any) => {
    if (!timestamp) return "Just now";
    const date = timestamp.toDate ? timestamp.toDate() : new Date(timestamp);
    return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  };

  const formatDate = (timestamp: any) => {
    if (!timestamp) return "";
    const date = timestamp.toDate ? timestamp.toDate() : new Date(timestamp);
    return date.toLocaleDateString();
  };

  if (loading) {
    return (
      <>
        <AgentHeader />
        <div className="min-h-screen bg-white dark:bg-[#181c23] p-8">
          <div className="text-center text-gray-500 dark:text-white">Loading chats...</div>
        </div>
      </>
    );
  }

  return (
    <>
      <AgentHeader />
      <div className="min-h-screen bg-white dark:bg-[#181c23] p-8">
        <div className="mx-auto max-w-6xl">
          <h1 className="mb-8 text-center text-4xl font-extrabold tracking-tight text-gray-900 dark:text-white drop-shadow-lg">
            Agent Dashboard
          </h1>

          <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
            {/* Chat List */}
            <div className="lg:col-span-1">
              <div className="rounded-lg bg-white p-6 shadow-lg dark:bg-gray-800">
                <h2 className="mb-4 text-xl font-semibold text-gray-900 dark:text-white">
                  Active Chats ({chats.length})
                </h2>
                
                {chats.length === 0 ? (
                  <p className="text-center text-gray-500 dark:text-gray-400">
                    No active chats yet.
                  </p>
                ) : (
                  <div className="space-y-3">
                    {chats.map((chat) => (
                      <div
                        key={chat.id}
                        onClick={() => setSelectedChat(chat)}
                        className={`cursor-pointer rounded-lg border p-4 transition-colors hover:bg-gray-50 dark:hover:bg-gray-700 ${
                          selectedChat?.id === chat.id
                            ? "border-blue-500 bg-blue-50 dark:bg-blue-900/20"
                            : "border-gray-200 dark:border-gray-600"
                        }`}
                      >
                        <div className="flex items-center justify-between">
                          <div className="flex-1">
                            <h3 className="font-medium text-gray-900 dark:text-white">
                              Property Chat
                            </h3>
                            <p className="text-sm text-gray-500 dark:text-gray-400">
                              {chat.participants?.length || 0} participants
                            </p>
                            {chat.lastMessage && (
                              <p className="mt-1 text-sm text-gray-600 dark:text-gray-300">
                                <span className="font-medium">{chat.lastMessage.senderName}:</span>{" "}
                                {chat.lastMessage.content.substring(0, 50)}
                                {chat.lastMessage.content.length > 50 ? "..." : ""}
                              </p>
                            )}
                          </div>
                          <div className="text-right text-xs text-gray-500 dark:text-gray-400">
                            {chat.lastMessage && formatTime(chat.lastMessage.timestamp)}
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>

            {/* Chat Window */}
            <div className="lg:col-span-2">
              {selectedChat ? (
                <div className="rounded-lg bg-white p-6 shadow-lg dark:bg-gray-800">
                  <div className="mb-4 flex items-center justify-between">
                    <h2 className="text-xl font-semibold text-gray-900 dark:text-white">
                      Chat - Property {selectedChat.propertyId}
                    </h2>
                    <button
                      onClick={() => setSelectedChat(null)}
                      className="rounded bg-gray-300 px-3 py-1 text-sm text-gray-700 hover:bg-gray-400 dark:bg-gray-600 dark:text-gray-200 dark:hover:bg-gray-500"
                    >
                      Close
                    </button>
                  </div>
                  
                  <PropertyChat
                    propertyId={selectedChat.propertyId}
                    agentUID={selectedChat.agentUID}
                    agentID={selectedChat.agentID}
                    chatId={selectedChat.id}
                    onClose={() => setSelectedChat(null)}
                  />
                </div>
              ) : (
                <div className="flex h-96 items-center justify-center rounded-lg bg-white p-6 shadow-lg dark:bg-gray-800">
                  <p className="text-center text-gray-500 dark:text-gray-400">
                    Select a chat from the list to start messaging.
                  </p>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
