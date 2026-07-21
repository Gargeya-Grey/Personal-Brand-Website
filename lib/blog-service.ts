import fs from 'fs/promises';
import path from 'path';
import { supabase, isSupabaseConfigured } from './supabase';
import { siteConfig } from './site-config';

export interface Article {
  id: number;
  slug: string;
  featured?: boolean;
  categories: string[];
  title: string;
  excerpt: string;
  author: string;
  authorRole: string;
  authorAvatar: string;
  date: string;
  readTime: string;
  takeaways: string[];
  content: string; // Markdown text
  illustrationType: 'diagram1' | 'diagram2' | 'diagram3' | 'diagram4' | 'diagram5' | 'diagram6' | 'diagram7' | 'diagram8' | 'cover';
  status: 'draft' | 'published';
  coverImage?: string;
  updatedAt?: string;
}

const dataDir = path.join(process.cwd(), 'data');
const dataFilePath = path.join(dataDir, 'articles.json');

// Short-TTL in-memory cache (multi-instance hosts eventually converge; writes update immediately)
let cachedArticles: Article[] | null = null;
let cacheLoadedAt = 0;
const CACHE_TTL_MS = 8_000;

/**
 * Circuit breaker: when Supabase is unreachable / misconfigured, stop hammering it
 * every slug/page request and fall back to local JSON quietly.
 */
let supabaseCooldownUntil = 0;
let supabaseFailureLogged = false;
const SUPABASE_COOLDOWN_MS = 60_000;

function isSupabaseUsable(): boolean {
  return isSupabaseConfigured() && Date.now() >= supabaseCooldownUntil;
}

function markSupabaseUnavailable(reason: unknown): void {
  supabaseCooldownUntil = Date.now() + SUPABASE_COOLDOWN_MS;
  if (!supabaseFailureLogged) {
    supabaseFailureLogged = true;
    const detail =
      reason && typeof reason === 'object'
        ? // Supabase errors often serialize poorly as {}
          JSON.stringify(reason, Object.getOwnPropertyNames(reason as object)) ||
          String(reason)
        : String(reason ?? 'unknown');
    console.warn(
      `[blog-service] Supabase unavailable — using local data/articles.json for ~${SUPABASE_COOLDOWN_MS / 1000}s.`,
      detail
    );
  }
}

// Standard initial seed articles mapped from the original React TSX layout to clean Markdown strings
const defaultArticles: Article[] = [
  {
    id: 1,
    slug: "how-rippling-went-ai-native",
    featured: true,
    categories: ["Case Studies", "Deep Agents", "LangSmith"],
    title: "How Rippling Went AI-Native Across Every Product in 6 Months with Deep Agents and LangSmith",
    excerpt: "Analyzing the end-to-end integration of LLM-orchestrated permission handlers, multi-agent compliance pipelines, and automated shadow evaluation processes in active production.",
    author: "Sofia Sulikowski",
    authorRole: "Technical Storyteller @ LangChain",
    authorAvatar: "https://api.dicebear.com/7.x/adventurer/svg?seed=sofia",
    date: "June 1, 2026",
    readTime: "6 min read",
    illustrationType: "diagram1",
    status: "published",
    takeaways: [
      "Rippling integrated deep agents across all payroll, compliance, and user onboarding modules within a single quarter, reducing ticket processing load by 48%.",
      "By enforcing strict typing constraints and structural agent graphs, engineers prevented cascading failures in multi-party approval sequences.",
      "Developing real-time shadow evaluation metrics on LangSmith allowed Rippling to parallel-test update prompts on representative production datasets before making revisions live."
    ],
    content: `> Today, enterprise scale requires teams to move from monolithic prompts to structured, streamable agentic graphs.

Rippling specializes in processing hyper-complex administrative workflows: payroll routing, regulatory compliance checks, security policies, and employee onboarding. When their product organization decided to embed generative intelligence, they bypassed standard chatbot sandboxes and constructed a cohesive, system-wide multi-agent mesh.

### 1. The Multi-Agent Compliance Mesh

Autonomous loops need clear authorization boundaries. In Rippling's new design, instead of routing raw user inputs to a single all-knowing LLM, inquiries trigger specialized agents operating on restricted DAGs (Directed Acyclic Graphs).

\`\`\`javascript
// Initialize strict LangGraph multi-agent compliance handler
const complianceGraph = new StateGraph(StateSchema)
  .addNode("payrollAgent", payrollHandler)
  .addNode("complianceGuard", regulatoryChecker)
  .addEdge("payrollAgent", "complianceGuard")
  .compile();
\`\`\`

This compartmentalization ensures that tax queries are processed by a system with strict access to local tax code rules, without exposing core personnel files.

### 2. Closing the Debug Loop with LangSmith

When a stateful connection breaks inside a multi-agent transaction, debugging is extraordinarily challenging without robust lineage tracking. Using LangSmith, Rippling maps the recursive steps taken by every node in the graph, instantly pinning down exactly where an alignment shift occurred.

Through custom trace parameters, they track user intent shifts across turns, observing how the model updates memory registers dynamically.`
  },
  {
    id: 2,
    slug: "introducing-langsmith-engine",
    featured: false,
    categories: ["LangSmith", "Observability & Evals"],
    title: "Introducing LangSmith Engine",
    excerpt: "Replacing the manual cycle of trace analysis. Clustered error reports trace execution chains directly back to your codebase with suggested developer pull requests.",
    author: "Ben Tannyhill",
    authorRole: "Principal Engineer @ LangSmith",
    authorAvatar: "https://api.dicebear.com/7.x/adventurer/svg?seed=ben",
    date: "May 13, 2026",
    readTime: "5 min read",
    illustrationType: "diagram2",
    status: "published",
    takeaways: [
      "LangSmith Engine continuously scans trace telemetry to cluster recurrent failures automatically.",
      "The system drafts target codebase patches based on diagnosed error causes, matching user prompt templates.",
      "Every resolved issue automatically generates custom online evaluators and updates offline evaluation datasets."
    ],
    content: `> Continuous diagnostic feedback mesh. Our new Engine analyzes trace groupings to suggest programmatic resolutions.

Since launching LangSmith, our mission has been to give developers visibility into the complex chain of steps their autonomous systems take. Trace viewers let you see what happened; today, we're launching the next evolution: **LangSmith Engine**, designed to automatically understand *why* it failed and help you deploy fixes.

### Automated Error Isolation

Historically, identifying a drift in performance involved parsing hundreds of raw system traces. LangSmith Engine groups these failed transactions continuously. Using advanced embeddings and clustering models, the Engine correlates traces suffering from similar underlying causes—such as context-retrieval latency, semantic hallucination, or routing syntax crashes.

\`\`\`json
// Sample metadata payload returned by LangSmith Engine diagnostics
{
  "cluster_id": "err_hallucination_v4",
  "confidence_metric": 0.94,
  "context_retrieval_fail": true,
  "suggested_remediation": "Update chunking overlap size in vector pipeline"
}
\`\`\`

This diagnostics mesh acts as a sentinel guarding production systems, guaranteeing swift alerts and insights when models deviate.`
  },
  {
    id: 3,
    slug: "we-built-smithdb",
    featured: false,
    categories: ["LangSmith", "Engineering"],
    title: "We built SmithDB, the data layer for agent observability",
    excerpt: "Why standard relational databases face performance bottlenecks when executing recursive analytics across billions of deep, multi-turn agent trace graphs.",
    author: "Ankush Gola",
    authorRole: "VP of Engineering @ LangChain",
    authorAvatar: "https://api.dicebear.com/7.x/adventurer/svg?seed=ankush",
    date: "May 13, 2026",
    readTime: "11 min read",
    illustrationType: "diagram3",
    status: "published",
    takeaways: [
      "Traditional columnar engines choke when reconstructing stateful, tree-like agent trace spans in real time.",
      "SmithDB introduces custom columnar graph encoding, minimizing JOIN overhead across multi-span turns.",
      "Specialized delta-compression strategies reduce memory footprint by 70%, with sub-100ms recursive trace lookups."
    ],
    content: `> Re-architecting database layers from scratch to support deep, stateful, open-schema telemetry loops.

Tracing recursive prompts creates unique data access patterns. Traditional databases are either highly optimized for analytical aggregation (columnar) or relational transaction speeds (row-based). However, LLMs and agent chains communicate in open-ended tree hierarchy spans.

### The Trace Span Problem

Every turn in an agent session contains nested child steps: tool calls, vector retrieves, sub-agent evaluations, and response formats. If you try to compile these trees across millions of concurrent users inside standard relational databases, query performance plunges due to complex network-hop JOIN calculations.

By encoding trace layers as pre-indexed, continuous delta-compressed structures, SmithDB aggregates analytical metrics instantly. It allows developers to query nested sessions with instantaneous performance, empowering lightning-fast iterations.`
  },
  {
    id: 4,
    slug: "building-workflows-for-agents",
    featured: false,
    categories: ["Deep Agents", "Open Source", "LangChain"],
    title: "Building workflows for agents with Skills and Interpreters",
    excerpt: "Isolating execution models from raw environments. Implementing sandboxed python nodes in active agent architectures to validate outputs safely.",
    author: "Hunter Lovell",
    authorRole: "Developer Advocate @ LangChain",
    authorAvatar: "https://api.dicebear.com/7.x/adventurer/svg?seed=hunter",
    date: "May 29, 2026",
    readTime: "13 min read",
    illustrationType: "diagram4",
    status: "published",
    takeaways: [
      "Dynamic tool execution requires dividing planning components from code-sandbox execution containers.",
      "Isolating executing agents prevents prompt injections and server breaches through sandboxed Linux runtime protocols.",
      "Robust execution monitoring pipes stdout/onerror logs directly back to the planning transformer to trigger self-corrected prompts."
    ],
    content: `> Executing code inside secure sandboxes guarantees safe agent calculations.

Giving LLMs access to code compilation is incredibly powerful. It changes machines from passive readers to active systems capable of analyzing math models, plotting arrays, and executing scripts. However, it exposes systems to extreme risks unless execution modules are completely sandboxed.

### Executing Code Safely: Isolation first

In our secure architecture, runtime tasks are dispatched from the primary Orchestrator to isolated gRPC containers running stateless, read-only interpreters. High-risk actions are mapped onto secure virtual zones. If the executing script fails, stderr messages are routed directly to the transformer, empowering the agent to refactor and retry.`
  },
  {
    id: 5,
    slug: "may-2026-newsletter",
    featured: false,
    categories: ["Newsletter", "LangChain"],
    title: "May 2026: LangChain Newsletter",
    excerpt: "Catch up on stateful routing, human-in-the-loop triggers, dynamic checkpointer revisions, and native multi-agent system layouts inside LangGraph server.",
    author: "The LangChain Team",
    authorRole: "Community & Editorial",
    authorAvatar: "https://api.dicebear.com/7.x/adventurer/svg?seed=newsletter",
    date: "May 27, 2026",
    readTime: "3 min read",
    illustrationType: "diagram5",
    status: "published",
    takeaways: [
      "LangGraph Server now directly manages stateful human approval triggers without background state-loss.",
      "Integrated dynamic memory partitions allow teams to fork sessions seamlessly during complex debugging.",
      "Sub-graph execution threads can now be allocated to independent server nodes for efficient parallel scale."
    ],
    content: `Welcome to the May 2026 edition of the LangChain newsletter! This month, we focus heavily on **Human-In-The-Loop** patterns and **LangGraph Server** scale-revisions.

As autonomous agent ecosystems mature, the need for humans to validate critical decisions becomes non-negotiable. Our team has delivered a fully dynamic state-interrupter mesh, making it seamless to halt calculations, query humans in custom UIs, and resume processes from precise state locations.

Sub-graph execution threads can now be allocated to independent server nodes for efficient parallel scale.`
  },
  {
    id: 6,
    slug: "how-lyft-built-an-agent-platform",
    featured: false,
    categories: ["Case Studies", "LangGraph", "LangSmith"],
    title: "How Lyft Built an Agent Platform for Customer Support with LangGraph and LangSmith",
    excerpt: "How Lyft orchestrates stateful, multi-agent frameworks to coordinate multi-turn support queries with human-level accuracy and minimal latency.",
    author: "Akshay Sharma",
    authorRole: "Staff Software Engineer @ Lyft",
    authorAvatar: "https://api.dicebear.com/7.x/adventurer/svg?seed=akshay",
    date: "May 27, 2026",
    readTime: "10 min read",
    illustrationType: "diagram6",
    status: "published",
    takeaways: [
      "Lyft scaled support agent routing using stateful LangGraph node patterns over multiple internal databases.",
      "Average user transaction times decreased by 35% with specialized semantic routing layers.",
      "Automated LangSmith evaluations validate safety guidelines on every model update."
    ],
    content: `> Customer support at scale requires complex state retention over long periods of conversation.

Coordinating support queries for millions of active riders and drivers demands high-accuracy responses on the fly. Lyft utilized the stateful graph features of LangGraph to build specialized support sub-agents: refund processing, scheduling adjustments, and safety escalations.

Using real-time telemetry from LangSmith, Lyft engineers evaluate models constantly, shielding users from unpredictable transitions or loop errors.`
  },
  {
    id: 7,
    slug: "mission-control-self-hosted",
    featured: false,
    categories: ["LangSmith", "Deployment"],
    title: "Mission Control: Operating Self-Hosted LangSmith on Kubernetes",
    excerpt: "An architectural template for enterprises requiring isolated tracing environments, custom ingress rules, and private keys behind corporate firewalls.",
    author: "Gethin Dibben",
    authorRole: "Technical Infrastructure Lead",
    authorAvatar: "https://api.dicebear.com/7.x/adventurer/svg?seed=gethin",
    date: "May 26, 2026",
    readTime: "6 min read",
    illustrationType: "diagram7",
    status: "published",
    takeaways: [
      "Scale-isolated Kubernetes setups allow running LangSmith behind strict data-privacy firewalls.",
      "Custom ingress parameters shield tracing keys with end-to-end cloud encryption.",
      "Direct connection templates unify ClickHouse metrics with local monitoring services."
    ],
    content: `For many enterprise organizations, raw request logs and trace payload data constitute highly sensitive information. In this guide, we lay out the complete production roadmap to deploy and scale self-hosted **LangSmith Engine environments on managed Kubernetes clusters**.

Through isolated data architectures, enterprise security groups guarantee that critical communication parameters remain within their designated clouds.`
  },
  {
    id: 8,
    slug: "from-token-streams-to-agent-streams",
    featured: false,
    categories: ["LangChain", "Open Source", "LangGraph"],
    title: "From Token Streams to Agent Streams: Designing better UX",
    excerpt: "Analyzing user-interface paradigms for multi-agent chains. Why raw token characters degrade browser layouts and how dynamic delta event streams preserve structure.",
    author: "Christian Bromann",
    authorRole: "Frontend Lead Engineer",
    authorAvatar: "https://api.dicebear.com/7.x/adventurer/svg?seed=christian",
    date: "May 21, 2026",
    readTime: "9 min read",
    illustrationType: "diagram8",
    status: "published",
    takeaways: [
      "Streaming raw token streams into web layouts degrades reading stability and interaction designs.",
      "Custom structured delta events align and update nested interface blocks progressively.",
      "Specifying client projections prevents visual flickers and layout shifts as agents execute subtasks."
    ],
    content: `> Streaming raw token streams into web layouts degrades reading stability and interaction designs.

When chatbots first arrived, simple output text streaming inside inline message components was completely sufficient. But when multiple agent nodes coordinate in complex recursive loops—planning, updating schemas, calling databases—streaming raw character characters results in severe interface flickering.

To provide satisfying, stable visual interactions, frontends should transition from raw token streams to **Agent State Stream structures**, updating complex layouts through modular state projections dynamically.`
  }
];

// Mapping helpers between database snake_case and code camelCase
function toCamelCase(dbArticle: any): Article {
  const rawAvatar = (dbArticle.author_avatar || dbArticle.authorAvatar || '') as string;
  const avatarBroken =
    !rawAvatar ||
    rawAvatar.includes('dicebear.com') ||
    rawAvatar.length < 4;

  return {
    id: dbArticle.id,
    slug: dbArticle.slug,
    featured: dbArticle.featured,
    categories: dbArticle.categories,
    title: dbArticle.title,
    excerpt: dbArticle.excerpt,
    author: dbArticle.author || siteConfig.name,
    authorRole: dbArticle.author_role || dbArticle.authorRole || siteConfig.authorRole,
    // Prefer real headshot over broken/empty/dicebear placeholders
    authorAvatar: avatarBroken ? siteConfig.authorAvatar : rawAvatar,
    date: dbArticle.date,
    readTime: dbArticle.read_time || dbArticle.readTime,
    takeaways: dbArticle.takeaways,
    content: dbArticle.content,
    illustrationType: dbArticle.illustration_type || dbArticle.illustrationType,
    status: dbArticle.status,
    coverImage: dbArticle.cover_image || dbArticle.coverImage,
    updatedAt: dbArticle.updated_at || dbArticle.updatedAt,
  };
}

function toSnakeCase(article: Article): any {
  return {
    id: article.id,
    slug: article.slug,
    featured: article.featured ?? false,
    categories: article.categories || [],
    title: article.title,
    excerpt: article.excerpt || '',
    author: article.author || '',
    author_role: article.authorRole || '',
    author_avatar: article.authorAvatar || '',
    date: article.date || '',
    read_time: article.readTime || '',
    takeaways: article.takeaways || [],
    content: article.content || '',
    illustration_type: article.illustrationType || 'diagram1',
    status: article.status || 'published',
    cover_image: article.coverImage || null,
    updated_at: article.updatedAt || new Date().toISOString(),
  };
}

/**
 * Ensures data directory exists and returns list of articles
 */
async function readLocalArticlesFile(): Promise<Article[] | null> {
  try {
    const fileContent = await fs.readFile(dataFilePath, 'utf-8');
    const parsed = JSON.parse(fileContent);
    return Array.isArray(parsed) ? (parsed as Article[]) : null;
  } catch {
    return null;
  }
}

export async function getArticles(): Promise<Article[]> {
  if (cachedArticles && Date.now() - cacheLoadedAt < CACHE_TTL_MS) {
    return cachedArticles;
  }

  const loadLocal = async (): Promise<Article[]> => {
    const local = await readLocalArticlesFile();
    cachedArticles = local || defaultArticles;
    cacheLoadedAt = Date.now();
    return cachedArticles || [];
  };

  if (!isSupabaseUsable()) {
    return loadLocal();
  }

  try {
    const { data, error } = await supabase
      .from('articles')
      .select('*')
      .order('id', { ascending: true });

    if (error) {
      markSupabaseUnavailable(error);
      return loadLocal();
    }
    // Recovery: clear failure latch after a successful read
    supabaseFailureLogged = false;
    cachedArticles = (data || []).map(toCamelCase);
    cacheLoadedAt = Date.now();
    return cachedArticles || [];
  } catch (error) {
    markSupabaseUnavailable(error);
    return loadLocal();
  }
}

/**
 * Cleans up orphaned cover images that are no longer referenced by any article.
 * Compares old articles list with new articles list and deletes images that were removed.
 */
async function cleanupOrphanedImages(oldArticles: Article[], newArticles: Article[], useSupabase: boolean): Promise<void> {
  const oldImages = oldArticles
    .map(a => a.coverImage)
    .filter((img): img is string => typeof img === 'string' && img.length > 0);

  const newImages = new Set(
    newArticles
      .map(a => a.coverImage)
      .filter((img): img is string => typeof img === 'string' && img.length > 0)
  );

  // Find images in old list that are no longer in use
  const orphanedImages = oldImages.filter(img => !newImages.has(img));
  if (orphanedImages.length === 0) return;

  if (useSupabase) {
    const bucket = supabase.storage.from('covers');
    const filenames: string[] = [];

    for (const imgUrl of orphanedImages) {
      if (imgUrl.includes('/storage/v1/object/public/covers/')) {
        const parts = imgUrl.split('/storage/v1/object/public/covers/');
        const rawFilename = parts[parts.length - 1];
        // Strip query params/hashes
        const filename = rawFilename.split('?')[0].split('#')[0];
        if (filename) filenames.push(filename);
      }
    }

    if (filenames.length > 0) {
      const { error } = await bucket.remove(filenames);
      if (error) console.error('Failed to delete files from Supabase Storage:', error);
    }
  } else {
    // Local fallback disk cleanup
    const coversDir = path.join(process.cwd(), 'public', 'covers');
    for (const imgUrl of orphanedImages) {
      if (imgUrl.startsWith('/covers/')) {
        const filename = imgUrl.replace('/covers/', '').split('?')[0].split('#')[0];
        const filePath = path.join(coversDir, filename);
        try {
          await fs.unlink(filePath);
        } catch (err: any) {
          if (err.code !== 'ENOENT') console.error('Failed to delete local image:', filePath, err);
        }
      }
    }
  }
}

/** Drop short-TTL memory cache so multi-instance hosts pick up writes faster. */
export function invalidateArticleCache(): void {
  cachedArticles = null;
  cacheLoadedAt = 0;
}

/** URL-safe slug: lowercase, hyphens only. */
export function sanitizeSlug(raw: string): string {
  return raw
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9\s-]/g, '')
    .replace(/\s+/g, '-')
    .replace(/-+/g, '-')
    .replace(/^-+|-+$/g, '')
    .slice(0, 120);
}

/**
 * Lightweight public listing fields (no markdown body) — lower latency / bandwidth.
 */
export async function getPublishedArticlesLite(): Promise<
  Omit<Article, 'content' | 'takeaways'>[]
> {
  const LIST_COLS =
    'id, slug, featured, categories, title, excerpt, author, author_role, author_avatar, date, read_time, illustration_type, status, cover_image, updated_at';

  if (isSupabaseUsable()) {
    try {
      const { data, error } = await supabase
        .from('articles')
        .select(LIST_COLS)
        .or('status.eq.published,status.is.null')
        .order('id', { ascending: false });

      if (error) {
        markSupabaseUnavailable(error);
      } else {
        supabaseFailureLogged = false;
        return (data || []).map((row) => {
          const a = toCamelCase({ ...row, content: '', takeaways: [] });
          const { content: _c, takeaways: _t, ...lite } = a;
          return lite;
        });
      }
    } catch (e) {
      markSupabaseUnavailable(e);
    }
  }

  const list = await getArticles();
  return list
    .filter((a) => isArticlePublished(a))
    .map(({ content: _c, takeaways: _t, ...lite }) => lite)
    .sort((a, b) => b.id - a.id);
}

/**
 * Single-row upsert — O(1) write instead of rewriting the full table.
 */
export async function upsertArticle(article: Article): Promise<boolean> {
  invalidateArticleCache();

  if (!isSupabaseConfigured()) {
    try {
      const list = (await readLocalArticlesFile()) || defaultArticles;
      const idx = list.findIndex((a) => a.id === article.id);
      const next = [...list];
      if (idx >= 0) next[idx] = article;
      else next.push(article);
      // Enforce single featured
      const normalized = article.featured
        ? next.map((a) => (a.id === article.id ? a : { ...a, featured: false }))
        : next;
      await fs.mkdir(dataDir, { recursive: true });
      await fs.writeFile(dataFilePath, JSON.stringify(normalized, null, 2), 'utf-8');
      cachedArticles = normalized;
      cacheLoadedAt = Date.now();
      return true;
    } catch (e) {
      console.error('Local upsert failed:', e);
      return false;
    }
  }

  try {
    // Clear other featured flags first if needed
    if (article.featured) {
      await supabase
        .from('articles')
        .update({ featured: false })
        .neq('id', article.id)
        .eq('featured', true);
    }

    const { error } = await supabase
      .from('articles')
      .upsert(toSnakeCase(article), { onConflict: 'id' });

    if (error) {
      console.error('Supabase upsert article failed:', error);
      return false;
    }
    invalidateArticleCache();
    return true;
  } catch (e) {
    console.error('upsertArticle failed:', e);
    return false;
  }
}

export async function deleteArticleById(id: number): Promise<boolean> {
  invalidateArticleCache();
  const existing = await getArticles();
  const removed = existing.find((a) => a.id === id);
  const remaining = existing.filter((a) => a.id !== id);

  if (!isSupabaseConfigured()) {
    try {
      if (removed?.featured && remaining[0]) remaining[0].featured = true;
      await fs.mkdir(dataDir, { recursive: true });
      await fs.writeFile(dataFilePath, JSON.stringify(remaining, null, 2), 'utf-8');
      cachedArticles = remaining;
      cacheLoadedAt = Date.now();
      if (removed) {
        cleanupOrphanedImages([removed], remaining, false).catch(() => {});
      }
      return true;
    } catch {
      return false;
    }
  }

  try {
    const { error } = await supabase.from('articles').delete().eq('id', id);
    if (error) {
      console.error('Supabase delete failed:', error);
      return false;
    }
    if (removed?.featured && remaining[0]) {
      await supabase.from('articles').update({ featured: true }).eq('id', remaining[0].id);
    }
    if (removed) {
      cleanupOrphanedImages([removed], remaining, true).catch(() => {});
    }
    invalidateArticleCache();
    return true;
  } catch (e) {
    console.error('deleteArticleById failed:', e);
    return false;
  }
}

/**
 * Full-list save (legacy). Prefer upsertArticle / deleteArticleById for CMS writes.
 */
export async function saveArticles(articles: Article[]): Promise<boolean> {
  const oldArticles = cachedArticles || [];
  cachedArticles = articles;
  cacheLoadedAt = Date.now();

  if (!isSupabaseConfigured()) {
    try {
      await fs.mkdir(dataDir, { recursive: true });
      await fs.writeFile(dataFilePath, JSON.stringify(articles, null, 2), 'utf-8');
      cleanupOrphanedImages(oldArticles, articles, false).catch((err) =>
        console.error('Failed local storage cleanup:', err)
      );
      return true;
    } catch (error) {
      console.error('Failed saving articles data file:', error);
      return false;
    }
  }

  try {
    const dbArticles = articles.map(toSnakeCase);
    const { error: upsertError } = await supabase
      .from('articles')
      .upsert(dbArticles, { onConflict: 'id' });

    if (upsertError) {
      console.error('Failed to upsert articles to Supabase:', upsertError);
      return false;
    }

    const idsToKeep = articles.map((a) => a.id);
    if (idsToKeep.length > 0) {
      // PostgREST: not.in.(1,2,3)
      const { error: deleteError } = await supabase
        .from('articles')
        .delete()
        .not('id', 'in', `(${idsToKeep.join(',')})`);
      if (deleteError) {
        console.error('Failed to clean up deleted articles in Supabase:', deleteError);
      }
    }

    cleanupOrphanedImages(oldArticles, articles, true).catch((err) =>
      console.error('Failed Supabase storage cleanup:', err)
    );

    invalidateArticleCache();
    return true;
  } catch (error) {
    console.error('Failed saving to Supabase:', error);
    return false;
  }
}

function normalizeSlug(slug: string): string {
  try {
    return decodeURIComponent(slug).trim().toLowerCase();
  } catch {
    return slug.trim().toLowerCase();
  }
}

/**
 * Direct Supabase slug lookup — reliable for posts published after the last deploy.
 */
export async function getArticleBySlug(slug: string): Promise<Article | null> {
  const want = normalizeSlug(slug);
  if (!want) return null;

  if (isSupabaseUsable()) {
    try {
      const { data, error } = await supabase
        .from('articles')
        .select('*')
        .eq('slug', slug.trim())
        .maybeSingle();

      if (error) {
        markSupabaseUnavailable(error);
      } else if (data) {
        return toCamelCase(data);
      }

      // ilike exact for case drift
      const { data: fuzzy, error: fuzzyErr } = await supabase
        .from('articles')
        .select('*')
        .ilike('slug', want)
        .maybeSingle();

      if (!fuzzyErr && fuzzy) return toCamelCase(fuzzy);
    } catch (e) {
      markSupabaseUnavailable(e);
    }
  }

  const list = await getArticles();
  return list.find((a) => normalizeSlug(a.slug || '') === want) || null;
}

export function isArticlePublished(article: Article | null | undefined): boolean {
  if (!article) return false;
  const s = (article.status || 'published').toString().trim().toLowerCase();
  return s === 'published' || s === '';
}

/** Max markdown body size (~500KB) — DoS guard for CMS. */
export const MAX_ARTICLE_CONTENT_CHARS = 500_000;
