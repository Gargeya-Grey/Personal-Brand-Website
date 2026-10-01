import 'server-only';
import sharp from 'sharp';
import fs from 'node:fs/promises';
import path from 'node:path';
import { createHash, randomUUID } from 'node:crypto';
import { supabase, isSupabaseConfigured } from './supabase';

export async function canonicalCoverImage(bytes: Buffer): Promise<Buffer> {
  if (!bytes.length || bytes.length > 5 * 1024 * 1024) throw new Error('Image must be at most 5MB.');
  const raster = bytes.subarray(0,8).equals(Buffer.from([137,80,78,71,13,10,26,10])) ||
    bytes.subarray(0,3).equals(Buffer.from([255,216,255])) || /^GIF8[79]a$/.test(bytes.subarray(0,6).toString('ascii')) ||
    (bytes.subarray(0,4).toString('ascii') === 'RIFF' && bytes.subarray(8,12).toString('ascii') === 'WEBP');
  if (!raster) throw new Error('Please upload a JPEG, PNG, WEBP, or GIF image.');
  const image = sharp(bytes, { animated: true, limitInputPixels: 40_000_000 });
  const metadata = await image.metadata();
  if (!['jpeg','png','webp','gif'].includes(metadata.format || '') || (metadata.pages || 1) > 50) {
    throw new Error('Unsupported image or animation too large.');
  }
  // Decode and re-encode; never publish caller bytes, MIME, extensions, or metadata.
  const result = await image.rotate().webp({ quality: 90 }).toBuffer();
  if (result.length > 5 * 1024 * 1024) throw new Error('Converted image exceeds 5MB.');
  return result;
}

export async function storeCoverImage(bytes: Buffer, slug: string): Promise<string> {
  const buffer = await canonicalCoverImage(bytes);
  const cleanSlug = slug.replace(/[^a-z0-9-]/gi, '-').toLowerCase().slice(0,80) || 'cover';
  const filename = `${cleanSlug}-${randomUUID()}.webp`;
  if (isSupabaseConfigured()) {
    const { error } = await supabase.storage.from('covers').upload(filename, buffer, { contentType: 'image/webp', upsert: false });
    if (error) throw new Error('Image storage failed.');
    return supabase.storage.from('covers').getPublicUrl(filename).data.publicUrl;
  }
  const coversDir = path.resolve(process.cwd(), 'public', 'covers');
  await fs.mkdir(coversDir, { recursive: true });
  if (await fs.realpath(coversDir) !== coversDir) throw new Error('Cover directory must not be a symlink.');
  await fs.writeFile(path.join(coversDir, filename), buffer, { flag: 'wx' });
  const ownershipDir = path.join(process.cwd(), 'data', 'cover-uploads');
  await fs.mkdir(ownershipDir, { recursive: true });
  await fs.writeFile(path.join(ownershipDir, `${filename}.json`), JSON.stringify({
    digest: createHash('sha256').update(buffer).digest('hex'),
  }), { flag: 'wx' });
  return `/covers/${filename}`;
}

export async function deleteOwnedLocalCover(url: string, root = process.cwd()): Promise<void> {
  const filename = url.split(/[?#]/, 1)[0].slice('/covers/'.length);
  if (!url.startsWith('/covers/') || !/^[a-z0-9-]+-[a-f0-9]{8}-[a-f0-9]{4}-[a-f0-9]{4}-[a-f0-9]{4}-[a-f0-9]{12}\.webp$/.test(filename)) return;
  const coversDir = path.resolve(root, 'public', 'covers');
  const target = path.join(coversDir, filename);
  try {
    // Unknown legacy/static files have no ownership receipt and are retained.
    const receipt = JSON.parse(await fs.readFile(path.join(root, 'data', 'cover-uploads', `${filename}.json`), 'utf8'));
    if (await fs.realpath(coversDir) !== coversDir || !(await fs.lstat(target)).isFile() || await fs.realpath(target) !== target) return;
    const digest = createHash('sha256').update(await fs.readFile(target)).digest('hex');
    if (receipt.digest !== digest) return;
    await fs.unlink(target);
  } catch (error) {
    if ((error as NodeJS.ErrnoException).code !== 'ENOENT') throw error;
  }
}
