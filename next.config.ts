import type { NextConfig } from "next"

const nextConfig: NextConfig = {
  serverExternalPackages: ["firebase-admin"],
  reactStrictMode: false,
}

export default nextConfig