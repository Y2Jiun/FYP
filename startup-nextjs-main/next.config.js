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
  webpack: (config, { isServer }) => {
    // Handle tesseract.js worker files
    if (!isServer) {
      config.resolve.fallback = {
        ...config.resolve.fallback,
        fs: false,
        path: false,
        os: false,
      };
    }
    
    // Handle WASM files for tesseract.js
    config.module.rules.push({
      test: /\.wasm$/,
      type: 'asset/resource',
    });

    return config;
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
