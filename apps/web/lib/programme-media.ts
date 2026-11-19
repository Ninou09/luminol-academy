import type { Locale } from '@luminol/localization';

import { academyStoryMedia, type AcademyAssetKey } from './academy-media';
import { isProgrammeWaitlist } from './programme-presentation';
import { buildSanityProgrammeImageUrl, type CmsProgramme } from './sanity';
import type { SchoolSlug } from './schools';
import { stockMedia, type StockAsset } from './stock-media';

export type ProgrammeMediaTopic =
  | 'therapy'
  | 'family'
  | 'coaching'
  | 'psychology-workshop'
  | 'english'
  | 'french'
  | 'fluency'
  | 'communication'
  | 'leadership'
  | 'professional-communication'
  | 'digital-skills'
  | 'corporate-workshop';

export type ProgrammeMediaInput = Pick<CmsProgramme, 'image' | 'slug'> & {
  school: SchoolSlug;
  mediaTopic?: ProgrammeMediaTopic | undefined;
};

type BranchMedia =
  | { kind: 'stock'; asset: StockAsset }
  | { kind: 'illustration'; asset: AcademyAssetKey };

const topicMedia: Record<ProgrammeMediaTopic, BranchMedia> = {
  therapy: { kind: 'stock', asset: 'consultation' },
  family: { kind: 'illustration', asset: 'parenting' },
  coaching: { kind: 'stock', asset: 'reflection' },
  'psychology-workshop': { kind: 'illustration', asset: 'psychology' },
  english: { kind: 'stock', asset: 'english' },
  french: { kind: 'stock', asset: 'french' },
  fluency: { kind: 'stock', asset: 'community' },
  communication: { kind: 'stock', asset: 'speaking' },
  leadership: { kind: 'illustration', asset: 'training' },
  'professional-communication': { kind: 'stock', asset: 'speaking' },
  'digital-skills': { kind: 'stock', asset: 'online' },
  'corporate-workshop': { kind: 'illustration', asset: 'atelier' },
};

const schoolMedia: Record<SchoolSlug, BranchMedia> = {
  psychology: { kind: 'stock', asset: 'consultation' },
  languages: { kind: 'illustration', asset: 'lounge' },
  training: { kind: 'illustration', asset: 'atelier' },
};

const slugTopics: ReadonlyArray<readonly [RegExp, ProgrammeMediaTopic]> = [
  [/(?:^|-)(?:english|ielts|toefl)(?:-|$)/, 'english'],
  [/(?:^|-)(?:french|francais|delf|dalf)(?:-|$)/, 'french'],
  [/(?:^|-)(?:family|parenting|child)(?:-|$)/, 'family'],
  [/(?:^|-)(?:coaching|mindfulness)(?:-|$)/, 'coaching'],
  [/(?:^|-)(?:therapy|consultation|counselling)(?:-|$)/, 'therapy'],
  [/(?:^|-)(?:leadership|management)(?:-|$)/, 'leadership'],
  [/(?:^|-)(?:digital|productivity|online)(?:-|$)/, 'digital-skills'],
  [/(?:^|-)(?:speaking|presentation|communication)(?:-|$)/, 'communication'],
  [/(?:^|-)(?:fluency|conversation)(?:-|$)/, 'fluency'],
];

/** Resolves only reviewed assets; no image search or unapproved CMS URL is used. */
export function resolveProgrammeMedia(
  programme: ProgrammeMediaInput,
  locale: Locale,
) {
  const slug = programme.slug?.current.trim().toLowerCase() ?? '';
  const isWaitlist = isProgrammeWaitlist(slug);

  // A waitlist must never reuse a previous cohort's poster or dated imagery.
  if (!isWaitlist && programme.image) {
    return {
      kind: 'sanity' as const,
      src: buildSanityProgrammeImageUrl(programme.image),
      alt: programme.image.alt,
      source: 'sanity' as const,
      sourceUrl: programme.image.url,
      crop: JSON.stringify({
        crop: programme.image.crop ?? null,
        hotspot: programme.image.hotspot ?? null,
      }),
      publicationApproved: true as const,
    };
  }

  const topic =
    programme.mediaTopic ??
    slugTopics.find(([pattern]) => pattern.test(slug))?.[1];
  const selected: BranchMedia = isWaitlist
    ? { kind: 'stock', asset: 'reflection' }
    : topic
      ? topicMedia[topic]
      : schoolMedia[programme.school];

  if (selected.kind === 'stock') {
    const media = stockMedia[selected.asset];
    return {
      ...selected,
      src: media.src,
      alt: media.alt[locale],
      sourceUrl: media.sourceUrl,
      crop: `${media.crop}; cover; focal point ${media.position}`,
    };
  }

  const media = academyStoryMedia[selected.asset];
  return {
    ...selected,
    src: media.src,
    alt: media.alt[locale],
    sourceUrl: media.sourceUrl,
    crop: media.crop,
  };
}
