import Image from 'next/image';

type BrandMarkProps = {
  className?: string;
  /** Pixel size of the square mark */
  size?: number;
  /** Dark field (default) or light paper field */
  variant?: 'dark' | 'light' | 'favicon';
  priority?: boolean;
};

const SRC = {
  dark: '/brand/gs-mark.svg',
  light: '/brand/gs-mark-light.svg',
  favicon: '/brand/gs-mark-favicon.svg',
} as const;

/**
 * GS Signal mark — architectural G + intelligence node.
 * Use `dark` in nav/chrome; `favicon` only at very small sizes.
 */
export function BrandMark({
  className,
  size = 32,
  variant = 'dark',
  priority = false,
}: BrandMarkProps) {
  return (
    <Image
      src={SRC[variant]}
      alt=""
      width={size}
      height={size}
      className={className}
      priority={priority}
    />
  );
}
