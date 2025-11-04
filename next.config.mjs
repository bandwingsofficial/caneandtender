import path from "path"

/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,

  // 👇 serve /public/uploads even in production
  async rewrites() {
    return [
      {
        source: "/uploads/:path*",
        destination: "/uploads/:path*", // still from public folder
      },
    ]
  },

  // 👇 ensure uploads are served from disk
  experimental: {
    serverActions: { allowedOrigins: ["localhost:3000"] },
  },

  webpack(config) {
    config.resolve.alias["@uploads"] = path.resolve("./public/uploads")
    return config
  },
}

export default nextConfig
