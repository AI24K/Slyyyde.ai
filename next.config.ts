import type { NextConfig } from "next";
export default () => {
  const nextConfig: NextConfig = {
    cleanDistDir: true,
    devIndicators: {
      position: "bottom-right",
    },
    experimental: {
      useCache: true,
    },
    env: {
      NO_HTTPS: process.env.NO_HTTPS,
      NEXT_PUBLIC_GOOGLE_CLIENT_ID: process.env.GOOGLE_CLIENT_ID,
      NEXT_PUBLIC_GITHUB_CLIENT_ID: process.env.GITHUB_CLIENT_ID,
    },
    async headers() {
      return [
        {
          // Apply these headers to all routes
          source: "/api/:path*",
          headers: [
            { key: "Access-Control-Allow-Credentials", value: "true" },
            {
              key: "Access-Control-Allow-Origin",
              value: process.env.NEXT_PUBLIC_AUTH_BASE_URL!,
            },
            {
              key: "Access-Control-Allow-Methods",
              value: "GET,DELETE,PATCH,POST,PUT,OPTIONS",
            },
            {
              key: "Access-Control-Allow-Headers",
              value:
                "X-CSRF-Token, X-Requested-With, Accept, Accept-Version, Content-Length, Content-MD5, Content-Type, Date, X-Api-Version, Authorization",
            },
          ],
        },
      ];
    },
  };
  return nextConfig;
};
