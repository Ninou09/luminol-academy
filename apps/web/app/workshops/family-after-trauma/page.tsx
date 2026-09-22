import type { Metadata } from 'next';

import {
  buildWorkshopRegistrationHref,
  type WorkshopSearchParams,
} from '../../../lib/workshop-attribution';
import { WorkshopExperience } from './workshop-experience';

const route = '/ar/workshops/family-after-trauma';
const title = 'الأسرة بعد الصدمة النفسية: كيف نفهم ونساند؟';
const description =
  'لقاء توعوي مجاني من أكاديمية لومينول مع الأستاذة خداوي فطومة، الجمعة 25 سبتمبر 2026 الساعة 20:00 بتوقيت الجزائر.';

export const metadata: Metadata = {
  title,
  description,
  alternates: { canonical: route },
  openGraph: {
    title,
    description,
    type: 'website',
    url: route,
    siteName: 'Luminol Academy',
    locale: 'ar_DZ',
  },
  twitter: {
    card: 'summary_large_image',
    title,
    description,
  },
};

type PageProps = {
  searchParams: Promise<WorkshopSearchParams>;
};

export default async function WorkshopPage({ searchParams }: PageProps) {
  const registrationHref = buildWorkshopRegistrationHref(await searchParams);

  return <WorkshopExperience registrationHref={registrationHref} />;
}
