import type { NextConfig } from 'next';
const nextConfig: NextConfig = {
  transpilePackages: ['@luminol/ui', '@luminol/validation'],
  poweredByHeader: false,
};
export default nextConfig;
