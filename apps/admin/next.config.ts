import type { NextConfig } from 'next';

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
};

export default nextConfig;
