"use client";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { auth, db } from "@/lib/firebase";
import {
  doc,
  getDocs,
  collection,
  query,
  where,
  setDoc,
  serverTimestamp,
} from "firebase/firestore";

export default function AgentLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const router = useRouter();
  const [banned, setBanned] = useState(false);
  const [appealSent, setAppealSent] = useState(false);

  useEffect(() => {
    const checkBan = async () => {
      const user = auth.currentUser;
      if (!user) return;
      const q = query(
        collection(db, "users"),
        where("firebaseUID", "==", user.uid),
      );
      const snap = await getDocs(q);
      if (!snap.empty) {
        const data = snap.docs[0].data();
        if (data.banned === true) {
          setBanned(true);
        }
      }
    };
    checkBan();
  }, []);

  const handleSignOut = () => {
    localStorage.clear();
    router.push("/signin");
  };

  const handleAppeal = async () => {
    const user = auth.currentUser;
    if (!user) return;
    const q = query(
      collection(db, "users"),
      where("firebaseUID", "==", user.uid),
    );
    const snap = await getDocs(q);
    if (!snap.empty) {
      const data = snap.docs[0].data();
      const agentId = data.userID || "";
      const agentUID = user.uid;
      const appealId = `${agentId}_${Date.now()}`;
      await setDoc(doc(db, "banAppeals", appealId), {
        agentId,
        agentUID,
        createdAt: serverTimestamp(),
        status: "pending",
      });
      setAppealSent(true);
    }
  };

  if (banned) {
    return (
      <div className="flex min-h-screen flex-col items-center justify-center bg-[#1a1e26]">
        <div className="rounded-xl bg-white p-8 shadow-xl dark:bg-gray-800">
          <h2 className="mb-4 text-2xl font-bold text-red-600 dark:text-red-400">
            Your account is banned.
          </h2>
          <p className="mb-6 text-gray-700 dark:text-gray-300">
            You cannot access agent features. Please resolve this issue to
            regain access.
          </p>
          {appealSent ? (
            <div className="text-green-600 dark:text-green-400">
              Appeal submitted. Please wait for admin review.
            </div>
          ) : (
            <button
              className="rounded bg-blue-600 px-6 py-2 text-white hover:bg-blue-700"
              onClick={handleAppeal}
            >
              Resolve Issue
            </button>
          )}
          <button
            className="mt-4 rounded bg-gray-300 px-6 py-2 text-gray-800 hover:bg-gray-400"
            onClick={handleSignOut}
          >
            Sign Out
          </button>
        </div>
      </div>
    );
  }

  return <>{children}</>;
}
