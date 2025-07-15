"use client";
import { useEffect, useState } from "react";
import { db } from "@/lib/firebase";
import { collection, getDocs, doc, updateDoc } from "firebase/firestore";
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
      await updateDoc(userRef, { roles: 2, agentRequest: 0 });
      setUsers((prev) => prev.filter((user) => user.id !== userId));
      setFilteredUsers((prev) => prev.filter((user) => user.id !== userId));
      setNotification("User has been approved and is now an agent.");
      setTimeout(() => setNotification(""), 3000);
    } catch (err) {
      setNotification("Failed to update user roles");
      setTimeout(() => setNotification(""), 3000);
    }
  };

  const handleReject = async (userId: string) => {
    try {
      const userRef = doc(db, "users", userId);
      await updateDoc(userRef, { agentRequest: 0 });
      setUsers((prev) => prev.filter((user) => user.id !== userId));
      setFilteredUsers((prev) => prev.filter((user) => user.id !== userId));
      setNotification("User's agent request has been rejected.");
      setTimeout(() => setNotification(""), 3000);
    } catch (err) {
      setNotification("Failed to reject agent request");
      setTimeout(() => setNotification(""), 3000);
    }
  };

  return (
    <>
      <AdminHeader />
      <div className="container mx-auto py-8">
        <h1 className="mt-8 mb-6 text-2xl font-bold text-white">
          Agent Requests
        </h1>
        {notification && (
          <div className="mb-4 rounded border border-blue-700 bg-blue-900/80 px-4 py-2 text-blue-200 shadow">
            {notification}
          </div>
        )}
        <div className="mb-6 flex max-w-md items-center gap-2">
          <div className="relative flex-1">
            <input
              type="text"
              placeholder="Search by User ID, Username, or Email..."
              className="w-full rounded-lg border border-gray-700 bg-gray-900 px-4 py-2 pl-10 text-white placeholder-gray-400 focus:border-blue-500 focus:outline-none"
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
              className="flex items-center rounded bg-gray-700 px-2 py-2 font-medium text-white shadow hover:bg-gray-600"
              onClick={handleClearSearch}
              aria-label="Clear search"
            >
              <FiX />
            </button>
          )}
        </div>
        {loading ? (
          <p className="text-gray-300">Loading...</p>
        ) : error ? (
          <p className="text-red-400">{error}</p>
        ) : filteredUsers.length === 0 ? (
          <p className="text-gray-400">No agent requests found.</p>
        ) : (
          <div className="overflow-x-auto rounded-2xl border border-gray-700 bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900 shadow-2xl">
            <table className="min-w-full text-white">
              <thead>
                <tr>
                  <th className="border-b border-gray-700 px-6 py-4 text-left font-semibold">
                    User ID
                  </th>
                  <th className="border-b border-gray-700 px-6 py-4 text-left font-semibold">
                    Username
                  </th>
                  <th className="border-b border-gray-700 px-6 py-4 text-left font-semibold">
                    Email
                  </th>
                  <th className="border-b border-gray-700 px-6 py-4 text-left font-semibold">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody>
                {filteredUsers.map((user, idx) => (
                  <tr
                    key={user.id}
                    className={`transition-colors ${idx % 2 === 0 ? "bg-gray-900" : "bg-gray-800"} hover:bg-gray-700`}
                  >
                    <td className="rounded-l-2xl border-b border-gray-700 px-6 py-4">
                      {user.id}
                    </td>
                    <td className="border-b border-gray-700 px-6 py-4">
                      {user.username || "-"}
                    </td>
                    <td className="border-b border-gray-700 px-6 py-4">
                      {user.email || "-"}
                    </td>
                    <td className="flex gap-2 rounded-r-2xl border-b border-gray-700 px-6 py-4">
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
