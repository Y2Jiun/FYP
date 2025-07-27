"use client";
import { useState, useEffect } from "react";
import { db } from "@/lib/firebase";
import {
  collection,
  getDocs,
  addDoc,
  updateDoc,
  deleteDoc,
  doc,
  Timestamp,
} from "firebase/firestore";
import { useEditor, EditorContent } from "@tiptap/react";
import StarterKit from "@tiptap/starter-kit";
import dynamic from "next/dynamic";
import AdminHeader from "@/components/Admin/AdminHeader";

const MyEditor = dynamic(() => import("@/components/MyEditor"), { ssr: false });

interface StaticPage {
  id: string;
  title: string;
  slug: string;
  content: string;
  lastUpdated?: any;
  createdBy?: string;
}

interface NewsItem {
  title?: string;
  contentSnippet?: string;
  link?: string;
  pubDate?: string;
  content?: string;
  enclosure?: { url?: string };
  "media:content"?: { $?: { url?: string } };
}

export default function AdminContentManagementPage() {
  const [tab, setTab] = useState("news");
  // Static pages state
  const [staticPages, setStaticPages] = useState<StaticPage[]>([]);
  const [editingPage, setEditingPage] = useState<StaticPage | null>(null);
  const [form, setForm] = useState({ title: "", slug: "", content: "" });
  const [loading, setLoading] = useState(false);
  // News state
  const [news, setNews] = useState<NewsItem[]>([]);
  const [newsLoading, setNewsLoading] = useState(false);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

  // Fetch static pages
  const fetchStaticPages = async () => {
    setLoading(true);
    try {
      const snapshot = await getDocs(collection(db, "static"));
      setStaticPages(snapshot.docs.map((d) => ({ id: d.id, ...d.data() })));
    } catch (err) {
      setError("Failed to fetch static pages");
    } finally {
      setLoading(false);
    }
  };

  // Fetch news from RSS
  const fetchNews = async () => {
    setNewsLoading(true);
    try {
      console.log("Fetching news from API...");
      const res = await fetch("/api/govnews");
      console.log("API response status:", res.status);
      if (!res.ok) {
        throw new Error(`Failed to fetch news: ${res.status}`);
      }
      const items = await res.json();
      console.log("News items received:", items.length);
      console.log("Sample news item:", items[0]);
      console.log("All news items:", items);
      setNews(items);
    } catch (err: any) {
      console.error("Error fetching news:", err);
      setError(`Failed to fetch news: ${err.message}`);
      setNews([]);
    } finally {
      setNewsLoading(false);
    }
  };

  // CRUD handlers
  const handleEdit = (page: StaticPage) => {
    setEditingPage(page);
    setForm({ title: page.title, slug: page.slug, content: page.content });
  };

  const handleDelete = async (id: string) => {
    setMessage("");
    setError("");
    try {
      await deleteDoc(doc(db, "static", id));
      setMessage("Page deleted successfully!");
      fetchStaticPages();
    } catch (err) {
      setError("Failed to delete page. Please try again.");
    }
  };

  const handleSave = async () => {
    setMessage("");
    setError("");
    // Validation
    if (!form.title.trim() || !form.slug.trim() || !form.content.trim()) {
      setError("All fields are required.");
      return;
    }
    try {
      if (editingPage) {
        // Update
        await updateDoc(doc(db, "static", editingPage.id), {
          ...form,
          lastUpdated: Timestamp.now(),
        });
        setMessage("Page updated successfully!");
      } else {
        // Create
        await addDoc(collection(db, "static"), {
          ...form,
          lastUpdated: Timestamp.now(),
          createdBy: "admin", // Optionally use actual admin info
        });
        setMessage("Page created successfully!");
      }
      setForm({ title: "", slug: "", content: "" });
      setEditingPage(null);
      fetchStaticPages();
    } catch (err) {
      setError("Failed to save page. Please try again.");
    }
  };

  const handleCancel = () => {
    setForm({ title: "", slug: "", content: "" });
    setEditingPage(null);
  };

  // Initial fetch
  useEffect(() => {
    fetchStaticPages();
    fetchNews();
  }, []);

  // Display all news items (API already filters for property-related news)
  const displayNews = news;

  return (
    <>
      <AdminHeader />
      <div className="min-h-screen bg-gray-100 py-10 dark:bg-[#181c23]">
        <div className="mx-auto max-w-4xl rounded-xl bg-[#23272f] p-8 shadow-lg">
          <h1 className="mb-6 text-3xl font-bold text-white">
            Content Management
          </h1>
          <div className="mb-8 flex gap-4">
            <button
              className={`rounded px-4 py-2 font-semibold ${tab === "news" ? "bg-primary text-white" : "bg-gray-700 text-gray-300"}`}
              onClick={() => setTab("news")}
            >
              Blog/News
            </button>
            <button
              className={`rounded px-4 py-2 font-semibold ${tab === "static" ? "bg-primary text-white" : "bg-gray-700 text-gray-300"}`}
              onClick={() => setTab("static")}
            >
              Static Pages
            </button>
          </div>
          {tab === "static" && (
            <div>
              <h2 className="mb-4 text-2xl font-semibold text-white">
                Static Pages
              </h2>
              <div className="mb-6 rounded-lg bg-[#181c23] p-4 shadow">
                {error && (
                  <div className="mb-2 rounded bg-red-600 px-4 py-2 text-white">
                    {error}
                  </div>
                )}
                {message && (
                  <div className="mb-2 rounded bg-green-600 px-4 py-2 text-white">
                    {message}
                  </div>
                )}
                <input
                  type="text"
                  placeholder="Enter page title (e.g. About Us)"
                  className="mr-2 rounded border border-gray-600 bg-[#23272f] p-2 text-white"
                  value={form.title}
                  onChange={(e) =>
                    setForm((f) => ({ ...f, title: e.target.value }))
                  }
                />
                <input
                  type="text"
                  placeholder="Enter slug (e.g. about, faq, privacy-policy)"
                  className="mr-2 rounded border border-gray-600 bg-[#23272f] p-2 text-white"
                  value={form.slug}
                  onChange={(e) =>
                    setForm((f) => ({ ...f, slug: e.target.value }))
                  }
                />
                <div className="my-2">
                  <MyEditor
                    value={form.content}
                    onChange={(val) => setForm((f) => ({ ...f, content: val }))}
                  />
                </div>
                <button
                  className="bg-primary mr-2 rounded px-4 py-2 font-semibold text-white"
                  onClick={handleSave}
                >
                  {editingPage ? "Update" : "Create"}
                </button>
                {editingPage && (
                  <button
                    className="rounded bg-gray-500 px-4 py-2 font-semibold text-white"
                    onClick={handleCancel}
                  >
                    Cancel
                  </button>
                )}
              </div>
              <table className="w-full overflow-hidden rounded-lg border border-gray-700">
                <thead>
                  <tr className="bg-gray-700 text-gray-200">
                    <th className="p-2">Title</th>
                    <th className="p-2">Slug</th>
                    <th className="p-2">Last Updated</th>
                    <th className="p-2">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {staticPages.map((page) => (
                    <tr
                      key={page.id}
                      className="border-t border-gray-700 transition hover:bg-gray-800"
                    >
                      <td className="p-2 text-white">{page.title}</td>
                      <td className="p-2 text-gray-300">{page.slug}</td>
                      <td className="p-2 text-gray-400">
                        {page.lastUpdated?.toDate?.().toLocaleString?.() || "-"}
                      </td>
                      <td className="p-2">
                        <button
                          className="mr-2 text-blue-400 hover:underline"
                          onClick={() => handleEdit(page)}
                        >
                          Edit
                        </button>
                        <button
                          className="text-red-400 hover:underline"
                          onClick={() => handleDelete(page.id)}
                        >
                          Delete
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
          {tab === "news" && (
            <div>
              <h2 className="mb-4 text-2xl font-semibold text-white">
                Malaysia Government News
              </h2>
              {newsLoading ? (
                <p className="text-gray-200">Loading news...</p>
              ) : displayNews.length === 0 ? (
                <div className="text-center">
                  <p className="text-gray-200">
                    No news available at the moment.
                  </p>
                  <p className="text-sm text-gray-400">
                    Please try again later.
                  </p>
                </div>
              ) : (
                <ul className="space-y-8">
                  {displayNews.map((item, idx) => {
                    // Try to get image from enclosure or media:content
                    const imageUrl =
                      item.enclosure?.url ||
                      (item["media:content"] &&
                        item["media:content"]["$"]?.url) ||
                      null;
                    return (
                      <li key={idx} className="border-b border-gray-700 pb-6">
                        {imageUrl && (
                          <img
                            src={imageUrl}
                            alt="news"
                            className="mb-2 max-h-48 w-full rounded object-cover"
                          />
                        )}
                        <a
                          href={item.link}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-xl font-bold text-blue-300 hover:underline"
                        >
                          {item.title}
                        </a>
                        <div className="mb-1 text-sm text-gray-300">
                          {item.pubDate}
                        </div>
                        <div
                          className="text-base text-gray-100"
                          dangerouslySetInnerHTML={{
                            __html: item.contentSnippet || item.content || "",
                          }}
                        />
                      </li>
                    );
                  })}
                </ul>
              )}
            </div>
          )}
        </div>
      </div>
    </>
  );
}
