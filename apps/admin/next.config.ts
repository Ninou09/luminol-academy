import type { NextConfig } from 'next';
import {
  adminProtectedResponseSource,
  privateCacheHeaders,
  securityHeaders,
} from '@luminol/config/security-headers';

const nextConfig: NextConfig = {
  transpilePackages: ['@luminol/ui', '@luminol/validation'],
  serverExternalPackages: ['@prisma/client'],
  outputFileTracingIncludes: {
    '/*': [
      '../../node_modules/.pnpm/@prisma+client*/node_modules/.prisma/client/**/*',
      '../../node_modules/.pnpm/@prisma+engines*/node_modules/@prisma/engines/**/*',
    ],
  },
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
