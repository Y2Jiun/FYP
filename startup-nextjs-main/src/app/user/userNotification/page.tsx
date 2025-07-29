"use client";
import React, { useEffect, useState } from "react";
import UserHeader from "@/components/User/userHeader";
import {
  HiOutlineBell,
  HiSpeakerphone,
  HiExclamationCircle,
} from "react-icons/hi";
import { db } from "@/lib/firebase";
import {
  collection,
  query,
  where,
  getDocs,
  orderBy,
  doc,
  updateDoc,
} from "firebase/firestore";

export default function UserNotificationPage() {
  const [notifications, setNotifications] = useState([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [userId, setUserId] = useState("");
  const [firebaseUID, setFirebaseUID] = useState("");

  useEffect(() => {
    const fetchUserInfoAndNotifications = async () => {
      const email = localStorage.getItem("userEmail");
      if (!email) return;
      // Fetch user info
      const q = query(collection(db, "users"), where("email", "==", email));
      const querySnapshot = await getDocs(q);
      if (querySnapshot.empty) return;
      const userData = querySnapshot.docs[0].data();
      const userId = userData.userID;
      const firebaseUID = userData.firebaseUID;
      setUserId(userId);
      setFirebaseUID(firebaseUID);

      // Fetch notifications
      const notifQ = query(
        collection(db, "notification"),
        where("audience", "in", [3, "user"]),
        orderBy("createdAt", "desc"),
      );
      const notifSnapshot = await getDocs(notifQ);
      const notifs = notifSnapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      }));
      setNotifications(notifs);

      // Count unread and mark as read
      let unread = 0;
      for (const notif of notifs) {
        const readBy = notif.readBy || {};
        if (!readBy[userId] && !readBy[firebaseUID]) {
          unread++;
          // Mark as read in Firestore
          const notifRef = doc(db, "notification", notif.id);
          await updateDoc(notifRef, {
            [`readBy.${userId}`]: true,
            [`readBy.${firebaseUID}`]: true,
          });
        }
      }
      setUnreadCount(unread);
    };
    fetchUserInfoAndNotifications();
  }, []);

  return (
    <>
      <UserHeader />
      <div className="flex min-h-screen items-center justify-center bg-white dark:bg-[#181c23]">
        <div className="w-full max-w-2xl rounded-xl border border-gray-300 bg-white p-10 shadow-xl dark:border-gray-700 dark:bg-[#23272f]">
          <div className="mb-8 flex flex-col items-center">
            <div className="mb-3 rounded-full bg-blue-900/80 p-4">
              <HiOutlineBell className="h-10 w-10 text-blue-400" />
            </div>
            <h2 className="mb-1 text-center text-3xl font-extrabold text-gray-900 dark:text-white">
              Notifications
            </h2>
            <p className="text-center text-base text-gray-700 dark:text-gray-300">
              Stay up to date with your property and document activity.
            </p>
          </div>
          <div className="space-y-4">
            {notifications.length === 0 ? (
              <div className="rounded-lg border border-gray-300 bg-gray-100 p-6 text-center text-gray-500 dark:border-gray-700 dark:bg-gray-800 dark:text-gray-400">
                No notifications yet.
              </div>
            ) : (
              notifications.map((notif) => (
                <div
                  key={notif.id}
                  className="flex items-start gap-4 rounded-lg border border-gray-300 bg-gray-100 p-5 shadow-md dark:border-gray-700 dark:bg-gray-800"
                >
                  <div className="mt-1">
                    {notif.type === 3 ? (
                      <HiExclamationCircle className="h-7 w-7 text-red-400" />
                    ) : notif.type === 2 ? (
                      <HiSpeakerphone className="h-7 w-7 text-yellow-400" />
                    ) : notif.type === 1 ? (
                      <HiSpeakerphone className="h-7 w-7 text-purple-400" />
                    ) : (
                      <HiOutlineBell className="h-7 w-7 text-blue-400" />
                    )}
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center gap-2">
                      <div className="font-semibold text-gray-900 dark:text-white">
                        {notif.title}
                      </div>
                      <span
                        className={`rounded px-2 py-1 text-xs font-bold ${
                          notif.type === 3
                            ? "bg-red-500/20 text-red-300"
                            : notif.type === 2
                              ? "bg-yellow-500/20 text-yellow-300"
                              : notif.type === 1
                                ? "bg-purple-500/20 text-purple-300"
                                : "bg-blue-500/20 text-blue-300"
                        }`}
                      >
                        {notif.type === 3
                          ? "Warning"
                          : notif.type === 2
                            ? "Alert"
                            : notif.type === 1
                              ? "Announcement"
                              : "Notification"}
                      </span>
                    </div>
                    <div className="mt-1 text-sm text-gray-700 dark:text-gray-300">
                      {notif.content}
                    </div>
                    <div className="mt-2 text-xs text-gray-500">
                      {notif.createdAt
                        ? new Date(
                            notif.createdAt.seconds
                              ? notif.createdAt.seconds * 1000
                              : notif.createdAt,
                          ).toLocaleString()
                        : ""}
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      </div>
    </>
  );
}
