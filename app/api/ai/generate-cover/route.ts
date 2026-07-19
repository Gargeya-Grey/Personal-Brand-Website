import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { requireAllowedSession } from '@/lib/auth';
import { supabase, isSupabaseConfigured } from '@/lib/supabase';
import fs from 'fs/promises';
import path from 'path';

// Helper to call OpenRouter for image generation
async function generateCoverImage(apiKey: string, prompt: string): Promise<string | null> {
  const imageModel = process.env.IMAGE_GENERATION_MODEL || 'x-ai/grok-imagine-image-quality';
  const response = await fetch('https://openrouter.ai/api/v1/chat/completions', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${apiKey}`,
      'HTTP-Referer': process.env.APP_URL || 'http://localhost:3000',
      'X-Title': 'Curator Canvas Cover Generator'
    },
    body: JSON.stringify({
      model: imageModel,
      messages: [
        { role: 'user', content: prompt }
      ],
      modalities: ['image']
    })
  });

  if (!response.ok) {
    const errorText = await response.text();
    console.error(`Grok Imagine API returned error: ${errorText}`);
    return null;
  }

  const data = await response.json();
  const imageUrl = data.choices?.[0]?.message?.images?.[0]?.image_url?.url;
  if (!imageUrl) {
    console.error('No image URL returned in OpenRouter response:', JSON.stringify(data));
    return null;
  }

  return imageUrl;
}

// Helper to save generated base64 image (either to Supabase Storage or local fallback)
async function saveBase64Image(imageUrl: string, slug: string): Promise<string | null> {
  if (!imageUrl.startsWith('data:image/')) {
    return imageUrl;
  }

  try {
    const matches = imageUrl.match(/^data:image\/([a-zA-Z+]+);base64,(.+)$/);
    if (!matches || matches.length !== 3) {
      return null;
    }
    
    const data = matches[2];
    const buffer = Buffer.from(data, 'base64');
    
    const cleanSlug = slug.replace(/[^a-z0-9-]/gi, '-').toLowerCase();
    const fileName = `${cleanSlug || 'cover'}-${Date.now()}.png`;

    if (isSupabaseConfigured()) {
      const { error: uploadError } = await supabase.storage
        .from('covers')
        .upload(fileName, buffer, {
          contentType: 'image/png',
          upsert: true
        });

      if (uploadError) {
        console.error('Supabase Storage upload failed for generated image:', uploadError.message);
        return null;
      }

      const { data: { publicUrl } } = supabase.storage
        .from('covers')
        .getPublicUrl(fileName);

      return publicUrl;
    }
    
    const coversDir = path.join(process.cwd(), 'public', 'covers');
    await fs.mkdir(coversDir, { recursive: true });
    const filePath = path.join(coversDir, fileName);
    
    await fs.writeFile(filePath, buffer);
    return `/covers/${fileName}`;
  } catch (error) {
    console.error('Failed to save generated image:', error);
    return null;
  }
}

/**
 * Dedicated endpoint for cover image generation.
 * Accepts { slug, prompt } and returns { success, url }.
 * Decoupled from /api/ai/fill to prevent Vercel serverless timeouts.
 */
export async function POST(request: Request) {
  try {
    // 1. Authenticate Request (allowlisted Google session only)
    const cookieStore = await cookies();
    const sessionCookie = cookieStore.get('auth_session');
    const user = await requireAllowedSession(sessionCookie?.value);
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // 2. Parse request body
    const { slug, prompt } = await request.json();
    if (!prompt) {
      return NextResponse.json({ error: 'Missing required field: prompt' }, { status: 400 });
    }

    // 3. Check OpenRouter API Key
    const apiKey = process.env.OPENROUTER_API_KEY;
    if (!apiKey) {
      return NextResponse.json({
        error: 'OpenRouter API Key (OPENROUTER_API_KEY) is not configured in the server environment.'
      }, { status: 500 });
    }

    // 4. Generate the image
    const base64Url = await generateCoverImage(apiKey, prompt);
    if (!base64Url) {
      return NextResponse.json({ error: 'Image generation failed or returned no image.' }, { status: 502 });
    }

    // 5. Save to storage
    const savedUrl = await saveBase64Image(base64Url, slug || 'cover');
    if (!savedUrl) {
      return NextResponse.json({ error: 'Failed to save generated image to storage.' }, { status: 500 });
    }

    return NextResponse.json({ success: true, url: savedUrl });
  } catch (err: any) {
    return NextResponse.json({ error: `Server error: ${err.message}` }, { status: 500 });
  }
}
