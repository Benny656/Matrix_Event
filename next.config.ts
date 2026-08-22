import type { NextConfig } from "next"

const nextConfig: NextConfig = {
  serverExternalPackages: ["firebase-admin", "jwks-rsa", "jose"],
  reactStrictMode: false,
  experimental: {
    turbo: {
      rules: {}
    }
  }
}

export default nextConfig