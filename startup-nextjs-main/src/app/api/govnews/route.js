import RSSParser from "rss-parser";

// Add more property-related RSS feed URLs here
const feeds = [
  "https://www.edgeprop.my/rss",
  "https://www.propertyguru.com.my/news/rss",
  "https://www.thestar.com.my/rss/business.xml",
  "https://www.nst.com.my/rss/1",
  // "https://www.pmo.gov.my/rss/", // (optional: keep government news)
];

export async function GET(req) {
  const parser = new RSSParser();
  let allItems = [];
  for (const url of feeds) {
    try {
      const feed = await parser.parseURL(url);
      allItems = allItems.concat(feed.items);
    } catch (e) {
      // Ignore errors for individual feeds, continue with others
    }
  }
  return new Response(JSON.stringify(allItems), {
    status: 200,
    headers: { "Content-Type": "application/json" },
  });
}
