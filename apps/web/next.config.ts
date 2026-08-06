import type { NextConfig } from 'next';
import { securityHeaders } from '@luminol/config/security-headers';

const sanityProjectId = process.env.NEXT_PUBLIC_SANITY_PROJECT_ID?.trim();
const sanityDataset =
  process.env.NEXT_PUBLIC_SANITY_DATASET?.trim() || 'production';

const remotePatterns: Exclude<
  NonNullable<NextConfig['images']>['remotePatterns'],
  undefined
> = [
  {
    protocol: 'https',
    hostname: 'images.unsplash.com',
    pathname: '/**',
  },
];

if (sanityProjectId) {
  remotePatterns.push({
    protocol: 'https',
    hostname: 'cdn.sanity.io',
    pathname: `/images/${sanityProjectId}/${sanityDataset}/**`,
  });
}

const nextConfig: NextConfig = {
  transpilePackages: ['@luminol/ui', '@luminol/validation'],
  serverExternalPackages: ['@prisma/client'],
  images: {
    remotePatterns,
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
