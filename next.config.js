/** @type {import('next').NextConfig} */
const nextConfig = {
  // output: "export",
  reactStrictMode: false,
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "i.imghippo.com",
        port: "",
        pathname: "/files/**",
      },
    ],
  },
};

module.exports = nextConfig;
