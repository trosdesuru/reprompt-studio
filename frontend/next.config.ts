import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // @ts-ignore
  allowedDevOrigins: ["develop.reprompt.studio"],
  typescript: {
    ignoreBuildErrors: true,
  },

  output: "standalone",
  transpilePackages: ["framer-motion"],
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "**pub-**.r2.dev",
      },
    ],
    formats: ["image/avif", "image/webp"],
    minimumCacheTTL: 604800,
  },

  async headers() {
    return [
      {
        source: "/(.*)",
        headers: [
          {
            key: "Cross-Origin-Opener-Policy",
            value: "same-origin-allow-popups",
          },
        ],
      },
    ];
  },
};

export default nextConfig;
