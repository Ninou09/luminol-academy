import type { Metadata } from 'next';
import type { ReactNode } from 'react';

import { getOrganizationAdminCopy } from '../../lib/organization-localization';
import { getAdminRequestLocale } from '../../lib/request-locale';

export async function generateMetadata(): Promise<Metadata> {
  const locale = await getAdminRequestLocale();
  const copy = getOrganizationAdminCopy(locale);

  return {
    title: copy.metadataTitle,
    robots: { index: false, follow: false },
  };
}

export default function OrganizationsLayout({
  children,
}: {
  children: ReactNode;
}) {
  return children;
}
