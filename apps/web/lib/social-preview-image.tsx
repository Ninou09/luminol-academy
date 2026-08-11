import { ImageResponse } from 'next/og';

export const SOCIAL_PREVIEW_ALT =
  'Luminol Academy — Psychology, Languages and Professional Training';
export const SOCIAL_PREVIEW_SIZE = { width: 1200, height: 630 } as const;
export const SOCIAL_PREVIEW_CONTENT_TYPE = 'image/png';

export function renderSocialPreviewImage() {
  return new ImageResponse(
    <div
      style={{
        alignItems: 'stretch',
        background: '#fafaf8',
        color: '#102a43',
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
          background: '#c79a3b',
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
          width: 720,
        }}
      >
        <div style={{ display: 'flex', flexDirection: 'column' }}>
          <div
            style={{
              color: '#8b651f',
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
            Develop the whole person.
          </div>
          <div
            style={{
              color: '#627d98',
              fontFamily: 'Arial, sans-serif',
              fontSize: 28,
              lineHeight: 1.35,
              marginTop: 28,
            }}
          >
            Psychology · Languages · Professional Training
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
          <span>Mind</span>
          <span style={{ color: '#c79a3b', margin: '0 18px' }}>·</span>
          <span>Voice</span>
          <span style={{ color: '#c79a3b', margin: '0 18px' }}>·</span>
          <span>Work</span>
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
            border: '2px solid #d9e2ec',
            borderRadius: 999,
            height: 360,
            position: 'absolute',
            width: 360,
          }}
        />
        <div
          style={{
            border: '1px solid #c79a3b',
            borderRadius: 999,
            height: 270,
            position: 'absolute',
            width: 270,
          }}
        />
        <div
          style={{
            alignItems: 'center',
            background: '#102a43',
            borderRadius: 999,
            color: '#fafaf8',
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
            background: '#2f6b67',
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
            background: '#375a7f',
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
            background: '#8a5a32',
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
