/** @type {import('next').NextConfig} */


const nextConfig = {
  reactStrictMode: true,
  swcMinify: true,
  env: {
    CLIENT_ID: process.env.CLIENT_ID,
    CLIENT_SECRET: process.env.CLIENT_SECRET,
    GOOGLE_CLIENT_ID: process.env.GOOGLE_CLIENT_ID,
    GOOGLE_CLIENT_SECRET: process.env.GOOGLE_CLIENT_SECRET,
    NEXTAUTH_URL: process.env.NEXTAUTH_URL || 'http://localhost:3000',  // Default to localhost if not defined
  },
}

export default nextConfig;
