import type { NextConfig } from "next";
import path from "node:path";

const nextConfig: NextConfig = {
  // Pin the workspace root. A stray package-lock.json sits in the parent
  // directory (~/Downloads/ff), which Turbopack would otherwise treat as the
  // root and warn about on every start.
  turbopack: {
    root: path.resolve(__dirname),
  },
};

export default nextConfig;
