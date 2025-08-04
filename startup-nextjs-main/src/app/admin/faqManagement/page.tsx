"use client";
import { useState, useEffect } from "react";
import AdminHeader from "@/components/Admin/AdminHeader";
import { db } from "@/lib/firebase";
import {
  collection,
  getDocs,
  updateDoc,
  deleteDoc,
  doc,
  query,
  orderBy,
  getDoc,
  setDoc,
  serverTimestamp,
} from "firebase/firestore";

interface FAQ {
  faqId: string;
  question: string;
  answer: string;
  createdBy: string;
  createdAt: any;
  status: string;
}

export default function AdminFAQManagementPage() {
  const [faqs, setFaqs] = useState<FAQ[]>([]);
  const [filter, setFilter] = useState<string>("all");
  const [editing, setEditing] = useState<FAQ | null>(null);
  const [editQuestion, setEditQuestion] = useState("");
  const [editAnswer, setEditAnswer] = useState("");
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

  // Helper function to create notifications
  const createNotification = async (
    agentUID: string,
    title: string,
    content: string,
  ) => {
    try {
      // Get next notification ID
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

      // Create notification data
      const notificationData = {
        NotificationID: notifId,
        title: title,
        content: content,
        type: 0, // 0 = notification
        audience: 2, // 2 = agent audience
        createdBy: "admin",
        createdAt: serverTimestamp(),
        agentUID: agentUID,
        readBy: {}, // Start as unread
      };

      await setDoc(doc(db, "notification", notifId), notificationData);
      console.log("FAQ notification sent successfully to agent:", agentUID);
    } catch (notificationError) {
      console.error("Error creating FAQ notification:", notificationError);
    }
  };

  // Fetch all FAQs
  const fetchFaqs = async () => {
    const q = query(collection(db, "faqs"), orderBy("createdAt", "desc"));
    const snapshot = await getDocs(q);
    setFaqs(snapshot.docs.map((doc) => doc.data() as FAQ));
  };

  useEffect(() => {
    fetchFaqs();
  }, []);

  // Filtered FAQs
  const filteredFaqs =
    filter === "all" ? faqs : faqs.filter((faq) => faq.status === filter);

  // Approve FAQ
  const handleApprove = async (faqId: string) => {
    setError("");
    setMessage("");
    try {
      // Get the FAQ data to find the creator
      const faqDoc = await getDoc(doc(db, "faqs", faqId));
      if (!faqDoc.exists()) {
        setError("FAQ not found.");
        return;
      }

      const faqData = faqDoc.data();
      const agentUID = faqData.createdBy;

      // Update FAQ status
      await updateDoc(doc(db, "faqs", faqId), { status: "published" });

      // Send notification to the agent who created the FAQ
      if (agentUID && agentUID !== "agent") {
        await createNotification(
          agentUID,
          "FAQ Approved",
          `Your FAQ "${faqData.question}" has been approved and published successfully.`,
        );
      }

      setMessage("FAQ approved and published.");
      fetchFaqs();
    } catch (err) {
      setError("Failed to approve FAQ.");
    }
  };

  // Delete FAQ
  const handleDelete = async (faqId: string) => {
    setError("");
    setMessage("");
    try {
      // Get the FAQ data to find the creator before deleting
      const faqDoc = await getDoc(doc(db, "faqs", faqId));
      if (!faqDoc.exists()) {
        setError("FAQ not found.");
        return;
      }
      
      const faqData = faqDoc.data();
      const agentUID = faqData.createdBy;
      const question = faqData.question;
      
      // Delete FAQ
      await deleteDoc(doc(db, "faqs", faqId));
      
      // Send notification to the agent who created the FAQ
      if (agentUID && agentUID !== "agent") {
        await createNotification(
          agentUID,
          "FAQ Rejected",
          `Your FAQ "${question}" has been rejected and deleted by admin.`
        );
      }
      
      setMessage("FAQ deleted.");
      fetchFaqs();
    } catch (err) {
      setError("Failed to delete FAQ.");
    }
  };

  // Edit FAQ
  const handleEdit = (faq: FAQ) => {
    setEditing(faq);
    setEditQuestion(faq.question);
    setEditAnswer(faq.answer);
  };

  const handleEditSave = async () => {
    if (!editing) return;
    setError("");
    setMessage("");
    try {
      // Get the FAQ data to find the creator
      const faqDoc = await getDoc(doc(db, "faqs", editing.faqId));
      if (!faqDoc.exists()) {
        setError("FAQ not found.");
        return;
      }
      
      const faqData = faqDoc.data();
      const agentUID = faqData.createdBy;
      
      // Update FAQ
      await updateDoc(doc(db, "faqs", editing.faqId), {
        question: editQuestion,
        answer: editAnswer,
      });
      
      // Send notification to the agent who created the FAQ
      if (agentUID && agentUID !== "agent") {
        await createNotification(
          agentUID,
          "FAQ Edited",
          `Your FAQ "${editQuestion}" has been edited by admin.`
        );
      }
      
      setMessage("FAQ updated.");
      setEditing(null);
      fetchFaqs();
    } catch (err) {
      setError("Failed to update FAQ.");
    }
  };

  const handleEditCancel = () => {
    setEditing(null);
    setEditQuestion("");
    setEditAnswer("");
  };

  return (
    <>
      <AdminHeader />
      <div className="min-h-screen bg-white py-10 dark:bg-[#181c23]">
        <div className="mx-auto max-w-4xl rounded-xl bg-white p-8 shadow-lg dark:bg-[#23272f]">
          <h1 className="mb-6 text-3xl font-bold text-gray-900 dark:text-white">
            FAQ Management
          </h1>
          <div className="mb-4 flex gap-4">
            <button
              className={`rounded px-4 py-2 font-semibold ${filter === "all" ? "bg-primary text-white" : "bg-gray-200 text-gray-700 dark:bg-gray-700 dark:text-gray-300"}`}
              onClick={() => setFilter("all")}
            >
              All
            </button>
            <button
              className={`rounded px-4 py-2 font-semibold ${filter === "pending" ? "bg-yellow-600 text-white" : "bg-gray-200 text-gray-700 dark:bg-gray-700 dark:text-gray-300"}`}
              onClick={() => setFilter("pending")}
            >
              Pending
            </button>
            <button
              className={`rounded px-4 py-2 font-semibold ${filter === "published" ? "bg-green-600 text-white" : "bg-gray-200 text-gray-700 dark:bg-gray-700 dark:text-gray-300"}`}
              onClick={() => setFilter("published")}
            >
              Published
            </button>
          </div>
          {message && (
            <div className="mb-2 rounded bg-green-600 px-4 py-2 text-white">
              {message}
            </div>
          )}
          {error && (
            <div className="mb-2 rounded bg-red-600 px-4 py-2 text-white">
              {error}
            </div>
          )}
          <ul className="space-y-6">
            {filteredFaqs.length === 0 && (
              <li className="text-gray-500 dark:text-gray-300">
                No FAQs found.
              </li>
            )}
            {filteredFaqs.map((faq) => (
              <li
                key={faq.faqId}
                className="rounded bg-gray-100 p-4 dark:bg-gray-800"
              >
                {editing && editing.faqId === faq.faqId ? (
                  <div>
                    <input
                      type="text"
                      className="mb-2 w-full rounded border border-gray-300 bg-white p-2 text-gray-900 dark:border-gray-600 dark:bg-[#23272f] dark:text-white"
                      value={editQuestion}
                      onChange={(e) => setEditQuestion(e.target.value)}
                    />
                    <textarea
                      className="mb-2 w-full rounded border border-gray-300 bg-white p-2 text-gray-900 dark:border-gray-600 dark:bg-[#23272f] dark:text-white"
                      value={editAnswer}
                      onChange={(e) => setEditAnswer(e.target.value)}
                    />
                    <button
                      className="bg-primary mr-2 rounded px-4 py-2 font-semibold text-white"
                      onClick={handleEditSave}
                    >
                      Save
                    </button>
                    <button
                      className="rounded bg-gray-500 px-4 py-2 font-semibold text-white"
                      onClick={handleEditCancel}
                    >
                      Cancel
                    </button>
                  </div>
                ) : (
                  <>
                    <div className="text-primary font-bold">
                      Q: {faq.question}
                    </div>
                    <div className="mt-2 text-gray-700 dark:text-gray-200">
                      A: {faq.answer}
                    </div>
                    <div className="mt-2 flex gap-2">
                      {faq.status === "pending" && (
                        <button
                          className="rounded bg-green-600 px-3 py-1 text-white"
                          onClick={() => handleApprove(faq.faqId)}
                        >
                          Approve
                        </button>
                      )}
                      <button
                        className="rounded bg-blue-600 px-3 py-1 text-white"
                        onClick={() => handleEdit(faq)}
                      >
                        Edit
                      </button>
                      <button
                        className="rounded bg-red-600 px-3 py-1 text-white"
                        onClick={() => handleDelete(faq.faqId)}
                      >
                        Delete
                      </button>
                    </div>
                  </>
                )}
              </li>
            ))}
          </ul>
        </div>
      </div>
    </>
  );
}
