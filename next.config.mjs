/** @type {import('next').NextConfig} */
const nextConfig = {
  typescript: {
    ignoreBuildErrors: true,
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
  // Keep API routes running on Node.js runtime (not Edge)
  serverExternalPackages: ['ethers', 'facinet', 'hardhat'],
}

export default nextConfig
