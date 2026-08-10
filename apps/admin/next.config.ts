import type { NextConfig } from 'next';
import {
  adminProtectedResponseSource,
  privateCacheHeaders,
  securityHeaders,
} from '@luminol/config/security-headers';

const nextConfig: NextConfig = {
  transpilePackages: ['@luminol/ui', '@luminol/validation'],
  serverExternalPackages: ['@prisma/client'],
  poweredByHeader: false,
  productionBrowserSourceMaps: false,
  async headers() {
    return [
      { source: '/(.*)', headers: securityHeaders },
      {
        source: adminProtectedResponseSource,
        headers: privateCacheHeaders,
      },
    ];
  },
};

export default nextConfig;
