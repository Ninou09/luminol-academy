import type { NextConfig } from 'next';
import { securityHeaders } from '@luminol/config/security-headers';

const sanityProjectId = process.env.NEXT_PUBLIC_SANITY_PROJECT_ID?.trim();
const sanityDataset = process.env.NEXT_PUBLIC_SANITY_DATASET?.trim();

const nextConfig: NextConfig = {
  transpilePackages: ['@luminol/ui', '@luminol/validation'],
  serverExternalPackages: ['@prisma/client'],
  images: {
    remotePatterns:
      sanityProjectId && sanityDataset
        ? [
            {
              protocol: 'https',
              hostname: 'cdn.sanity.io',
              pathname: `/images/${sanityProjectId}/${sanityDataset}/**`,
            },
          ]
        : [],
  },
  outputFileTracingIncludes: {
    '/*': [
      '../../node_modules/.pnpm/@prisma+client*/node_modules/.prisma/client/**/*',
      '../../node_modules/.pnpm/@prisma+engines*/node_modules/@prisma/engines/**/*',
    ],
  },
  poweredByHeader: false,
  productionBrowserSourceMaps: false,
  async headers() {
    return [{ source: '/(.*)', headers: securityHeaders }];
  },
};
export default nextConfig;
