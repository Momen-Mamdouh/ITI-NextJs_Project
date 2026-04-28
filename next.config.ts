import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  reactStrictMode: true,
  serverExternalPackages: ["mongoose"],
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "res.cloudinary.com",
        pathname: "/**",
      },

      {
        protocol: "https",
        hostname: "**.google.com",
        pathname: "/**",
      },
      {
        protocol: "https",
        hostname: "**.googleusercontent.com",
        pathname: "/**",
      },

      {
        protocol: "https",
        hostname: "**.stripe.com",
        pathname: "/**",
      },

      {
        protocol: "https",
        hostname: "www.madraslinkonline.com.au",
        pathname: "/**",
      },
      { protocol: "https", hostname: "picsum.photos" },
      // Generic wildcard for testing (use with caution in production)
      // { protocol: "https", hostname: "**" },
    ],
  },
  typescript: {
    ignoreBuildErrors: true,
  },
};

export default nextConfig;
