/** @type {import('next').NextConfig} */
const nextConfig = {
  // Enable strict mode for improved error detection in development
  reactStrictMode: true,
  
  // Optimize production builds
  swcMinify: true,
};

module.exports = nextConfig;
