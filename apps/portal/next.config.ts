import type { NextConfig } from 'next';
import {
  portalProtectedResponseSource,
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
      {
        source: portalProtectedResponseSource,
        headers: privateCacheHeaders,
      },
    ];
  },
};
export default nextConfig;
