import type { NextConfig } from "next";
import path from "node:path";

const nextConfig: NextConfig = {
  // Pin the workspace root. A stray package-lock.json sits in the parent
  // directory (~/Downloads/ff), which Turbopack would otherwise treat as the
  // root and warn about on every start.
  turbopack: {
    root: path.resolve(__dirname),
  },
  // PGlite ships WASM + data files it loads from its own package directory.
  serverExternalPackages: ["@electric-sql/pglite"],
  // Read at runtime with fs (migrations; seed data for the embedded DB), so
  // they must be traced into the serverless bundle explicitly.
  outputFileTracingIncludes: {
    "/**": ["./drizzle/**/*", "./data/universities/**/*"],
  },
};

export default nextConfig;
