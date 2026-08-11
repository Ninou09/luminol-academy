import { colors } from '@luminol/config/tailwind';
import type { MetadataRoute } from 'next';

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: 'Luminol Academy',
    short_name: 'Luminol',
    description:
      'Psychology, languages and professional training in one human-centered learning ecosystem.',
    start_url: '/',
    display: 'standalone',
    background_color: colors.canvas,
    theme_color: colors.ink,
    icons: [
      {
        src: '/favicon.ico',
        sizes: 'any',
        type: 'image/x-icon',
      },
      {
        src: '/icon.svg',
        sizes: 'any',
        type: 'image/svg+xml',
      },
      {
        src: '/apple-touch-icon.png',
        sizes: '180x180',
        type: 'image/png',
      },
    ],
  };
}
