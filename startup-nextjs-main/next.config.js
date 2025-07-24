/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "cdn.sanity.io",
        port: "",
      },
    ],
  },
  async rewrites() {
    return [
      {
        source: "/api/chatbot",
        destination: "http://localhost:4000/api/chatbot",
      },
    ];
  },
};

module.exports = nextConfig;
