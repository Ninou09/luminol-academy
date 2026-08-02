import type { NextConfig } from 'next';
import {
  privateCacheHeaders,
  securityHeaders,
} from '@luminol/config/security-headers';
const nextConfig: NextConfig = {
  transpilePackages: ['@luminol/ui', '@luminol/validation'],
  poweredByHeader: false,
  productionBrowserSourceMaps: false,
  async headers() {
    return [
      { source: '/(.*)', headers: securityHeaders },
      { source: '/((?!sign-in|sign-up).*)', headers: privateCacheHeaders },
    ];
  },
};
export default nextConfig;
