import type { NextConfig } from "next";

import { getSecurityHeaders } from "./src/lib/security/headers";

const nextConfig: NextConfig = {
  experimental: {
    serverActions: {
      // Listing images upload one file per action (max 5MB each).
      bodySizeLimit: "6mb",
    },
  },
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "**.supabase.co",
        pathname: "/storage/v1/object/public/**",
      },
    ],
  },
  async headers() {
    return [
      {
        source: "/(.*)",
        headers: getSecurityHeaders(),
      },
    ];
  },
};

export default nextConfig;
