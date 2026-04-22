import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  allowedDevOrigins: ["172.28.112.1"],
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "lbrnocjyduanclqvsbnu.supabase.co",
        pathname: "/storage/v1/object/public/**",
      },
    ],
  },
};

export default nextConfig;
