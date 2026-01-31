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
  // Server-side external packages (none needed for Supabase)
};

export default nextConfig;
