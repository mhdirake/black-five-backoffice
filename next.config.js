/** @type {import('next').NextConfig} */

// const withPWA = require("next-pwa")({
//   dest: "public",
// });

const nextConfig = {
  reactStrictMode: false,
  // async rewrites() {
  //   return [

  //   ];
  // },

  // experimental: {
  //   serverActions: true,
  // },
  experimental: {
    missingSuspenseWithCSRBailout: false,
  },

  env: {
    NEXT_PUBLIC_API_URL: process.env.NEXT_PUBLIC_API_URL,
  },

  async rewrites() {
    return [
      {
        source: "/api/client/:path*",
        destination: `${process.env.NEXT_PUBLIC_API_URL}/api/client/:path*`,
      },
      {
        source: "/api/backoffice/:path*",
        destination: `${process.env.NEXT_PUBLIC_API_URL}/api/backoffice/:path*`,
      },
    ];
  },

  async headers() {
    return [
      {
        source: "/api/client/:path*",
        headers: [
          {
            key: "credentials",
            value: "include",
          },
        ],
      },
    ];
  },
};

module.exports = nextConfig;
