"use client";
import { useEffect, useState } from "react";
import { db } from "@/lib/firebase";
import { collection, getDocs, doc, getDoc } from "firebase/firestore";
import AdminHeader from "@/components/Admin/AdminHeader";

export default function AdminDashboardPage() {
  const [stats, setStats] = useState([
    { label: "Total Users", value: 0 },
    { label: "Total Agents", value: 0 },
    { label: "Total Properties", value: 0 },
    { label: "Pending Agent Requests", value: 0 },
  ]);
  const [loading, setLoading] = useState(true);
  const [userID, setUserID] = useState("");
  const [username, setUsername] = useState("");

  useEffect(() => {
    const fetchStats = async () => {
      setLoading(true);
      try {
        const usersCol = collection(db, "users");
        const usersSnapshot = await getDocs(usersCol);
        let userCount = 0;
        let agentCount = 0;
        let pendingAgentRequests = 0;
        usersSnapshot.forEach((doc) => {
          const data = doc.data();
          if (data.roles === 3) userCount++;
          if (data.roles === 2) agentCount++;
          if (data.agentRequest === 1) pendingAgentRequests++;
        });
        setStats([
          { label: "Total Users", value: userCount },
          { label: "Total Agents", value: agentCount },
          { label: "Total Properties", value: 0 },
          { label: "Pending Agent Requests", value: pendingAgentRequests },
        ]);
      } catch (err) {
        // handle error
      } finally {
        setLoading(false);
      }
    };
    fetchStats();
  }, []);

  useEffect(() => {
    const fetchUsername = async () => {
      const id = localStorage.getItem("userID");
      setUserID(id || "");
      if (!id) return;
      try {
        const userRef = doc(db, "users", id);
        const userSnap = await getDoc(userRef);
        if (userSnap.exists()) {
          setUsername(userSnap.data().username || "");
        }
      } catch (err) {
        // handle error
      }
    };
    fetchUsername();
  }, []);

  return (
    <>
      <AdminHeader />
      <div className="container mx-auto py-10">
        <div className="mt-8 mb-8 flex items-center gap-4">
          <h1 className="text-3xl font-bold text-white">Admin Dashboard</h1>
          {username ? (
            <span className="text-primary text-xl font-semibold">
              Welcome, {username}
            </span>
          ) : (
            userID && (
              <span className="text-primary text-xl font-semibold">
                Welcome, {userID}
              </span>
            )
          )}
        </div>
        {loading ? (
          <div className="text-lg text-gray-300">Loading stats...</div>
        ) : (
          <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-4">
            {stats.map((stat) => (
              <div
                key={stat.label}
                className="flex flex-col items-center justify-center rounded-xl border border-gray-700 bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900 p-6 shadow-lg"
              >
                <div className="text-primary mb-2 text-4xl font-extrabold">
                  {stat.value}
                </div>
                <div className="text-lg font-medium text-gray-200">
                  {stat.label}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </>
  );
}
