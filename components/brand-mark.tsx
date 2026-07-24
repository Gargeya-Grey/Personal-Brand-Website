import Image from 'next/image';
import { siteConfig } from '@/lib/site-config';

type BrandMarkProps = {
  className?: string;
  /** Pixel size of the square mark */
  size?: number;
  /**
   * `auto` — dark-field mark in light UI, light-field mark in dark UI (CSS).
   * `dark` — dark tile (for light chrome).
   * `light` — light tile (for dark chrome).
   */
  variant?: 'auto' | 'dark' | 'light';
  /** Shortcut: use light-field mark on dark chrome (hero/footer). */
  onDarkChrome?: boolean;
  priority?: boolean;
};

/**
 * Official SGargeya mark — square tile for nav, footer, and chrome.
 */
export function BrandMark({
  className = '',
  size = 32,
  variant = 'auto',
  onDarkChrome = false,
  priority = false,
}: BrandMarkProps) {
  const resolved: 'dark' | 'light' | 'auto' = onDarkChrome ? 'light' : variant;
  const alt = `${siteConfig.name} logo`;

  if (resolved === 'dark' || resolved === 'light') {
    return (
      <Image
        src={siteConfig.brand.logo[resolved]}
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
        src={siteConfig.brand.logo.dark}
        alt={alt}
        width={size}
        height={size}
        className="absolute inset-0 dark:hidden"
        priority={priority}
      />
      <Image
        src={siteConfig.brand.logo.light}
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
