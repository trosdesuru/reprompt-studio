import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: '**.e-hentai.org',
      },
      {
        protocol: 'https',
        hostname: 'ehgt.org',
      },
      {
        protocol: 'https',
        hostname: '**.ehgt.org',
      },
      {
        protocol: 'https',
        hostname: '**.hatenablog.com',
      },
      {
        protocol: 'https',
        hostname: '**pub-**.r2.dev',
      },
    ],
    formats: ['image/avif', 'image/webp'],
    minimumCacheTTL: 604800,
  },
};

export default nextConfig;
