import {
  createBrandOgImage,
  ogImageAlt,
  ogImageContentType,
  ogImageSize,
} from '@/lib/og-brand-image';

export const alt = ogImageAlt;
export const size = ogImageSize;
export const contentType = ogImageContentType;

export default function OpenGraphImage() {
  return createBrandOgImage();
}
