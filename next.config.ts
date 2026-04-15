import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "images.unsplash.com",
      },
      {
        protocol: "https",
        hostname: "pub-bebb81dbae7d4512aa92c717a395c19d.r2.dev",
      },
    ],
  },
};

export default nextConfig;
