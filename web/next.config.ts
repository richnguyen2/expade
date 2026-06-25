import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // standalone output is needed for Docker; Vercel handles its own bundling
  ...(process.env.NEXT_STANDALONE === "true" && { output: "standalone" }),
};

export default nextConfig;
