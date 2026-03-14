/** @type {import('next').NextConfig} */
const nextConfig = {
  typescript: {
    ignoreBuildErrors: true,
  },
  eslint: {
    ignoreDuringBuilds: true,
  },
  images: {
    unoptimized: true,
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'hebbkx1anhila5yf.public.blob.vercel-storage.com',
      },
    ],
  },
  // Allow server-action / API routes to use Node.js built-ins (fs, path, crypto, ethers)
  experimental: {
    serverComponentsExternalPackages: ['ethers', 'facinet', 'hardhat'],
  },
  // Keep API routes running on Node.js runtime (not Edge)
  serverExternalPackages: ['ethers', 'facinet'],
}

export default nextConfig
