import {
  buildLanguageAlternates,
  getOpenGraphLocale,
  localizePathname,
  type Locale,
} from '@luminol/localization';
import type { Metadata } from 'next';

import { getSocialPreviewImage } from './social-preview-metadata';

import type { SearchCopy } from './public-seo';

export function buildPublicMetadata(
  locale: Locale,
  pathname: string,
  { title, description }: SearchCopy,
  options?: { profileImage?: string; noindex?: boolean },
): Metadata {
  const route = localizePathname(locale, pathname);
  const image = options?.profileImage ?? getSocialPreviewImage(locale);
  const socialTitle = `${title} | Luminol Academy`;
  return {
    title: pathname === '/' ? { absolute: socialTitle } : title,
    description,
    alternates: {
      canonical: route,
      languages: buildLanguageAlternates(pathname),
    },
    ...(options?.noindex ? { robots: { index: false, follow: true } } : {}),
    openGraph: {
      title: socialTitle,
      description,
      siteName: 'Luminol Academy',
      locale: getOpenGraphLocale(locale),
      type: options?.profileImage ? 'profile' : 'website',
      url: route,
      images: [image],
    },
    twitter: {
      card: 'summary_large_image',
      title: socialTitle,
      description,
      images: [image],
    },
  };
}
