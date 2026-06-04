import type { NextConfig } from "next";

import { getSecurityHeaders } from "./src/lib/security/headers";

const nextConfig: NextConfig = {
  experimental: {
    serverActions: {
      // Listing metadata only; images upload direct to Supabase from the browser.
      bodySizeLimit: "2mb",
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
