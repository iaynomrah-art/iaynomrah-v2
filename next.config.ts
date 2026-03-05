import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Explicitly set the Turbopack root so Next.js
  // doesn't incorrectly infer the workspace root
  // from another lockfile outside this project.
  turbopack: {
    root: process.cwd(),
  },
};

export default nextConfig;
