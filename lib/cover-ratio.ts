import 'server-only';
import fs from 'fs/promises';
import path from 'path';
import sharp from 'sharp';

const PUBLIC_DIR = path.join(process.cwd(), 'public');

/**
 * Width ÷ height of an essay cover, read on the server so the frame reserves the right space
 * before the image loads (no layout shift). Null when the image cannot be read; the client then
 * measures it on load.
 */
export async function getCoverRatio(src: string | undefined | null): Promise<number | null> {
  if (!src) return null;
  try {
    let bytes: Buffer;
    if (src.startsWith('/') && !src.startsWith('//')) {
      const filePath = path.normalize(path.join(PUBLIC_DIR, decodeURIComponent(src.split(/[?#]/)[0])));
      if (!filePath.startsWith(PUBLIC_DIR + path.sep)) return null;
      bytes = await fs.readFile(filePath);
    } else if (src.startsWith('https://')) {
      const response = await fetch(src, { next: { revalidate: 86400 } });
      if (!response.ok) return null;
      bytes = Buffer.from(await response.arrayBuffer());
    } else {
      return null;
    }
    const { width, height } = await sharp(bytes).metadata();
    return width && height ? width / height : null;
  } catch {
    return null;
  }
}
