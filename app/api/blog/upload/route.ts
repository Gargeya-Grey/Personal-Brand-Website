import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { requireAllowedSession } from '@/lib/auth';
import { storeCoverImage } from '@/lib/cover-images';

export async function POST(request: Request) {
  try {
    // 1. Authenticate Request (allowlisted Google session only)
    const cookieStore = await cookies();
    const sessionCookie = cookieStore.get('auth_session');
    const user = await requireAllowedSession(sessionCookie?.value);
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
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
    const allowedMimeTypes = ['image/jpeg', 'image/png', 'image/webp', 'image/gif'];
    if (!allowedMimeTypes.includes(file.type)) {
      return NextResponse.json({ error: 'Invalid file type. Only JPEG, PNG, WEBP, and GIF are allowed.' }, { status: 400 });
    }

    // 5. Read File Content as Buffer
    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);

    try {
      const url = await storeCoverImage(buffer, slug);
      return NextResponse.json({ success: true, url });
    } catch {
      return NextResponse.json({ error: 'Could not save image. Use a valid JPEG, PNG, WEBP, or GIF of at most 5MB.' }, { status: 400 });
    }
  } catch (error: any) {
    return NextResponse.json({ error: 'Failed to upload image: ' + error.message }, { status: 500 });
  }
}
