"use client";
import { useState, useEffect } from "react";
import AgentHeader from "@/components/Agent/agentHeader";
import { db, auth } from "@/lib/firebase";
import {
  collection,
  getDocs,
  doc,
  setDoc,
  query,
  orderBy,
  Timestamp,
} from "firebase/firestore";
import { FaQuestionCircle, FaCheckCircle } from "react-icons/fa";

interface FAQ {
  faqId: string;
  question: string;
  answer: string;
  createdBy: string;
  createdAt: any;
  status: string;
}

export default function AgentFAQPage() {
  const [faqs, setFaqs] = useState<FAQ[]>([]);
  const [question, setQuestion] = useState("");
  const [answer, setAnswer] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

  // Fetch published FAQs
  const fetchFaqs = async () => {
    const q = query(collection(db, "faqs"), orderBy("createdAt", "desc"));
    const snapshot = await getDocs(q);
    setFaqs(
      snapshot.docs
        .map((doc) => doc.data() as FAQ)
        .filter((faq) => faq.status === "published"),
    );
  };

  useEffect(() => {
    fetchFaqs();
  }, []);

  // Get next faqId
  const getNextFaqId = async () => {
    const snapshot = await getDocs(collection(db, "faqs"));
    const count = snapshot.size;
    return `faq${count + 1}`;
  };

  // Submit FAQ suggestion
  const handleSubmit = async (e: any) => {
    e.preventDefault();
    setSubmitting(true);
    setMessage("");
    setError("");
    try {
      if (!question.trim() || !answer.trim()) {
        setError("Question and answer are required.");
        setSubmitting(false);
        return;
      }

      // Get current user's UID
      const currentUser = auth.currentUser;
      if (!currentUser) {
        setError("You must be logged in to submit FAQ suggestions.");
        setSubmitting(false);
        return;
      }

      const faqId = await getNextFaqId();
      await setDoc(doc(db, "faqs", faqId), {
        faqId,
        question,
        answer,
        createdBy: currentUser.uid, // Use actual agent UID instead of "agent"
        createdAt: Timestamp.now(),
        status: "pending",
      });
      setMessage("FAQ suggestion submitted for review.");
      setQuestion("");
      setAnswer("");
      fetchFaqs();
    } catch (err) {
      setError("Failed to submit FAQ. Please try again.");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <>
      <AgentHeader />
      <div className="flex min-h-screen items-center justify-center bg-white dark:bg-[#181c23]">
        <div className="w-full max-w-3xl rounded-xl bg-white p-8 shadow-2xl dark:bg-[#23272f]">
          <h1 className="mb-6 flex items-center gap-2 text-3xl font-bold text-gray-900 dark:text-white">
            <FaQuestionCircle className="text-primary" /> Agent FAQ
          </h1>
          <h2 className="text-primary mb-4 text-xl font-semibold">
            Frequently Asked Questions
          </h2>
          <ul className="mb-8 space-y-6">
            {faqs.length === 0 && (
              <li className="text-gray-500 dark:text-gray-300">No FAQs yet.</li>
            )}
            {faqs.map((faq) => (
              <li
                key={faq.faqId}
                className="flex items-start gap-3 rounded-lg bg-gray-100 p-5 shadow dark:bg-gray-800"
              >
                <FaCheckCircle className="mt-1 text-green-400" size={22} />
                <div>
                  <div className="text-primary text-lg font-bold">
                    Q: {faq.question}
                  </div>
                  <div className="mt-2 text-gray-700 dark:text-gray-200">
                    A: {faq.answer}
                  </div>
                </div>
              </li>
            ))}
          </ul>
          <h2 className="text-primary mb-2 text-lg font-semibold">
            Suggest a New FAQ
          </h2>
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
          <form
            onSubmit={handleSubmit}
            className="space-y-4 rounded-lg bg-gray-100 p-6 shadow dark:bg-gray-900"
          >
            <input
              type="text"
              placeholder="Enter your question"
              className="w-full rounded border border-gray-300 bg-white p-2 text-gray-900 placeholder-gray-500 focus:border-blue-400 focus:outline-none dark:border-gray-600 dark:bg-[#23272f] dark:text-white dark:placeholder-gray-400"
              value={question}
              onChange={(e) => setQuestion(e.target.value)}
              disabled={submitting}
            />
            <textarea
              placeholder="Enter the answer"
              className="w-full rounded border border-gray-300 bg-white p-2 text-gray-900 placeholder-gray-500 focus:border-blue-400 focus:outline-none dark:border-gray-600 dark:bg-[#23272f] dark:text-white dark:placeholder-gray-400"
              value={answer}
              onChange={(e) => setAnswer(e.target.value)}
              disabled={submitting}
            />
            <button
              type="submit"
              className="bg-primary rounded px-6 py-2 font-semibold text-white transition hover:bg-blue-700"
              disabled={submitting}
            >
              {submitting ? "Submitting..." : "Submit FAQ Suggestion"}
            </button>
          </form>
        </div>
      </div>
    </>
  );
}
