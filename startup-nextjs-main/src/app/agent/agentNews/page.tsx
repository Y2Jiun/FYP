"use client";
import { useState, useEffect } from "react";
import dynamic from "next/dynamic";
import AgentHeader from "@/components/Agent/agentHeader";

interface NewsItem {
  title?: string;
  contentSnippet?: string;
  link?: string;
  pubDate?: string;
  content?: string;
  enclosure?: { url?: string };
  "media:content"?: { $?: { url?: string } };
}

export default function AgentNewsPage() {
  const [news, setNews] = useState<NewsItem[]>([]);
  const [newsLoading, setNewsLoading] = useState(false);
  const [error, setError] = useState("");

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

  // Initial fetch
  useEffect(() => {
    fetchNews();
  }, []);

  return (
    <>
      <AgentHeader />
      <div className="min-h-screen bg-gray-100 py-10 dark:bg-[#181c23]">
        <div className="mx-auto max-w-4xl rounded-xl bg-[#23272f] p-8 shadow-lg">
          <h1 className="mb-6 text-3xl font-bold text-white">
            Property News & Updates
          </h1>
          <h2 className="mb-4 text-2xl font-semibold text-white">
            Malaysia Property Market News
          </h2>
          {newsLoading ? (
            <p className="text-gray-200">Loading news...</p>
          ) : news.length === 0 ? (
            <div className="text-center">
              <p className="text-gray-200">No news available at the moment.</p>
              <p className="text-sm text-gray-400">Please try again later.</p>
            </div>
          ) : (
            <ul className="space-y-8">
              {news.map((item, idx) => {
                // Try to get image from enclosure or media:content
                const imageUrl =
                  item.enclosure?.url ||
                  (item["media:content"] && item["media:content"]["$"]?.url) ||
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
      </div>
    </>
  );
}
