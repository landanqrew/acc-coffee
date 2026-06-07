import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Pin the workspace root — a stray lockfile in the home directory otherwise
  // makes Turbopack mis-infer it.
  turbopack: {
    root: __dirname,
  },
};

export default nextConfig;
