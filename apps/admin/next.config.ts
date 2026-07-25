import type { NextConfig } from 'next';
const nextConfig: NextConfig = {
  transpilePackages: ['@luminol/ui', '@luminol/validation'],
  serverExternalPackages: ['@prisma/client', '@prisma/adapter-pg'],
  poweredByHeader: false,
};
export default nextConfig;
