import { colors } from '@luminol/config/tailwind';
import type { Locale } from '@luminol/localization';
import { ImageResponse } from 'next/og';

import { getPublicCopy } from './public-localization';

export const SOCIAL_PREVIEW_SIZE = { width: 1200, height: 630 } as const;
export const SOCIAL_PREVIEW_CONTENT_TYPE = 'image/png';

type GeneratedSocialPreviewLocale = Exclude<Locale, 'ar'>;

export function getSocialPreviewAlt(locale: Locale): string {
  const copy = getPublicCopy(locale);
  return `Luminol Academy — ${copy.site.footerDisciplines}`;
}

export function renderSocialPreviewImage(locale: GeneratedSocialPreviewLocale) {
  const copy = getPublicCopy(locale);
  const title = `${copy.home.heroTitle} ${copy.home.heroAccent}`;
  const signals = [copy.home.mind, copy.home.voice, copy.home.work];

  return new ImageResponse(
    <div
      style={{
        alignItems: 'stretch',
        background: colors.canvas,
        color: colors.ink,
        display: 'flex',
        height: '100%',
        overflow: 'hidden',
        padding: '68px 72px',
        position: 'relative',
        width: '100%',
      }}
    >
      <div
        style={{
          background: colors.gold,
          height: 8,
          left: 0,
          position: 'absolute',
          top: 0,
          width: '100%',
        }}
      />

      <div
        style={{
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'space-between',
          textAlign: 'left',
          width: 720,
        }}
      >
        <div style={{ display: 'flex', flexDirection: 'column' }}>
          <div
            style={{
              color: colors.goldStrong,
              fontFamily: 'Arial, sans-serif',
              fontSize: 24,
              fontWeight: 700,
              letterSpacing: '0.18em',
              textTransform: 'uppercase',
            }}
          >
            Luminol Academy
          </div>
          <div
            style={{
              fontFamily: 'Georgia, serif',
              fontSize: 82,
              fontWeight: 500,
              letterSpacing: '-0.04em',
              lineHeight: 0.98,
              marginTop: 42,
            }}
          >
            {title}
          </div>
          <div
            style={{
              color: colors.muted,
              fontFamily: 'Arial, sans-serif',
              fontSize: 28,
              lineHeight: 1.35,
              marginTop: 28,
            }}
          >
            {copy.site.footerDisciplines}
          </div>
        </div>

        <div
          style={{
            alignItems: 'center',
            display: 'flex',
            fontFamily: 'Arial, sans-serif',
            fontSize: 20,
            fontWeight: 700,
            letterSpacing: '0.08em',
            textTransform: 'uppercase',
          }}
        >
          {signals.map((signal, index) => (
            <div key={signal} style={{ alignItems: 'center', display: 'flex' }}>
              {index > 0 ? (
                <span style={{ color: colors.gold, margin: '0 18px' }}>·</span>
              ) : null}
              <span>{signal}</span>
            </div>
          ))}
        </div>
      </div>

      <div
        aria-hidden="true"
        style={{
          alignItems: 'center',
          display: 'flex',
          flex: 1,
          justifyContent: 'center',
          position: 'relative',
        }}
      >
        <div
          style={{
            border: `2px solid ${colors.line}`,
            borderRadius: 999,
            height: 360,
            position: 'absolute',
            width: 360,
          }}
        />
        <div
          style={{
            border: `1px solid ${colors.gold}`,
            borderRadius: 999,
            height: 270,
            position: 'absolute',
            width: 270,
          }}
        />
        <div
          style={{
            alignItems: 'center',
            background: colors.ink,
            borderRadius: 999,
            color: colors.canvas,
            display: 'flex',
            fontFamily: 'Georgia, serif',
            fontSize: 92,
            height: 188,
            justifyContent: 'center',
            letterSpacing: '-0.06em',
            width: 188,
          }}
        >
          Lu
        </div>
        <div
          style={{
            background: colors.psychology,
            borderRadius: 999,
            height: 22,
            left: 4,
            position: 'absolute',
            top: 138,
            width: 22,
          }}
        />
        <div
          style={{
            background: colors.languages,
            borderRadius: 999,
            height: 22,
            position: 'absolute',
            right: 12,
            top: 222,
            width: 22,
          }}
        />
        <div
          style={{
            background: colors.training,
            borderRadius: 999,
            bottom: 104,
            height: 22,
            left: 70,
            position: 'absolute',
            width: 22,
          }}
        />
      </div>
    </div>,
    SOCIAL_PREVIEW_SIZE,
  );
}
