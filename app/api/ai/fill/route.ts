import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { requireAllowedSession } from '@/lib/auth';
import { CATEGORIES } from '@/lib/categories';
import { callOpenRouter, resolveOpenRouterChoice } from '@/lib/ai-providers';

interface Metadata {
  title: string;
  slug: string;
  excerpt: string;
  categories: string[];
  takeaways: string[];
  illustrationType: string;
  coverImage?: string;
}

function parseJSONFromLLM(content: string) {
  try {
    return JSON.parse(content);
  } catch (parseError) {
    const cleanJson = content.replace(/```json|```/gi, '').trim();
    return JSON.parse(cleanJson);
  }
}

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
    const cookieStore = await cookies();
    const sessionCookie = cookieStore.get('auth_session');
    const user = await requireAllowedSession(sessionCookie?.value);
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json().catch(() => ({}));
    const content: string | undefined = body.content;
    if (!content) {
      return NextResponse.json({ error: 'Missing content body' }, { status: 400 });
    }

    let choice: ReturnType<typeof resolveOpenRouterChoice>;
    try {
      choice = resolveOpenRouterChoice({ model: body.model, effort: body.effort });
    } catch (configError) {
      return NextResponse.json({ error: configError instanceof Error ? configError.message : 'AI is not configured.' }, { status: 500 });
    }
    const { model, effort } = choice;

    const callLLM = (systemPrompt: string, userContent: string, jsonFormat: boolean = true) =>
      callOpenRouter({ ...choice, systemPrompt, userContent, jsonFormat });

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

    let generatedRaw = await callLLM(generatorSystemPrompt, content, true);
    let meta: Partial<Metadata>;
    try {
      meta = parseJSONFromLLM(generatedRaw);
    } catch (err) {
      meta = {};
    }

    let progIssues = runProgrammaticValidation(meta);

    let evalJson = { isValid: true, feedback: '' };
    try {
      const evaluatorRaw = await callLLM(
        evaluatorSystemPrompt,
        `Original Content:\n${content}\n\nGenerated JSON:\n${JSON.stringify(meta, null, 2)}`,
        true
      );
      evalJson = parseJSONFromLLM(evaluatorRaw);
    } catch (err) {
      console.error('LLM Evaluator call failed, falling back to programmatic checks only:', err);
    }

    const needsRefinement = !evalJson.isValid || progIssues.length > 0;
    let finalMeta: Metadata;

    if (needsRefinement) {
      const allFeedback = [
        ...progIssues.map(issue => `[Programmatic] ${issue}`),
        ...(evalJson.feedback ? [`[Evaluator] ${evalJson.feedback}`] : [])
      ].join('\n');

      try {
        const refinerRaw = await callLLM(
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

    return NextResponse.json({
      success: true,
      model,
      effort,
      metadata: finalMeta,
    });
  } catch (err: any) {
    return NextResponse.json({ error: `Server error: ${err.message}` }, { status: 500 });
  }
}
