import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  /* config options here */
  output: "standalone",
  env: {
    NEXT_PUBLIC_APPPERM_API_URL:
      process.env.NEXT_PUBLIC_APPPERM_API_URL || "http://localhost:8000",
    NEXT_PUBLIC_PHISHING_API_URL:
      process.env.NEXT_PUBLIC_PHISHING_API_URL || "http://localhost:8001",
    NEXT_PUBLIC_PASSWORD_API_URL:
      process.env.NEXT_PUBLIC_PASSWORD_API_URL || "http://localhost:8002",
    NEXT_PUBLIC_SOCIAL_API_URL:
      process.env.NEXT_PUBLIC_SOCIAL_API_URL || "http://localhost:8003",
    NEXT_PUBLIC_DEVICE_API_URL:
      process.env.NEXT_PUBLIC_DEVICE_API_URL || "http://localhost:8004",
  },
};

export default nextConfig;
