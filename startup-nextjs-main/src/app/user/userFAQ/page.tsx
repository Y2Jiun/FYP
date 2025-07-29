"use client";
import { useEffect, useState } from "react";
import { db } from "@/lib/firebase";
import { collection, getDocs, query, where, orderBy } from "firebase/firestore";
import UserHeader from "@/components/User/userHeader";
import { ChevronDownIcon } from "@heroicons/react/24/outline";

interface FAQ {
  faqId: string;
  question: string;
  answer: string;
  createdBy: string;
  createdAt: any;
  status: string;
}

export default function UserFAQPage() {
  const [faqs, setFaqs] = useState<FAQ[]>([]);
  const [loading, setLoading] = useState(true);
  const [openIndex, setOpenIndex] = useState<number | null>(null);

  useEffect(() => {
    const fetchFaqs = async () => {
      setLoading(true);
      const q = query(
        collection(db, "faqs"),
        where("status", "==", "published"),
        orderBy("createdAt", "desc"),
      );
      const snapshot = await getDocs(q);
      setFaqs(snapshot.docs.map((doc) => doc.data() as FAQ));
      setLoading(false);
    };
    fetchFaqs();
  }, []);

  // Demo FAQs for future look if none in DB
  const demoFaqs: FAQ[] = [
    {
      faqId: "1",
      question: "What is SPA?",
      answer:
        "SPA stands for Single Page Application, a web app that loads a single HTML page and dynamically updates as the user interacts.",
      createdBy: "system",
      createdAt: null,
      status: "published",
    },
    {
      faqId: "2",
      question: "How do I reset my password?",
      answer:
        "Go to the Forgot Password page, enter your email, and follow the instructions sent to your inbox.",
      createdBy: "system",
      createdAt: null,
      status: "published",
    },
    {
      faqId: "3",
      question: "Is my data secure?",
      answer:
        "Yes, we use industry-standard encryption and security practices to protect your data.",
      createdBy: "system",
      createdAt: null,
      status: "published",
    },
  ];

  const displayFaqs = faqs.length > 0 ? faqs : demoFaqs;

  return (
    <div className="min-h-screen bg-white dark:bg-[#181c23]">
      <UserHeader />
      <div className="animate-fade-in mx-auto mt-10 max-w-3xl rounded-xl bg-white p-8 shadow-2xl dark:bg-[#23272f]">
        <h1 className="mb-2 text-4xl font-extrabold tracking-tight text-gray-900 dark:text-white">
          Frequently Asked Questions
        </h1>
        <p className="mb-8 text-lg text-gray-700 dark:text-gray-300">
          Find answers to common questions about our platform, features, and
          your account security.
        </p>
        {loading ? (
          <div className="text-gray-500 dark:text-gray-300">Loading...</div>
        ) : displayFaqs.length === 0 ? (
          <div className="text-gray-500 dark:text-gray-300">No FAQs found.</div>
        ) : (
          <ul className="space-y-6">
            {displayFaqs.map((faq, idx) => (
              <li
                key={faq.faqId}
                className="rounded-lg border border-gray-300 bg-gray-100 p-6 shadow-md transition-transform hover:scale-[1.02] hover:shadow-xl dark:border-gray-700 dark:bg-gray-800"
              >
                <button
                  className="flex w-full items-center justify-between text-left focus:outline-none"
                  onClick={() => setOpenIndex(openIndex === idx ? null : idx)}
                  aria-expanded={openIndex === idx}
                >
                  <span className="text-primary flex items-center gap-2 text-lg font-semibold">
                    <ChevronDownIcon
                      className={`h-5 w-5 transition-transform duration-300 ${openIndex === idx ? "rotate-180" : "rotate-0"}`}
                    />
                    Q: {faq.question}
                  </span>
                </button>
                <div
                  className={`overflow-hidden transition-all duration-300 ${openIndex === idx ? "mt-3 max-h-40 opacity-100" : "max-h-0 opacity-0"}`}
                >
                  <div className="text-base leading-relaxed text-gray-700 dark:text-gray-200">
                    A: {faq.answer}
                  </div>
                </div>
              </li>
            ))}
          </ul>
        )}
      </div>
      <style jsx global>{`
        .animate-fade-in {
          animation: fadeIn 1s ease;
        }
        @keyframes fadeIn {
          from {
            opacity: 0;
            transform: translateY(30px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
      `}</style>
    </div>
  );
}
