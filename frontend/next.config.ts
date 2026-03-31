import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  images: {
    remotePatterns: [
      { protocol: "https", hostname: "media.kitsu.io", port: "", pathname: "/**" },
      { protocol: "https", hostname: "**.e-hentai.org", port: "", pathname: "/**" },
      { protocol: "https", hostname: "**.hatenablog.com", port: "", pathname: "/**" },
    ],
  },
};

export default nextConfig;
