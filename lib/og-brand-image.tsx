import { ImageResponse } from 'next/og';
import { siteConfig } from '@/lib/site-config';

export const ogImageSize = { width: 1200, height: 630 } as const;
export const ogImageContentType = 'image/png';
export const ogImageAlt = `${siteConfig.name} — The Engineering Editorial`;

/** Shared OG / Twitter card artwork. */
export function createBrandOgImage() {
  return new ImageResponse(
    (
      <div
        style={{
          width: '100%',
          height: '100%',
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'space-between',
          padding: '72px 80px',
          background: 'linear-gradient(145deg, #0b1220 0%, #132033 48%, #0f1a14 100%)',
          color: '#f7faf9',
          fontFamily: 'ui-sans-serif, system-ui, sans-serif',
        }}
      >
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: 16,
            fontSize: 28,
            letterSpacing: '0.18em',
            textTransform: 'uppercase',
            color: '#D4FF00',
            fontWeight: 700,
          }}
        >
          {siteConfig.shortName}
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
          <div
            style={{
              fontSize: 72,
              fontWeight: 600,
              lineHeight: 1.05,
              letterSpacing: '-0.03em',
              maxWidth: 920,
            }}
          >
            {siteConfig.name}
          </div>
          <div
            style={{
              fontSize: 30,
              lineHeight: 1.35,
              color: 'rgba(247, 250, 249, 0.78)',
              maxWidth: 880,
            }}
          >
            Architecting intelligent systems for evaluation, assessment, and education.
          </div>
        </div>

        <div
          style={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'flex-end',
            fontSize: 24,
            color: 'rgba(247, 250, 249, 0.55)',
          }}
        >
          <span>The Engineering Editorial</span>
          <span>sgargeya.com</span>
        </div>
      </div>
    ),
    { ...ogImageSize }
  );
}
