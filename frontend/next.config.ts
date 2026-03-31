import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  images: {
    // 🛡️ SEGURIDAD EN EL BORDE: Patrones permitidos
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
      }
    ],
    // Habilitar formatos modernos reduce el peso un 30% adicional
    formats: ['image/avif', 'image/webp'],
    // Límite de vida de la caché de imágenes optimizadas (7 días)
    minimumCacheTTL: 604800,
  },
};

export default nextConfig;
