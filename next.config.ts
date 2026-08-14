import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  experimental: {
    optimizePackageImports: [
      "@tanstack/react-query",
      "@tanstack/react-query-persist-client",
    ],
  },
};

export default nextConfig;
