import Image from 'next/image';
import { siteConfig } from '@/lib/site-config';

type BrandMarkProps = {
  className?: string;
  /** Pixel size of the square mark */
  size?: number;
  /**
   * `auto` — dark G on light UI, light G on dark UI (CSS).
   * `onLight` — dark G (light chrome / paper).
   * `onDark` — light G (dark chrome / hero / footer).
   */
  variant?: 'auto' | 'onLight' | 'onDark';
  /** Shortcut: light G on dark chrome (hero/footer). */
  onDarkChrome?: boolean;
  priority?: boolean;
};

/**
 * Official SGargeya mark — masked (transparent) for nav and chrome.
 * Favicon uses the full unmasked tile separately.
 */
export function BrandMark({
  className = '',
  size = 32,
  variant = 'auto',
  onDarkChrome = false,
  priority = false,
}: BrandMarkProps) {
  const resolved: 'onLight' | 'onDark' | 'auto' = onDarkChrome ? 'onDark' : variant;
  const alt = `${siteConfig.name} logo`;
  const { onLight, onDark } = siteConfig.brand.logo;

  if (resolved === 'onLight' || resolved === 'onDark') {
    return (
      <Image
        src={resolved === 'onLight' ? onLight : onDark}
        alt={alt}
        width={size}
        height={size}
        className={className}
        priority={priority}
      />
    );
  }

  return (
    <span
      className={`relative inline-block shrink-0 overflow-hidden ${className}`}
      style={{ width: size, height: size }}
    >
      <Image
        src={onLight}
        alt={alt}
        width={size}
        height={size}
        className="absolute inset-0 dark:hidden"
        priority={priority}
      />
      <Image
        src={onDark}
        alt=""
        width={size}
        height={size}
        className="absolute inset-0 hidden dark:block"
        aria-hidden
        priority={priority}
      />
    </span>
  );
}
