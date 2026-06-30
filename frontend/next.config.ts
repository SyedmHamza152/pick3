import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  /* config options here */
  reactCompiler: true,
  // output: 'export', // Removed to fix mobile routing issues
  trailingSlash: true,
  images: {
    unoptimized: true,
  },
};

export default nextConfig;
