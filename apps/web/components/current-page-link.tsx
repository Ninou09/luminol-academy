'use client';

import { parseLocalizedPathname } from '@luminol/localization';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import type { ReactNode } from 'react';

type CurrentPageLinkProps = {
  href: string;
  activePathname: string;
  children: ReactNode;
  className?: string | undefined;
  ariaLabel?: string | undefined;
  matchDescendants?: boolean | undefined;
};

export function CurrentPageLink({
  href,
  activePathname,
  children,
  className,
  ariaLabel,
  matchDescendants = false,
}: CurrentPageLinkProps) {
  const pathname = usePathname();
  const parsed = parseLocalizedPathname(pathname);
  const currentPathname = parsed?.pathname ?? pathname;
  const isCurrent =
    currentPathname === activePathname ||
    (matchDescendants && currentPathname.startsWith(`${activePathname}/`));

  return (
    <Link
      href={href}
      className={className}
      aria-label={ariaLabel}
      aria-current={isCurrent ? 'page' : undefined}
    >
      {children}
    </Link>
  );
}
