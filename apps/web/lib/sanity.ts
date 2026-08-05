import { z } from 'zod';
import type { SchoolSlug } from './schools';

const SANITY_API_VERSION = '2024-01-01';
const PROGRAMME_IMAGE_WIDTH = 1200;
const PROGRAMME_IMAGE_HEIGHT = 675;
const placeholderProjectIds = new Set([
  'example',
  'placeholder',
  'replace-me',
]);

function isApprovedSanityImageUrl(value: string) {
  try {
    const url = new URL(value);
    return url.protocol === 'https:' && url.hostname === 'cdn.sanity.io';
  } catch {
    return false;
  }
}

const fractionSchema = z.number().finite().min(0).max(1);

const imageCropSchema = z
  .object({
    top: fractionSchema,
    bottom: fractionSchema,
    left: fractionSchema,
    right: fractionSchema,
  })
  .superRefine((crop, context) => {
    if (crop.left + crop.right >= 1) {
      context.addIssue({
        code: 'custom',
        message: 'Horizontal image crop must leave visible pixels.',
      });
    }
    if (crop.top + crop.bottom >= 1) {
      context.addIssue({
        code: 'custom',
        message: 'Vertical image crop must leave visible pixels.',
      });
    }
  });

const imageHotspotSchema = z
  .object({
    x: fractionSchema,
    y: fractionSchema,
    width: z.number().finite().positive().max(1),
    height: z.number().finite().positive().max(1),
  })
  .superRefine((hotspot, context) => {
    if (
      hotspot.x - hotspot.width / 2 < 0 ||
      hotspot.x + hotspot.width / 2 > 1
    ) {
      context.addIssue({
        code: 'custom',
        message: 'Image hotspot must stay within horizontal image bounds.',
      });
    }
    if (
      hotspot.y - hotspot.height / 2 < 0 ||
      hotspot.y + hotspot.height / 2 > 1
    ) {
      context.addIssue({
        code: 'custom',
        message: 'Image hotspot must stay within vertical image bounds.',
      });
    }
  });

const cmsProgrammeImageSchema = z
  .object({
    url: z
      .string()
      .trim()
      .url()
      .refine(isApprovedSanityImageUrl, 'Programme images must use Sanity CDN.'),
    alt: z.string().trim().min(3).max(180),
    crop: imageCropSchema.nullish(),
    hotspot: imageHotspotSchema.nullish(),
    dimensions: z.object({
      width: z.number().int().positive().max(100_000),
      height: z.number().int().positive().max(100_000),
    }),
  })
  .superRefine((image, context) => {
    const crop = image.crop ?? { top: 0, bottom: 0, left: 0, right: 0 };
    const editorLeft = Math.ceil(crop.left * image.dimensions.width);
    const editorTop = Math.ceil(crop.top * image.dimensions.height);
    const editorRight = Math.floor(
      (1 - crop.right) * image.dimensions.width,
    );
    const editorBottom = Math.floor(
      (1 - crop.bottom) * image.dimensions.height,
    );

    if (editorRight <= editorLeft || editorBottom <= editorTop) {
      context.addIssue({
        code: 'custom',
        message:
          'Programme image crop must leave a non-empty integer pixel rectangle.',
      });
    }
  });

const cmsProgrammeSchema = z.object({
  _id: z.string().min(1),
  title: z.string().trim().min(1).max(120),
  summary: z.string().trim().min(1).max(320),
  slug: z.object({ current: z.string().min(1) }).nullish(),
  delivery: z.string().trim().max(80).nullish(),
  featured: z.boolean().default(false),
  image: cmsProgrammeImageSchema.nullish(),
});

const cmsProgrammeListSchema = z.array(cmsProgrammeSchema).max(100);

export type CmsProgramme = z.infer<typeof cmsProgrammeSchema>;

type ProgrammeImage = NonNullable<CmsProgramme['image']>;

type SanityConfig = {
  projectId: string;
  dataset: string;
};

function clamp(value: number, minimum: number, maximum: number) {
  return Math.min(maximum, Math.max(minimum, value));
}

function placeCropAxis({
  minimum,
  maximum,
  size,
  focusStart,
  focusEnd,
  focusCenter,
}: {
  minimum: number;
  maximum: number;
  size: number;
  focusStart: number;
  focusEnd: number;
  focusCenter: number;
}) {
  const lastStart = maximum - size;
  const preferredStart = focusCenter - size / 2;
  const containingMinimum = Math.max(minimum, focusEnd - size);
  const containingMaximum = Math.min(lastStart, focusStart);

  if (containingMinimum <= containingMaximum) {
    return Math.round(
      clamp(preferredStart, containingMinimum, containingMaximum),
    );
  }

  return Math.round(clamp(preferredStart, minimum, lastStart));
}

export function buildSanityProgrammeImageUrl(image: ProgrammeImage) {
  const { width: sourceWidth, height: sourceHeight } = image.dimensions;
  const crop = image.crop ?? { top: 0, bottom: 0, left: 0, right: 0 };
  const hotspot = image.hotspot ?? {
    x: 0.5,
    y: 0.5,
    width: 0,
    height: 0,
  };

  const editorLeft = Math.ceil(crop.left * sourceWidth);
  const editorTop = Math.ceil(crop.top * sourceHeight);
  const editorRight = Math.floor((1 - crop.right) * sourceWidth);
  const editorBottom = Math.floor((1 - crop.bottom) * sourceHeight);
  const editorWidth = editorRight - editorLeft;
  const editorHeight = editorBottom - editorTop;
  const targetAspect = PROGRAMME_IMAGE_WIDTH / PROGRAMME_IMAGE_HEIGHT;

  let outputWidth: number;
  let outputHeight: number;

  if (editorWidth / editorHeight > targetAspect) {
    outputHeight = editorHeight;
    outputWidth = Math.max(1, Math.floor(outputHeight * targetAspect));
  } else {
    outputWidth = editorWidth;
    outputHeight = Math.max(1, Math.floor(outputWidth / targetAspect));
  }

  const hotspotCenterX = clamp(
    hotspot.x * sourceWidth,
    editorLeft,
    editorRight,
  );
  const hotspotCenterY = clamp(
    hotspot.y * sourceHeight,
    editorTop,
    editorBottom,
  );
  const hotspotStartX = clamp(
    (hotspot.x - hotspot.width / 2) * sourceWidth,
    editorLeft,
    editorRight,
  );
  const hotspotEndX = clamp(
    (hotspot.x + hotspot.width / 2) * sourceWidth,
    editorLeft,
    editorRight,
  );
  const hotspotStartY = clamp(
    (hotspot.y - hotspot.height / 2) * sourceHeight,
    editorTop,
    editorBottom,
  );
  const hotspotEndY = clamp(
    (hotspot.y + hotspot.height / 2) * sourceHeight,
    editorTop,
    editorBottom,
  );

  const left = placeCropAxis({
    minimum: editorLeft,
    maximum: editorRight,
    size: outputWidth,
    focusStart: Math.min(hotspotStartX, hotspotEndX),
    focusEnd: Math.max(hotspotStartX, hotspotEndX),
    focusCenter: hotspotCenterX,
  });
  const top = placeCropAxis({
    minimum: editorTop,
    maximum: editorBottom,
    size: outputHeight,
    focusStart: Math.min(hotspotStartY, hotspotEndY),
    focusEnd: Math.max(hotspotStartY, hotspotEndY),
    focusCenter: hotspotCenterY,
  });

  const url = new URL(image.url);
  url.search = '';
  url.searchParams.set(
    'rect',
    `${left},${top},${outputWidth},${outputHeight}`,
  );
  url.searchParams.set('w', String(PROGRAMME_IMAGE_WIDTH));
  url.searchParams.set('h', String(PROGRAMME_IMAGE_HEIGHT));
  url.searchParams.set('fit', 'crop');
  url.searchParams.set('auto', 'format');
  url.searchParams.set('q', '85');

  return url.toString();
}

export function getSanityConfig(): SanityConfig | null {
  const projectId = process.env.NEXT_PUBLIC_SANITY_PROJECT_ID?.trim();
  const dataset =
    process.env.NEXT_PUBLIC_SANITY_DATASET?.trim() || 'production';

  if (
    !projectId ||
    placeholderProjectIds.has(projectId) ||
    !/^[a-z0-9]+$/.test(projectId) ||
    !/^[a-zA-Z0-9_-]+$/.test(dataset)
  ) {
    return null;
  }

  return { projectId, dataset };
}

export async function getProgrammesForSchool(
  school: SchoolSlug,
): Promise<CmsProgramme[] | null> {
  const config = getSanityConfig();
  if (!config) return null;

  const query = `*[
    _type == "programme" &&
    school == $school &&
    active == true
  ] | order(order asc, title asc) {
    _id,
    title,
    summary,
    slug,
    delivery,
    "featured": coalesce(featured, false),
    "image": select(
      defined(image.asset) => {
        "url": image.asset->url,
        "alt": image.alt,
        "crop": image.crop,
        "hotspot": image.hotspot,
        "dimensions": image.asset->metadata.dimensions
      },
      null
    )
  }`;

  const endpoint = new URL(
    `https://${config.projectId}.api.sanity.io/v${SANITY_API_VERSION}/data/query/${config.dataset}`,
  );
  endpoint.searchParams.set('query', query);
  endpoint.searchParams.set('$school', JSON.stringify(school));

  try {
    const response = await fetch(endpoint, {
      next: { revalidate: 300 },
    });
    if (!response.ok) return null;

    const payload: unknown = await response.json();
    const result = z.object({ result: z.unknown() }).safeParse(payload);
    if (!result.success) return null;

    const programmes = cmsProgrammeListSchema.safeParse(result.data.result);
    return programmes.success ? programmes.data : null;
  } catch {
    return null;
  }
}
