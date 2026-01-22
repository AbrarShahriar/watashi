import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "preview.redd.it",
        port: "",
        pathname: "**",
      },
      {
        protocol: "https",
        hostname: "external-preview.redd.it",
        port: "",
        pathname: "**",
      },
    ],
  },
};

export default nextConfig;
