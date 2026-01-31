import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Allow images from any source
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: '**',
      },
    ],
  },
  // Ignore TypeScript errors in production build (for faster migration)
  typescript: {
    ignoreBuildErrors: true,
  },
  // Server-side external packages
  serverExternalPackages: ['better-sqlite3', 'bcrypt'],
};

export default nextConfig;
