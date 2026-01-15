import withPWAInit from "@ducanh2912/next-pwa";

const withPWA = withPWAInit({
  dest: "public",
});

/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,

  // Fix images warning
  images: {
    remotePatterns: [
      {
        protocol: "https" as const,
        hostname: "m.media-amazon.com",
      },
    ],
  },

  // Fix Turbopack error
  turbopack: {},
};

export default withPWA(nextConfig);
