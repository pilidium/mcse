import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  async headers() {
    return [
      {
        source: "/.well-known/assetlinks.json",
        headers: [
          { key: "Content-Type", value: "application/json" },
          { key: "Access-Control-Allow-Origin", value: "*" },
          { key: "Cache-Control", value: "public, max-age=3600, must-revalidate" },
        ],
      },
    ];
  },
  // Fallback: if Next.js 16 doesn't resolve the dotted `app/.well-known/`
  // directory, rewrite the request to the regular /api/assetlinks handler.
  async rewrites() {
    return [
      { source: "/.well-known/assetlinks.json", destination: "/api/assetlinks" },
    ];
  },
};

export default nextConfig;
