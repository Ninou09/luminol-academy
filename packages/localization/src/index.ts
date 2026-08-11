import { z } from 'zod';

export const SUPPORTED_LOCALES = ['ar', 'fr', 'en'] as const;
export const localeSchema = z.enum(SUPPORTED_LOCALES);
export type Locale = z.infer<typeof localeSchema>;
export type TextDirection = 'ltr' | 'rtl';

export const DEFAULT_LOCALE: Locale = 'en';
export const LOCALE_REQUEST_HEADER = 'x-luminol-locale';

export type LocaleDefinition = {
  code: Locale;
  nativeLabel: string;
  direction: TextDirection;
  intlTag: string;
};

export const LOCALE_DEFINITIONS = {
  ar: {
    code: 'ar',
    nativeLabel: 'العربية',
    direction: 'rtl',
    intlTag: 'ar-DZ',
  },
  fr: {
    code: 'fr',
    nativeLabel: 'Français',
    direction: 'ltr',
    intlTag: 'fr-DZ',
  },
  en: {
    code: 'en',
    nativeLabel: 'English',
    direction: 'ltr',
    intlTag: 'en-DZ',
  },
} as const satisfies Record<Locale, LocaleDefinition>;

export type CommonDictionary = {
  languageSelectorLabel: string;
  localeNames: Record<Locale, string>;
  actions: {
    search: string;
    apply: string;
    clear: string;
    save: string;
    cancel: string;
  };
};

export const COMMON_DICTIONARIES = {
  ar: {
    languageSelectorLabel: 'لغة الواجهة',
    localeNames: {
      ar: 'العربية',
      fr: 'الفرنسية',
      en: 'الإنجليزية',
    },
    actions: {
      search: 'بحث',
      apply: 'تطبيق',
      clear: 'مسح',
      save: 'حفظ',
      cancel: 'إلغاء',
    },
  },
  fr: {
    languageSelectorLabel: 'Langue de l’interface',
    localeNames: {
      ar: 'Arabe',
      fr: 'Français',
      en: 'Anglais',
    },
    actions: {
      search: 'Rechercher',
      apply: 'Appliquer',
      clear: 'Effacer',
      save: 'Enregistrer',
      cancel: 'Annuler',
    },
  },
  en: {
    languageSelectorLabel: 'Interface language',
    localeNames: {
      ar: 'Arabic',
      fr: 'French',
      en: 'English',
    },
    actions: {
      search: 'Search',
      apply: 'Apply',
      clear: 'Clear',
      save: 'Save',
      cancel: 'Cancel',
    },
  },
} as const satisfies Record<Locale, CommonDictionary>;

export function parseLocale(
  value: unknown,
  fallback: Locale = DEFAULT_LOCALE,
): Locale {
  const normalized =
    typeof value === 'string' ? value.trim().toLowerCase() : value;
  const parsed = localeSchema.safeParse(normalized);
  return parsed.success ? parsed.data : fallback;
}

export function getLocaleDirection(locale: Locale): TextDirection {
  return LOCALE_DEFINITIONS[locale].direction;
}

export function getIntlLocale(locale: Locale): string {
  return LOCALE_DEFINITIONS[locale].intlTag;
}

export function getOpenGraphLocale(locale: Locale): string {
  return getIntlLocale(locale).replace('-', '_');
}

export function getCommonDictionary(locale: Locale): CommonDictionary {
  return COMMON_DICTIONARIES[locale];
}

export type LocalizedPathname = {
  locale: Locale;
  pathname: string;
};

export function parseLocalizedPathname(
  pathname: string,
): LocalizedPathname | null {
  const match = /^\/(ar|fr|en)(?=\/|$)/i.exec(pathname);
  if (!match) return null;

  const locale = parseLocale(match[1]);
  const prefix = `/${match[1]}`;
  const rest = pathname.slice(prefix.length);

  return {
    locale,
    pathname: rest.length === 0 ? '/' : rest,
  };
}

export function localizePathname(locale: Locale, pathname: string): string {
  const parsed = parseLocalizedPathname(pathname);
  const basePathname = parsed?.pathname ?? pathname;
  const safePathname = basePathname.startsWith('/') ? basePathname : '/';
  return safePathname === '/' ? `/${locale}` : `/${locale}${safePathname}`;
}

export function localizeHref(locale: Locale, href: string): string {
  if (!href.startsWith('/') || href.startsWith('//')) return href;

  try {
    const url = new URL(href, 'https://luminol.local');
    return `${localizePathname(locale, url.pathname)}${url.search}${url.hash}`;
  } catch {
    return localizePathname(locale, '/');
  }
}

export function buildLanguageAlternates(
  pathname: string,
): Record<Locale | 'x-default', string> {
  return {
    ar: localizePathname('ar', pathname),
    fr: localizePathname('fr', pathname),
    en: localizePathname('en', pathname),
    'x-default': localizePathname(DEFAULT_LOCALE, pathname),
  };
}

function containsControlCharacters(value: string): boolean {
  return Array.from(value).some((character) => {
    const codePoint = character.codePointAt(0);
    return codePoint !== undefined && (codePoint <= 0x1f || codePoint === 0x7f);
  });
}

export function sanitizeInternalReturnTo(
  value: unknown,
  fallback = '/',
): string {
  if (typeof value !== 'string' || value.length > 2048) return fallback;

  const candidate = value.trim();
  if (
    !candidate.startsWith('/') ||
    candidate.startsWith('//') ||
    candidate.includes('\\') ||
    containsControlCharacters(candidate)
  ) {
    return fallback;
  }

  try {
    const url = new URL(candidate, 'https://luminol.local');
    if (url.origin !== 'https://luminol.local') return fallback;

    const normalizedPathname = url.pathname;
    if (normalizedPathname.startsWith('//')) return fallback;

    const decodedPathname = decodeURIComponent(normalizedPathname);
    if (
      decodedPathname.startsWith('//') ||
      decodedPathname.includes('\\') ||
      containsControlCharacters(decodedPathname)
    ) {
      return fallback;
    }

    return `${normalizedPathname}${url.search}${url.hash}`;
  } catch {
    return fallback;
  }
}

export function formatLocalizedDate(
  value: Date | number | string,
  locale: Locale,
  options: Intl.DateTimeFormatOptions = {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
  },
): string {
  const date = value instanceof Date ? value : new Date(value);
  if (Number.isNaN(date.getTime())) {
    throw new RangeError('Invalid date value');
  }

  return new Intl.DateTimeFormat(getIntlLocale(locale), options).format(date);
}

export function formatLocalizedNumber(
  value: number,
  locale: Locale,
  options?: Intl.NumberFormatOptions,
): string {
  if (!Number.isFinite(value)) {
    throw new RangeError('Number must be finite');
  }

  return new Intl.NumberFormat(getIntlLocale(locale), options).format(value);
}

export function formatLocalizedCurrency(
  minorUnits: number,
  currency: string,
  locale: Locale,
): string {
  if (!Number.isInteger(minorUnits)) {
    throw new RangeError('Currency minor units must be an integer');
  }

  const normalizedCurrency = currency.trim().toUpperCase();
  if (!/^[A-Z]{3}$/.test(normalizedCurrency)) {
    throw new RangeError('Currency must be a three-letter ISO code');
  }

  const formatter = new Intl.NumberFormat(getIntlLocale(locale), {
    style: 'currency',
    currency: normalizedCurrency,
  });
  const fractionDigits = formatter.resolvedOptions().maximumFractionDigits;
  if (fractionDigits === undefined) {
    throw new RangeError(
      `Unable to determine currency precision for ${normalizedCurrency}`,
    );
  }

  const majorUnits = minorUnits / 10 ** fractionDigits;
  return formatter.format(majorUnits);
}

export const LOCALE_COOKIE_NAME = 'luminol_locale';
export const LOCALE_COOKIE_MAX_AGE_SECONDS = 60 * 60 * 24 * 365;

export type LocaleRoutingOptions = {
  bypassPrefixes?: readonly string[];
  bypassExact?: readonly string[];
};

export type LocaleRoutingDecision =
  | { kind: 'bypass' }
  | { kind: 'rewrite'; locale: Locale; pathname: string }
  | { kind: 'redirect'; locale: Locale; pathname: string };

function matchesPathPrefix(pathname: string, prefix: string): boolean {
  return pathname === prefix || pathname.startsWith(`${prefix}/`);
}

function shouldBypassLocaleRouting(
  pathname: string,
  options: LocaleRoutingOptions,
): boolean {
  if (options.bypassExact?.includes(pathname)) return true;
  return Boolean(
    options.bypassPrefixes?.some((prefix) =>
      matchesPathPrefix(pathname, prefix),
    ),
  );
}

export function resolveLocaleRequest(
  pathname: string,
  storedLocale: unknown,
  options: LocaleRoutingOptions = {},
): LocaleRoutingDecision {
  const safePathname = pathname.startsWith('/') ? pathname : '/';

  if (shouldBypassLocaleRouting(safePathname, options)) {
    return { kind: 'bypass' };
  }

  const localized = parseLocalizedPathname(safePathname);
  if (localized) {
    if (shouldBypassLocaleRouting(localized.pathname, options)) {
      return { kind: 'bypass' };
    }

    const rawLocaleSegment = safePathname.split('/')[1] ?? '';
    const canonicalPathname = localizePathname(
      localized.locale,
      localized.pathname,
    );

    if (rawLocaleSegment !== localized.locale) {
      return {
        kind: 'redirect',
        locale: localized.locale,
        pathname: canonicalPathname,
      };
    }

    return {
      kind: 'rewrite',
      locale: localized.locale,
      pathname: localized.pathname,
    };
  }

  const locale = parseLocale(storedLocale);
  return {
    kind: 'redirect',
    locale,
    pathname: localizePathname(locale, safePathname),
  };
}
