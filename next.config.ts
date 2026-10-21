import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  typedRoutes: true,
  reactStrictMode: true,
  images: {
    formats: ["image/avif", "image/webp"],
  },
  // Three e drei são grandes: importa só o que é usado de cada módulo
  experimental: {
    optimizePackageImports: ["@react-three/drei", "lucide-react"],
  },
};

export default nextConfig;
