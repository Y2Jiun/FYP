"use client";
import { useState, useEffect } from "react";
import { db } from "@/lib/firebase";
import {
  doc,
  getDoc,
  setDoc,
  collection,
  Timestamp,
  getDocs,
  deleteDoc,
  orderBy,
  query,
} from "firebase/firestore";
import AdminHeader from "@/components/Admin/AdminHeader";

const audienceMap = { 1: "User", 2: "Agent", 3: "All" };
// Update typeMap to include all types
const typeMap = {
  0: "Notification",
  1: "Announcement",
  2: "Alert",
  3: "Warning",
};

export default function AdminNotificationPage() {
  const [form, setForm] = useState({
    title: "",
    content: "",
    audience: 3, // 1=user, 2=agent, 3=all
    type: 0, // 0=notification, 1=announcement
  });
  const [createdAt, setCreatedAt] = useState(null); // For editing only
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  const [notifications, setNotifications] = useState([]);
  const [editingId, setEditingId] = useState(null);

  // Simulate getting current admin userID (replace with real auth if available)
  const currentUserID =
    typeof window !== "undefined"
      ? localStorage.getItem("userId") || "admin"
      : "admin";

  // Fetch all notifications
  const fetchNotifications = async () => {
    try {
      const notifRef = collection(db, "notification");
      const qNotif = query(notifRef, orderBy("createdAt", "desc"));
      const snapshot = await getDocs(qNotif);
      setNotifications(
        snapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() })),
      );
    } catch (err) {
      setError("Failed to fetch notifications.");
    }
  };

  useEffect(() => {
    fetchNotifications();
  }, []);

  const handleSendOrUpdate = async () => {
    setMessage("");
    setError("");
    if (!form.title.trim() || !form.content.trim()) {
      setError("Title and content are required.");
      return;
    }
    setLoading(true);
    try {
      let notifId = editingId;
      if (!editingId) {
        const counterRef = doc(db, "notificationCounter", "notification");
        const counterSnap = await getDoc(counterRef);
        let nextId = 1;
        if (counterSnap.exists()) {
          const lastID = counterSnap.data().lastID;
          if (lastID && /^NID\d+$/.test(lastID)) {
            nextId = parseInt(lastID.replace("NID", "")) + 1;
          }
        }
        notifId = `NID${nextId}`;
        await setDoc(counterRef, { lastID: notifId });
      }
      const notifRef = doc(db, "notification", notifId);
      await setDoc(notifRef, {
        NotificationID: notifId,
        title: form.title,
        content: form.content,
        audience: form.audience,
        type: form.type,
        createdAt: editingId && createdAt ? createdAt : Timestamp.now(),
        createdBy: currentUserID,
        readBy: [],
      });
      setMessage(
        editingId
          ? "Notification updated successfully!"
          : "Notification sent successfully!",
      );
      setForm({ title: "", content: "", audience: 3, type: 0 });
      setEditingId(null);
      setCreatedAt(null);
      fetchNotifications();
    } catch (err) {
      setError("Failed to send/update notification. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const handleEdit = (notif) => {
    setForm({
      title: notif.title,
      content: notif.content,
      audience: notif.audience,
      type: notif.type,
    });
    setCreatedAt(notif.createdAt || null);
    setEditingId(notif.NotificationID);
    setMessage("");
    setError("");
  };

  const handleDelete = async (id) => {
    setMessage("");
    setError("");
    try {
      await deleteDoc(doc(db, "notification", id));
      setMessage("Notification deleted successfully!");
      setForm({ title: "", content: "", audience: 3, type: 0 });
      setEditingId(null);
      setCreatedAt(null);
      fetchNotifications();
    } catch (err) {
      setError("Failed to delete notification. Please try again.");
    }
  };

  const handleCancel = () => {
    setForm({ title: "", content: "", audience: 3, type: 0 });
    setEditingId(null);
    setCreatedAt(null);
    setMessage("");
    setError("");
  };

  return (
    <>
      <AdminHeader />
      <div className="min-h-screen bg-white py-10 dark:bg-[#181c23]">
        <div className="mx-auto max-w-3xl space-y-8">
          {/* Notification List Card */}
          <div className="rounded-xl bg-white p-6 shadow-lg dark:bg-[#23272f]">
            <h2 className="mb-4 text-2xl font-bold text-gray-900 dark:text-white">
              All Notifications
            </h2>
            <div className="overflow-x-auto">
              <table className="w-full overflow-hidden rounded-lg text-sm">
                <thead>
                  <tr className="bg-gray-100 text-gray-700 dark:bg-gray-800 dark:text-gray-300">
                    <th className="p-2 text-left">Title</th>
                    <th className="p-2 text-left">Audience</th>
                    <th className="p-2 text-left">Type</th>
                    <th className="p-2 text-left">Created At</th>
                    <th className="p-2 text-left">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {notifications.length === 0 && (
                    <tr>
                      <td colSpan={5} className="p-2 text-center text-gray-500 dark:text-gray-400">
                        No notifications found.
                      </td>
                    </tr>
                  )}
                  {notifications.map((notif, idx) => (
                    <tr
                      key={notif.NotificationID}
                      className={`border-t border-gray-300 transition hover:bg-gray-100 dark:border-gray-700 dark:hover:bg-gray-800 ${idx % 2 === 0 ? "bg-white dark:bg-[#23272f]" : "bg-gray-50 dark:bg-[#1a1e26]"}`}
                    >
                      <td className="max-w-xs truncate p-2 text-gray-900 dark:text-white" title={notif.title}>
                        {notif.title}
                      </td>
                      <td className="p-2 text-gray-700 dark:text-gray-300">
                        {audienceMap[notif.audience]}
                      </td>
                      <td className="p-2 text-gray-700 dark:text-gray-300">
                        {typeMap[notif.type]}
                      </td>
                      <td className="p-2 text-gray-500 dark:text-gray-400">
                        {notif.createdAt?.toDate?.().toLocaleString?.() || "-"}
                      </td>
                      <td className="flex gap-2 p-2">
                        <button
                          className="text-blue-600 transition hover:text-blue-400 dark:text-blue-400 dark:hover:text-blue-200"
                          onClick={() => handleEdit(notif)}
                          title="Edit"
                        >
                          ✏️
                        </button>
                        <button
                          className="text-red-600 transition hover:text-red-400 dark:text-red-400 dark:hover:text-red-200"
                          onClick={() => handleDelete(notif.NotificationID)}
                          title="Delete"
                        >
                          🗑️
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* Notification Form Card */}
          <div className="rounded-xl bg-white p-6 shadow-lg dark:bg-[#23272f]">
            <h2 className="mb-4 text-2xl font-bold text-gray-900 dark:text-white">
              {editingId ? "Edit Notification" : "Send Notification / Announcement"}
            </h2>
            {error && (
              <div className="mb-2 rounded bg-red-600 px-4 py-2 text-white transition-opacity duration-500">
                {error}
              </div>
            )}
            {message && (
              <div className="mb-2 rounded bg-green-600 px-4 py-2 text-white transition-opacity duration-500">
                {message}
              </div>
            )}
            <div className="mb-4">
              <label className="mb-1 block font-semibold text-gray-900 dark:text-white">
                Title
              </label>
              <input
                type="text"
                placeholder="Enter notification title"
                className="w-full rounded border border-gray-300 bg-white p-2 text-gray-900 dark:border-gray-600 dark:bg-[#23272f] dark:text-white"
                value={form.title}
                onChange={(e) => setForm((f) => ({ ...f, title: e.target.value }))}
              />
            </div>
            <div className="mb-4">
              <label className="mb-1 block font-semibold text-gray-900 dark:text-white">
                Content
              </label>
              <textarea
                placeholder="Enter notification content"
                className="min-h-[100px] w-full rounded border border-gray-300 bg-white p-2 text-gray-900 dark:border-gray-600 dark:bg-[#23272f] dark:text-white"
                value={form.content}
                onChange={(e) => setForm((f) => ({ ...f, content: e.target.value }))}
              />
            </div>
            <div className="mb-4 flex gap-4">
              <div className="flex-1">
                <label className="mb-1 block font-semibold text-gray-900 dark:text-white">
                  Audience
                </label>
                <select
                  className="w-full rounded border border-gray-300 bg-white p-2 text-gray-900 dark:border-gray-600 dark:bg-[#23272f] dark:text-white"
                  value={form.audience}
                  onChange={(e) => setForm((f) => ({ ...f, audience: Number(e.target.value) }))}
                >
                  <option value={1}>User</option>
                  <option value={2}>Agent</option>
                  <option value={3}>All</option>
                </select>
              </div>
              <div className="flex-1">
                <label className="mb-1 block font-semibold text-gray-900 dark:text-white">
                  Type
                </label>
                <div className="flex gap-2">
                  <button
                    type="button"
                    className={`flex-1 rounded border px-4 py-2 font-semibold ${form.type === 0 ? "border-blue-600 bg-blue-600 text-white" : "border-gray-300 bg-white text-gray-900 dark:border-gray-600 dark:bg-[#23272f] dark:text-gray-300"}`}
                    onClick={() => setForm((f) => ({ ...f, type: 0 }))}
                  >
                    Notification
                  </button>
                  <button
                    type="button"
                    className={`flex-1 rounded border px-4 py-2 font-semibold ${form.type === 1 ? "border-blue-600 bg-blue-600 text-white" : "border-gray-300 bg-white text-gray-900 dark:border-gray-600 dark:bg-[#23272f] dark:text-gray-300"}`}
                    onClick={() => setForm((f) => ({ ...f, type: 1 }))}
                  >
                    Announcement
                  </button>
                </div>
              </div>
            </div>
            <div className="flex gap-2">
              <button
                className={`mt-4 flex-1 rounded px-4 py-2 font-bold text-white disabled:opacity-60 ${editingId ? "bg-blue-500" : "bg-primary"}`}
                onClick={handleSendOrUpdate}
                disabled={loading}
              >
                {editingId
                  ? loading
                    ? "Updating..."
                    : "Update"
                  : loading
                    ? "Sending..."
                    : "Send"}
              </button>
              {editingId && (
                <button
                  className="mt-4 flex-1 rounded bg-gray-500 px-4 py-2 font-bold text-white"
                  onClick={handleCancel}
                  disabled={loading}
                >
                  Cancel
                </button>
              )}
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
