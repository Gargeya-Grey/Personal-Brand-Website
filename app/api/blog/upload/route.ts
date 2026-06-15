import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { verifyJWT } from '@/lib/auth';
import fs from 'fs/promises';
import path from 'path';

export async function POST(request: Request) {
  try {
    // 1. Authenticate Request
    const cookieStore = await cookies();
    const sessionCookie = cookieStore.get('auth_session');
    if (!sessionCookie) {
      return NextResponse.json({ error: 'Unauthorized: Session missing' }, { status: 401 });
    }
    const user = await verifyJWT(sessionCookie.value);
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized: Session invalid' }, { status: 401 });
    }

    // 2. Parse Multipart Form Data
    const formData = await request.formData();
    const file = formData.get('file') as File;
    const slug = formData.get('slug') as string || 'cover';

    if (!file || !(file instanceof File)) {
      return NextResponse.json({ error: 'No file uploaded' }, { status: 400 });
    }

    // 3. Validate File Size (Max 5MB)
    const maxBytes = 5 * 1024 * 1024;
    if (file.size > maxBytes) {
      return NextResponse.json({ error: 'File size exceeds 5MB limit' }, { status: 400 });
    }

    // 4. Validate MIME Type
    const allowedMimeTypes = ['image/jpeg', 'image/png', 'image/webp', 'image/gif', 'image/svg+xml'];
    if (!allowedMimeTypes.includes(file.type)) {
      return NextResponse.json({ error: 'Invalid file type. Only JPEG, PNG, WEBP, GIF, and SVG are allowed.' }, { status: 400 });
    }

    // 5. Read File Content as Buffer
    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);

    // 6. Save File to public/covers/
    const ext = path.extname(file.name) || '.png';
    const cleanSlug = slug.replace(/[^a-z0-9-]/gi, '-').toLowerCase();
    const fileName = `${cleanSlug}-${Date.now()}${ext}`;
    const coversDir = path.join(process.cwd(), 'public', 'covers');
    const filePath = path.join(coversDir, fileName);

    await fs.mkdir(coversDir, { recursive: true });
    await fs.writeFile(filePath, buffer);

    return NextResponse.json({ success: true, url: `/covers/${fileName}` });
  } catch (error: any) {
    return NextResponse.json({ error: 'Failed to upload image: ' + error.message }, { status: 500 });
  }
}
