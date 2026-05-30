import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // pdf-parse / mammoth are Node-only; keep them external to the server bundle.
  serverExternalPackages: ["pdf-parse", "mammoth", "mongoose", "nylas"],
};

export default nextConfig;
