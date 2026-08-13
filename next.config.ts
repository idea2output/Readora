import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Ensure all packages are bundled for Cloudflare Workers (no runtime external imports)
  bundlePagesRouterDependencies: true,
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'picsum.photos',
      },
      {
        protocol: 'https',
        hostname: 'images.unsplash.com',
      },
      {
        protocol: 'https',
        hostname: 'www.gutenberg.org',
      }
    ],
    unoptimized: true,
  },
};

export default nextConfig;
