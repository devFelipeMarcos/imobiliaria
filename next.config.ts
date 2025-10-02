import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  eslint: {
    ignoreDuringBuilds: true,
  },
  typescript: {
    ignoreBuildErrors: true,
  },
  webpack: (config) => {
    config.watchOptions = {
      ignored: [
        "**/node_modules/**",
        "C:/Users/Felipe/Ambiente de Rede/**",
        "C:/Users/Felipe/Ambiente de Impressão/**",
      ],
    };
    return config;
  },
};

export default nextConfig;
