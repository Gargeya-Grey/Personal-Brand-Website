import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { verifyJWT } from '@/lib/auth';
import { CATEGORIES } from '@/lib/categories';
import fs from 'fs/promises';
import path from 'path';

interface Metadata {
  title: string;
  slug: string;
  excerpt: string;
  categories: string[];
  takeaways: string[];
  illustrationType: string;
  coverImage?: string;
}

// Robust JSON extraction helper
function parseJSONFromLLM(content: string) {
  try {
    return JSON.parse(content);
  } catch (parseError) {
    const cleanJson = content.replace(/```json|```/gi, '').trim();
    return JSON.parse(cleanJson);
  }
}

// Call OpenRouter API helper
async function callOpenRouter(apiKey: string, model: string, systemPrompt: string, userContent: string, jsonFormat: boolean = true) {
  const response = await fetch('https://openrouter.ai/api/v1/chat/completions', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${apiKey}`,
      'HTTP-Referer': process.env.APP_URL || 'http://localhost:3000',
      'X-Title': 'Curator Canvas Editorial'
    },
    body: JSON.stringify({
      model: model,
      messages: [
        { role: 'system', content: systemPrompt },
        { role: 'user', content: userContent }
      ],
      response_format: jsonFormat ? { type: 'json_object' } : undefined
    })
  });

  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(`OpenRouter API returned error: ${errorText}`);
  }

  const data = await response.json();
  const content = data.choices?.[0]?.message?.content;
  if (!content) {
    throw new Error('Failed to receive completion content from OpenRouter.');
  }

  return content;
}

// Helper to call OpenRouter for image generation
async function generateCoverImage(apiKey: string, prompt: string): Promise<string | null> {
  const response = await fetch('https://openrouter.ai/api/v1/chat/completions', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${apiKey}`,
      'HTTP-Referer': process.env.APP_URL || 'http://localhost:3000',
      'X-Title': 'Curator Canvas Cover Generator'
    },
    body: JSON.stringify({
      model: 'x-ai/grok-imagine-image-quality',
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

// Helper to save generated base64 image locally
async function saveBase64Image(imageUrl: string, slug: string): Promise<string | null> {
  if (!imageUrl.startsWith('data:image/')) {
    return imageUrl;
  }

  try {
    const matches = imageUrl.match(/^data:image\/([a-zA-Z+]+);base64,(.+)$/);
    if (!matches || matches.length !== 3) {
      return null;
    }
    
    const ext = matches[1];
    const data = matches[2];
    const buffer = Buffer.from(data, 'base64');
    
    const coversDir = path.join(process.cwd(), 'public', 'covers');
    await fs.mkdir(coversDir, { recursive: true });
    
    const cleanSlug = slug.replace(/[^a-z0-9-]/gi, '-').toLowerCase();
    const fileName = `${cleanSlug || 'cover'}-${Date.now()}.png`;
    const filePath = path.join(coversDir, fileName);
    
    await fs.writeFile(filePath, buffer);
    return `/covers/${fileName}`;
  } catch (error) {
    console.error('Failed to save generated image to disk:', error);
    return null;
  }
}

// Programmatic verification rules
function runProgrammaticValidation(meta: Partial<Metadata>): string[] {
  const issues: string[] = [];
  
  if (meta.slug) {
    const wordCount = meta.slug.split('-').filter(Boolean).length;
    if (wordCount > 5) {
      issues.push(`Slug has ${wordCount} words, which exceeds the maximum limit of 5 words.`);
    }
    if (!/^[a-z0-9-]+$/.test(meta.slug)) {
      issues.push(`Slug is not URL-safe: must be lowercase, alphanumeric, and hyphens only.`);
    }
  } else {
    issues.push(`Slug is missing.`);
  }

  if (meta.excerpt) {
    if (meta.excerpt.length > 150) {
      issues.push(`Excerpt has ${meta.excerpt.length} characters, which exceeds the maximum of 150 characters.`);
    }
  } else {
    issues.push(`Excerpt is missing.`);
  }

  if (Array.isArray(meta.takeaways)) {
    if (meta.takeaways.length < 3 || meta.takeaways.length > 4) {
      issues.push(`Takeaways list must have 3 to 4 items (currently has ${meta.takeaways.length}).`);
    }
    meta.takeaways.forEach((t, i) => {
      if (t && t.length > 100) {
        issues.push(`Takeaway item ${i + 1} exceeds 100 characters (${t.length} chars).`);
      }
    });
  } else {
    issues.push(`Takeaways field is missing or not an array.`);
  }

  const validIllustrations = ["diagram1", "diagram2", "diagram3", "diagram4", "diagram5", "diagram6", "diagram7", "diagram8", "cover"];
  if (meta.illustrationType) {
    if (!validIllustrations.includes(meta.illustrationType)) {
      issues.push(`IllustrationType '${meta.illustrationType}' is invalid. Must be one of: ${validIllustrations.join(', ')}.`);
    }
  } else {
    issues.push(`IllustrationType is missing.`);
  }

  return issues;
}

// Programmatic correction fallback
function applyProgrammaticCorrections(meta: Partial<Metadata>): Metadata {
  const corrected: Metadata = {
    title: meta.title || 'Untitled Blog Post',
    slug: meta.slug || 'untitled-blog-post',
    excerpt: meta.excerpt || 'Brief summary of the article.',
    categories: Array.isArray(meta.categories) ? meta.categories : [],
    takeaways: Array.isArray(meta.takeaways) ? meta.takeaways : [],
    illustrationType: meta.illustrationType || 'diagram1'
  };

  let cleanSlug = corrected.slug
    .toLowerCase()
    .replace(/[^a-z0-9-]/g, '-')
    .replace(/-+/g, '-')
    .replace(/^-|-$/g, '');
  
  const slugWords = cleanSlug.split('-').filter(Boolean);
  if (slugWords.length > 5) {
    cleanSlug = slugWords.slice(0, 5).join('-');
  }
  corrected.slug = cleanSlug || 'blog-post';

  if (corrected.excerpt.length > 150) {
    corrected.excerpt = corrected.excerpt.substring(0, 147) + '...';
  }

  if (corrected.takeaways.length < 3) {
    while (corrected.takeaways.length < 3) {
      corrected.takeaways.push(`Key takeaway ${corrected.takeaways.length + 1}`);
    }
  } else if (corrected.takeaways.length > 4) {
    corrected.takeaways = corrected.takeaways.slice(0, 4);
  }
  corrected.takeaways = corrected.takeaways.map(t => {
    let cleaned = t || 'Key learning point.';
    if (cleaned.length > 100) {
      cleaned = cleaned.substring(0, 97) + '...';
    }
    return cleaned;
  });

  const validIllustrations = ["diagram1", "diagram2", "diagram3", "diagram4", "diagram5", "diagram6", "diagram7", "diagram8", "cover"];
  if (!validIllustrations.includes(corrected.illustrationType)) {
    corrected.illustrationType = 'diagram1';
  }

  return corrected;
}

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

    // 2. Parse request body
    const { content } = await request.json();
    if (!content) {
      return NextResponse.json({ error: 'Missing content body' }, { status: 400 });
    }

    // 3. Check OpenRouter API Key
    const apiKey = process.env.OPENROUTER_API_KEY;
    if (!apiKey) {
      return NextResponse.json({
        error: 'OpenRouter API Key (OPENROUTER_API_KEY) is not configured in the server environment. Please configure it in your .env file.'
      }, { status: 500 });
    }

    const model = process.env.OPENROUTER_MODEL || 'nvidia/nemotron-3-nano-omni-30b-a3b-reasoning:free';

    // 4. Prompts definition
    const generatorSystemPrompt = `You are an expert technical blog editor and AI metadata generator.
Your job is to read the markdown blog content and generate highly accurate metadata fields in JSON format.
You must return a raw JSON object matching the schema below (with no markdown code block formatting or backticks around it):

{
  "title": "A compelling, clear, and professional title.",
  "slug": "A URL-safe slug generated from the title (lowercase, alphanumeric, hyphens only, MAXIMUM of 5 words).",
  "excerpt": "A single-sentence concise summary of the article (under 150 characters).",
  "categories": ["Category1", "Category2"], // Select 1 to 3 relevant categories. You MUST prioritize matching the allowed categories below, but you may also suggest 1-2 new relevant custom tags if they fit perfectly.
  "takeaways": ["Takeaway 1", "Takeaway 2", "Takeaway 3"], // 3 to 4 concise learning points, under 100 characters each.
  "illustrationType": "diagram1" // Recommend the most appropriate SVG diagram type from: "diagram1", "diagram2", "diagram3", "diagram4", "diagram5", "diagram6", "diagram7", "diagram8"
}

Allowed predefined categories:
${JSON.stringify(CATEGORIES)}

Predefined SVG illustration types guide:
- diagram1: Stateful workflows/sine waves (general, orchestrations, pipelines)
- diagram2: Mapped node tree/DAGs/hierarchies (graph structures, databases)
- diagram3: Three clean code blocks/systems comparison
- diagram4: Sequential step flow (e.g. Task -> Run -> Verify)
- diagram5: Multi-agent cycles / Human-in-the-loop gates
- diagram6: Node router and action nodes (Query -> Safety/Refunds/Schedule -> Action)
- diagram7: Cloud architecture / Kubernetes (Private k8s, ClickHouse, Tracer, Ingress)
- diagram8: Token stream / Delta event stream UX architecture

Ensure the JSON output is valid, structured, and parseable. Do not write any explanations before or after the JSON.`;

    const evaluatorSystemPrompt = `You are a critical metadata evaluator agent.
Analyze the generated JSON metadata against the original blog content and the following rules:
1. The slug MUST be URL-safe (lowercase, alphanumeric, hyphens only) and have a MAXIMUM of 5 words (hyphen-separated components).
2. The excerpt must be under 150 characters.
3. The categories must prioritize matching the allowed predefined categories: ${JSON.stringify(CATEGORIES)}, with at most 1-2 custom tags.
4. The takeaways list must have 3-4 concise items, each under 100 characters.
5. The illustrationType must be exactly one of "diagram1" through "diagram8".

Analyze if the metadata accurately captures the main points of the blog and looks professional.

Return a JSON object in this format:
{
  "isValid": true, // or false if any violations are found
  "feedback": "A detailed explanation of any violations found (including word counts, length issues, or quality issues). If no violations are found, leave this empty."
}`;

    const refinerSystemPrompt = `You are a metadata correction agent.
You will be provided with:
1. The original blog content.
2. The generated JSON metadata which failed evaluation.
3. The critical feedback detailing the issues (e.g. slug length exceeds 5 words, excerpt too long, etc.).

Your job is to fix the issues mentioned in the feedback, ensuring that:
- The slug has a MAXIMUM of 5 words (hyphen-separated).
- The excerpt is under 150 characters.
- Takeaways have 3-4 items, each under 100 characters.
- All other fields conform to the rules.

Return the final corrected metadata as a JSON object matching the original schema:
{
  "title": "...",
  "slug": "...",
  "excerpt": "...",
  "categories": [...],
  "takeaways": [...],
  "illustrationType": "..."
}`;

    // 5. Run Step 1: Generator LLM call
    let generatedRaw = await callOpenRouter(apiKey, model, generatorSystemPrompt, content, true);
    let meta: Partial<Metadata>;
    try {
      meta = parseJSONFromLLM(generatedRaw);
    } catch (err) {
      meta = {};
    }

    // 6. Run Step 2: Programmatic checks
    let progIssues = runProgrammaticValidation(meta);

    // 7. Run Step 2 (Cont.): LLM Evaluator agent call
    let evalJson = { isValid: true, feedback: '' };
    try {
      const evaluatorRaw = await callOpenRouter(
        apiKey,
        model,
        evaluatorSystemPrompt,
        `Original Content:\n${content}\n\nGenerated JSON:\n${JSON.stringify(meta, null, 2)}`,
        true
      );
      evalJson = parseJSONFromLLM(evaluatorRaw);
    } catch (err) {
      console.error('LLM Evaluator call failed, falling back to programmatic checks only:', err);
    }

    // Determine if refinement is needed
    const needsRefinement = !evalJson.isValid || progIssues.length > 0;
    let finalMeta: Metadata;

    if (needsRefinement) {
      const allFeedback = [
        ...progIssues.map(issue => `[Programmatic] ${issue}`),
        ...(evalJson.feedback ? [`[Evaluator] ${evalJson.feedback}`] : [])
      ].join('\n');

      try {
        const refinerRaw = await callOpenRouter(
          apiKey,
          model,
          refinerSystemPrompt,
          `Original Content:\n${content}\n\nGenerated JSON:\n${JSON.stringify(meta, null, 2)}\n\nFeedback:\n${allFeedback}`,
          true
        );
        const refinedMeta = parseJSONFromLLM(refinerRaw);
        
        const finalIssues = runProgrammaticValidation(refinedMeta);
        if (finalIssues.length > 0) {
          finalMeta = applyProgrammaticCorrections(refinedMeta);
        } else {
          finalMeta = refinedMeta as Metadata;
        }
      } catch (err) {
        console.error('Refiner call failed, applying programmatic corrections to initial metadata:', err);
        finalMeta = applyProgrammaticCorrections(meta);
      }
    } else {
      finalMeta = meta as Metadata;
    }

    // 8. Generate Custom Cover Image using Grok Imagine
    if (finalMeta.title) {
      try {
        let designSpec = '';
        try {
          const designPath = path.join(process.cwd(), 'post-design.md');
          designSpec = await fs.readFile(designPath, 'utf-8');
        } catch (e) {
          designSpec = 'Minimalist, editorial, academic authority, tech/AI motif. Use Slate background with Algorithmic Mint highlights.';
        }

        // Generate a detailed visual prompt dynamically using the LLM for high-context images
        const promptOptimizerSystem = `You are a professional art director and visual designer.
Your task is to convert the title and summary of a technical blog post into a highly detailed, visually descriptive prompt for a 3D/editorial image generator.
You must construct a single descriptive prompt paragraph that will produce an image representing the core concept of the blog post.

Follow these rules:
1. Translate the abstract technical concepts (e.g. "Rippling going AI native", "langsmith engines", "database orchestrations") into concrete 3D objects, models, or architectural metaphors (e.g., layered frosted glass cards with holographic circuits, glowing light rays passing through prisms, flowing streams of illuminated particles, structured node matrices, abstract geometric machines).
2. The style must align strictly with "Editorial Glassmorphism": refractive glass panels, light dispersion, chromatic aberration, anodized metallic elements, soft glowing mint highlights, deep dark slate/navy backgrounds, volumetric lighting, and deep-focus perspective.
3. Keep the layout minimalist, asymmetrical, and clean. Specify ample negative space.
4. DO NOT request any text, labels, words, or letters in the image.
5. Provide only the optimized prompt paragraph as your output. Do not include any JSON wrapper, labels, or explanation.`;

        const promptOptimizerUser = `Please generate an image prompt for the following blog post:
Title: "${finalMeta.title}"
Description: "${finalMeta.excerpt}"

Visual Brand Guidelines:
${designSpec}`;

        let optimizedPrompt = '';
        try {
          optimizedPrompt = await callOpenRouter(apiKey, model, promptOptimizerSystem, promptOptimizerUser, false);
          optimizedPrompt = optimizedPrompt.trim();
        } catch (promptErr) {
          console.error('Failed optimizing cover image prompt, falling back to static prompt:', promptErr);
          optimizedPrompt = `A stunning premium 3D editorial graphic for: "${finalMeta.title}". ${finalMeta.excerpt}. Editorial Glassmorphism, refractive glass, volumetric lighting, slate background, algorithmic mint green highlights.`;
        }

        const base64Url = await generateCoverImage(apiKey, optimizedPrompt);
        if (base64Url) {
          const savedPath = await saveBase64Image(base64Url, finalMeta.slug || 'cover');
          if (savedPath) {
            finalMeta.coverImage = savedPath;
            finalMeta.illustrationType = 'cover';
          }
        }
      } catch (err: any) {
        console.error('Failed generating cover image:', err);
      }
    }

    // 9. Return final response
    return NextResponse.json({ success: true, metadata: finalMeta });
  } catch (err: any) {
    return NextResponse.json({ error: `Server error: ${err.message}` }, { status: 500 });
  }
}
