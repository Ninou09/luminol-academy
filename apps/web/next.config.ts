import type { NextConfig } from 'next';
import { publicWebsiteSecurityHeaders } from '@luminol/config/security-headers';

const sanityProjectId = process.env.NEXT_PUBLIC_SANITY_PROJECT_ID?.trim();
const sanityDataset =
  process.env.NEXT_PUBLIC_SANITY_DATASET?.trim() || 'production';

const nextConfig: NextConfig = {
  transpilePackages: ['@luminol/ui', '@luminol/validation'],
  serverExternalPackages: ['@prisma/client'],
  images: {
    remotePatterns: sanityProjectId
      ? [
          {
            protocol: 'https',
            hostname: 'cdn.sanity.io',
            pathname: `/images/${sanityProjectId}/${sanityDataset}/**`,
          },
        ]
      : [],
  },
  poweredByHeader: false,
  productionBrowserSourceMaps: false,
  async headers() {
    return [{ source: '/(.*)', headers: publicWebsiteSecurityHeaders }];
  },
};
export default nextConfig;
