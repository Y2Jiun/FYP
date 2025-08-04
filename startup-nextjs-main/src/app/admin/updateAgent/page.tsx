"use client";
import { useEffect, useState } from "react";
import { db } from "@/lib/firebase";
import {
  collection,
  getDocs,
  doc,
  updateDoc,
  addDoc,
  query,
  where,
  serverTimestamp,
  getDoc,
  setDoc,
} from "firebase/firestore";
import { FiSearch, FiX } from "react-icons/fi";
import AdminHeader from "@/components/Admin/AdminHeader";

export default function UpdateAgentPage() {
  const [users, setUsers] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [notification, setNotification] = useState("");
  const [search, setSearch] = useState("");
  const [filteredUsers, setFilteredUsers] = useState<any[]>([]);

  useEffect(() => {
    const fetchUsers = async () => {
      setLoading(true);
      try {
        const usersCol = collection(db, "users");
        const usersSnapshot = await getDocs(usersCol);
        const usersList = usersSnapshot.docs
          .map((doc) => ({ id: doc.id, ...doc.data() }))
          .filter((user: any) => user.agentRequest === 1);
        setUsers(usersList);
      } catch (err: any) {
        setError("Failed to fetch users");
      } finally {
        setLoading(false);
      }
    };
    fetchUsers();
  }, []);

  useEffect(() => {
    setFilteredUsers(users);
  }, [users]);

  const handleSearch = () => {
    if (!search.trim()) {
      setFilteredUsers(users);
      return;
    }
    const lower = search.toLowerCase();
    setFilteredUsers(
      users.filter(
        (user) =>
          user.id.toLowerCase().includes(lower) ||
          (user.username && user.username.toLowerCase().includes(lower)) ||
          (user.email && user.email.toLowerCase().includes(lower)),
      ),
    );
  };

  const handleClearSearch = () => {
    setSearch("");
    setFilteredUsers(users);
  };

  const handleApprove = async (userId: string) => {
    try {
      const userRef = doc(db, "users", userId);
      const userData = users.find((user) => user.id === userId);

      if (!userData) throw new Error("User data not found");

      console.log("Approving user:", userId, "User data:", userData);

      // Update user role and clear agent request
      await updateDoc(userRef, { roles: 2, agentRequest: 0 });
      console.log("Updated user roles to 2 and agentRequest to 0");

      // Try to update agent request status (optional - might not exist)
      try {
        const agentRequestsQuery = query(
          collection(db, "agentRequests"),
          where("userID", "==", userId),
        );
        const agentRequestsSnapshot = await getDocs(agentRequestsQuery);
        if (!agentRequestsSnapshot.empty) {
          const requestDoc = agentRequestsSnapshot.docs[0];
          await updateDoc(doc(db, "agentRequests", requestDoc.id), {
            status: "approved",
            adminUID: "ADMIN001",
            adminID: "ADMIN001",
            responseDate: serverTimestamp(),
            responseMessage:
              "Your agent request has been approved! You can now access agent features.",
          });
          console.log("Updated agent request status to approved");
        } else {
          console.log("No agent request document found for user:", userId);
        }
      } catch (agentRequestError) {
        console.log("Agent request update failed (optional):", agentRequestError);
        // Continue with notification creation even if agent request update fails
      }

      // Create notification for user
      try {
        const counterRef = doc(db, "notificationCounter", "notification");
        const counterSnap = await getDoc(counterRef);
        let nextId = 1;
        if (counterSnap.exists()) {
          const lastID = counterSnap.data().lastID;
          if (lastID && /^NID\d+$/.test(lastID)) {
            nextId = parseInt(lastID.replace("NID", "")) + 1;
          }
        }
        const notifId = `NID${nextId}`;
        await setDoc(counterRef, { lastID: notifId });
        console.log("Updated notification counter, next ID:", notifId);

        // Ensure firebaseUID exists, fallback to userId if not
        const userUID = userData.firebaseUID || userId;

        const notificationData = {
          NotificationID: notifId,
          title: "Agent Request Approved",
          content:
            "Congratulations! Your agent request has been approved. You can now access agent features and list properties.",
          type: 0, // 0 = notification
          audience: 3, // 3 = user audience
          createdBy: "admin",
          createdAt: serverTimestamp(),
          agentId: "",
          agentUID: "",
          propertyId: "",
          readBy: {
            [userUID]: true,
            [userId]: true,
          },
        };

        await setDoc(doc(db, "notification", notifId), notificationData);
        console.log("Created notification successfully");
      } catch (notificationError) {
        console.error("Notification creation failed:", notificationError);
        throw new Error(`Notification creation failed: ${notificationError.message}`);
      }

      // Remove from UI
      setUsers((prev) => prev.filter((user) => user.id !== userId));
      setFilteredUsers((prev) => prev.filter((user) => user.id !== userId));
      setNotification("User has been approved and is now an agent.");
      setTimeout(() => setNotification(""), 3000);
    } catch (err) {
      console.error("Error in handleApprove:", err);
      setNotification(`Failed to update user roles: ${err.message}`);
      setTimeout(() => setNotification(""), 5000);
    }
  };

  const handleReject = async (userId: string) => {
    try {
      const userRef = doc(db, "users", userId);
      const userData = users.find((user) => user.id === userId);

      if (!userData) throw new Error("User data not found");

      console.log("Rejecting user:", userId, "User data:", userData);

      // Update user agent request status
      await updateDoc(userRef, { agentRequest: 0 });
      console.log("Updated user agentRequest to 0");

      // Try to update agent request status (optional - might not exist)
      try {
        const agentRequestsQuery = query(
          collection(db, "agentRequests"),
          where("userID", "==", userId),
        );
        const agentRequestsSnapshot = await getDocs(agentRequestsQuery);
        if (!agentRequestsSnapshot.empty) {
          const requestDoc = agentRequestsSnapshot.docs[0];
          await updateDoc(doc(db, "agentRequests", requestDoc.id), {
            status: "rejected",
            adminUID: "ADMIN001",
            adminID: "ADMIN001",
            responseDate: serverTimestamp(),
            responseMessage:
              "Your agent request has been rejected. You can apply again in the future.",
          });
          console.log("Updated agent request status to rejected");
        } else {
          console.log("No agent request document found for user:", userId);
        }
      } catch (agentRequestError) {
        console.log("Agent request update failed (optional):", agentRequestError);
        // Continue with notification creation even if agent request update fails
      }

      // Create notification for user
      try {
        const counterRef = doc(db, "notificationCounter", "notification");
        const counterSnap = await getDoc(counterRef);
        let nextId = 1;
        if (counterSnap.exists()) {
          const lastID = counterSnap.data().lastID;
          if (lastID && /^NID\d+$/.test(lastID)) {
            nextId = parseInt(lastID.replace("NID", "")) + 1;
          }
        }
        const notifId = `NID${nextId}`;
        await setDoc(counterRef, { lastID: notifId });
        console.log("Updated notification counter, next ID:", notifId);

        // Ensure firebaseUID exists, fallback to userId if not
        const userUID = userData.firebaseUID || userId;

        const notificationData = {
          NotificationID: notifId,
          title: "Agent Request Rejected",
          content:
            "Your agent request has been rejected. You can apply again in the future if you meet the requirements.",
          type: 0, // 0 = notification
          audience: 3, // 3 = user audience
          createdBy: "admin",
          createdAt: serverTimestamp(),
          agentId: "",
          agentUID: "",
          propertyId: "",
          readBy: {
            [userUID]: true,
            [userId]: true,
          },
        };

        await setDoc(doc(db, "notification", notifId), notificationData);
        console.log("Created notification successfully");
      } catch (notificationError) {
        console.error("Notification creation failed:", notificationError);
        throw new Error(`Notification creation failed: ${notificationError.message}`);
      }

      // Remove from UI
      setUsers((prev) => prev.filter((user) => user.id !== userId));
      setFilteredUsers((prev) => prev.filter((user) => user.id !== userId));
      setNotification("User's agent request has been rejected.");
      setTimeout(() => setNotification(""), 3000);
    } catch (err) {
      console.error("Error in handleReject:", err);
      setNotification(`Failed to reject agent request: ${err.message}`);
      setTimeout(() => setNotification(""), 5000);
    }
  };

  return (
    <>
      <AdminHeader />
      <div className="container mx-auto py-8">
        <h1 className="mt-8 mb-6 text-2xl font-bold text-gray-900 dark:text-white">
          Agent Requests
        </h1>
        {notification && (
          <div className="mb-4 rounded border border-blue-300 bg-blue-100 px-4 py-2 text-blue-800 shadow dark:border-blue-700 dark:bg-blue-900/80 dark:text-blue-200">
            {notification}
          </div>
        )}
        <div className="mb-6 flex max-w-md items-center gap-2">
          <div className="relative flex-1">
            <input
              type="text"
              placeholder="Search by User ID, Username, or Email..."
              className="w-full rounded-lg border border-gray-300 bg-white px-4 py-2 pl-10 text-gray-900 placeholder-gray-400 focus:border-blue-500 focus:outline-none dark:border-gray-700 dark:bg-gray-900 dark:text-white"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter") handleSearch();
              }}
            />
            <FiSearch className="absolute top-1/2 left-3 -translate-y-1/2 text-gray-400" />
          </div>
          <button
            className="rounded bg-blue-600 px-3 py-2 font-medium text-white shadow hover:bg-blue-500"
            onClick={handleSearch}
          >
            Search
          </button>
          {search && (
            <button
              className="flex items-center rounded bg-gray-200 px-2 py-2 font-medium text-gray-900 shadow hover:bg-gray-300 dark:bg-gray-700 dark:text-white dark:hover:bg-gray-600"
              onClick={handleClearSearch}
              aria-label="Clear search"
            >
              <FiX />
            </button>
          )}
        </div>
        {loading ? (
          <p className="text-gray-500 dark:text-gray-300">Loading...</p>
        ) : error ? (
          <p className="text-red-600 dark:text-red-400">{error}</p>
        ) : filteredUsers.length === 0 ? (
          <p className="text-gray-500 dark:text-gray-400">
            No agent requests found.
          </p>
        ) : (
          <div className="overflow-x-auto rounded-2xl border border-gray-300 bg-white shadow-2xl dark:border-gray-700 dark:bg-gradient-to-br dark:from-gray-900 dark:via-gray-800 dark:to-gray-900">
            <table className="min-w-full text-gray-900 dark:text-white">
              <thead>
                <tr>
                  <th className="border-b border-gray-300 px-6 py-4 text-left font-semibold dark:border-gray-700">
                    User ID
                  </th>
                  <th className="border-b border-gray-300 px-6 py-4 text-left font-semibold dark:border-gray-700">
                    Username
                  </th>
                  <th className="border-b border-gray-300 px-6 py-4 text-left font-semibold dark:border-gray-700">
                    Email
                  </th>
                  <th className="border-b border-gray-300 px-6 py-4 text-left font-semibold dark:border-gray-700">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody>
                {filteredUsers.map((user, idx) => (
                  <tr
                    key={user.id}
                    className={`transition-colors ${idx % 2 === 0 ? "bg-white dark:bg-gray-900" : "bg-gray-100 dark:bg-gray-800"} hover:bg-gray-200 dark:hover:bg-gray-700`}
                  >
                    <td className="rounded-l-2xl border-b border-gray-300 px-6 py-4 dark:border-gray-700">
                      {user.id}
                    </td>
                    <td className="border-b border-gray-300 px-6 py-4 dark:border-gray-700">
                      {user.username || "-"}
                    </td>
                    <td className="border-b border-gray-300 px-6 py-4 dark:border-gray-700">
                      {user.email || "-"}
                    </td>
                    <td className="flex gap-2 rounded-r-2xl border-b border-gray-300 px-6 py-4 dark:border-gray-700">
                      <button
                        className="rounded-lg bg-green-600 px-5 py-2 font-semibold text-white shadow transition-colors hover:bg-green-500 focus:ring-2 focus:ring-green-400"
                        onClick={() => handleApprove(user.id)}
                      >
                        Approve
                      </button>
                      <button
                        className="rounded-lg bg-red-600 px-5 py-2 font-semibold text-white shadow transition-colors hover:bg-red-500 focus:ring-2 focus:ring-red-400"
                        onClick={() => handleReject(user.id)}
                      >
                        Reject
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </>
  );
}
