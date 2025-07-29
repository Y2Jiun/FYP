"use client";
import React, { useEffect, useState } from "react";
import { db } from "@/lib/firebase";
import {
  collection,
  getDocs,
  query,
  where,
  updateDoc,
  doc,
} from "firebase/firestore";
import AdminHeader from "@/components/Admin/AdminHeader";

function getInitial(name: string) {
  if (!name) return "?";
  return name.charAt(0).toUpperCase();
}

export default function AgentBanAppealsPage() {
  const [appeals, setAppeals] = useState([]);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState("");

  useEffect(() => {
    const fetchAppeals = async () => {
      setLoading(true);
      const q = query(
        collection(db, "banAppeals"),
        where("status", "==", "pending"),
      );
      const snap = await getDocs(q);
      const appealsList = await Promise.all(
        snap.docs.map(async (d) => {
          const data = d.data();
          // Fetch agent info
          let agentInfo = {};
          if (data.agentId) {
            const uq = query(
              collection(db, "users"),
              where("userID", "==", data.agentId),
            );
            const usnap = await getDocs(uq);
            if (!usnap.empty) agentInfo = usnap.docs[0].data();
          }
          return { id: d.id, ...data, agentInfo };
        }),
      );
      setAppeals(appealsList);
      setLoading(false);
    };
    fetchAppeals();
  }, [actionLoading]);

  const handleAccept = async (appeal) => {
    setActionLoading(appeal.id);
    // Unban agent: set banned: false, roles: 2
    const uq = query(
      collection(db, "users"),
      where("userID", "==", appeal.agentId),
    );
    const usnap = await getDocs(uq);
    if (!usnap.empty) {
      const agentDocId = usnap.docs[0].id;
      await updateDoc(doc(db, "users", agentDocId), {
        banned: false,
        roles: 2,
      });
    }
    await updateDoc(doc(db, "banAppeals", appeal.id), { status: "accepted" });
    setActionLoading("");
  };

  const handleReject = async (appeal) => {
    setActionLoading(appeal.id);
    await updateDoc(doc(db, "banAppeals", appeal.id), { status: "rejected" });
    setActionLoading("");
  };

  return (
    <>
      <AdminHeader />
      <div className="min-h-screen bg-white dark:bg-[#181c23] p-8">
        <h1 className="mb-10 text-center text-4xl font-extrabold tracking-tight text-gray-900 dark:text-white drop-shadow-lg">
          Agent Ban Appeals
        </h1>
        {loading ? (
          <div className="text-center text-gray-500 dark:text-white">Loading...</div>
        ) : appeals.length === 0 ? (
          <div className="text-center text-gray-500 dark:text-gray-400">No pending appeals.</div>
        ) : (
          <div className="mx-auto max-w-2xl space-y-8">
            {appeals.map((appeal) => (
              <div
                key={appeal.id}
                className="relative flex flex-col items-center gap-6 rounded-2xl border border-gray-300 dark:border-white/20 bg-white dark:bg-white/10 p-8 shadow-2xl backdrop-blur-md transition-shadow duration-300 hover:shadow-blue-500/20 md:flex-row"
              >
                {/* Avatar */}
                <div className="flex flex-shrink-0 flex-col items-center md:items-start">
                  <div className="mb-2 flex h-16 w-16 items-center justify-center rounded-full bg-gradient-to-br from-blue-500 to-purple-600 text-3xl font-bold text-white shadow-lg">
                    {getInitial(
                      appeal.agentInfo?.username ||
                        appeal.agentInfo?.name ||
                        "A",
                    )}
                  </div>
                  <span className="mb-2 rounded-full bg-yellow-100 dark:bg-yellow-500/20 px-3 py-1 text-xs font-semibold text-yellow-700 dark:text-yellow-400">
                    Pending
                  </span>
                </div>
                {/* Info */}
                <div className="flex-1">
                  <div className="mb-1 text-lg font-bold text-gray-900 dark:text-white">
                    {appeal.agentInfo?.username ||
                      appeal.agentInfo?.name ||
                      "-"}
                  </div>
                  <div className="mb-1 text-sm text-gray-700 dark:text-gray-300">
                    <span className="font-medium">Agent ID:</span>{" "}
                    {appeal.agentId}
                  </div>
                  <div className="mb-1 text-sm text-gray-500 dark:text-gray-400">
                    <span className="font-medium">Email:</span>{" "}
                    {appeal.agentInfo?.email || "-"}
                  </div>
                  <div className="mb-2 text-xs text-gray-400 dark:text-gray-500">
                    Appeal submitted:{" "}
                    {appeal.createdAt?.seconds
                      ? new Date(
                          appeal.createdAt.seconds * 1000,
                        ).toLocaleString()
                      : "-"}
                  </div>
                  <div className="mt-4 flex gap-4">
                    <button
                      className="rounded-lg bg-gradient-to-r from-green-500 to-green-700 px-6 py-2 font-semibold text-white shadow-lg transition-all duration-200 hover:from-green-600 hover:to-green-800 disabled:opacity-50"
                      onClick={() => handleAccept(appeal)}
                      disabled={actionLoading === appeal.id}
                    >
                      Accept
                    </button>
                    <button
                      className="rounded-lg bg-gradient-to-r from-red-500 to-red-700 px-6 py-2 font-semibold text-white shadow-lg transition-all duration-200 hover:from-red-600 hover:to-red-800 disabled:opacity-50"
                      onClick={() => handleReject(appeal)}
                      disabled={actionLoading === appeal.id}
                    >
                      Reject
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </>
  );
}
