import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // typedRoutes: true, // Re-enable after running `pnpm dev` once to generate route types
  reactCompiler: true,
  typedRoutes: false,
};

export default nextConfig;
