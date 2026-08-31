import 'server-only';
import fs from 'fs/promises';
import path from 'path';
import { supabase, isSupabaseConfigured } from './supabase';
import {
  buildTaste,
  emptyWeek,
  letterIdForSunday,
  mergeIngest,
  normalizeTimeZone,
  publicWeek,
  sanitizeWeek,
  upcomingSunday,
  type NewsletterTaste,
  type NewsletterWeek,
} from './newsletter-model';

const dataDir = path.join(process.cwd(), 'data');
const dataFilePath = path.join(dataDir, 'newsletter-weeks.json');

let cachedWeeks: NewsletterWeek[] | null = null;
let cacheLoadedAt = 0;
const CACHE_TTL_MS = 2_000;

function isSupabaseUsable(): boolean {
  return isSupabaseConfigured();
}

async function loadLocal(): Promise<NewsletterWeek[]> {
  try {
    const raw = await fs.readFile(dataFilePath, 'utf-8');
    const list = JSON.parse(raw) as unknown;
    if (!Array.isArray(list)) return [];
    return list.map((row) => sanitizeWeek(row));
  } catch {
    return [];
  }
}

async function saveLocal(weeks: NewsletterWeek[]): Promise<void> {
  await fs.mkdir(dataDir, { recursive: true });
  await fs.writeFile(dataFilePath, JSON.stringify(weeks, null, 2), 'utf-8');
}

function rowToWeek(row: {
  id: string;
  week_of?: string;
  stage?: string;
  payload?: unknown;
  created_at?: string;
  updated_at?: string;
}): NewsletterWeek {
  const payload = isRecord(row.payload) ? row.payload : {};
  return sanitizeWeek({
    ...payload,
    id: row.id,
    weekOf: row.week_of || payload.weekOf,
    stage: row.stage || payload.stage,
    createdAt: payload.createdAt || row.created_at,
    updatedAt: payload.updatedAt || row.updated_at,
  });
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return Boolean(value) && typeof value === 'object' && !Array.isArray(value);
}

export function newsletterUsesCloud(): boolean {
  return isSupabaseUsable();
}

export async function getNewsletterWeeks(): Promise<NewsletterWeek[]> {
  if (cachedWeeks && Date.now() - cacheLoadedAt < CACHE_TTL_MS) return cachedWeeks;

  if (isSupabaseUsable()) {
    try {
      const { data, error } = await supabase
        .from('newsletter_weeks')
        .select('id, week_of, stage, payload, created_at, updated_at')
        .order('week_of', { ascending: false });
      if (error) throw error;
      const weeks = (data || []).map(rowToWeek);
      if (weeks.length === 0) {
        const local = await loadLocal();
        if (local.length) {
          cachedWeeks = local;
          cacheLoadedAt = Date.now();
          return local;
        }
      }
      cachedWeeks = weeks;
      cacheLoadedAt = Date.now();
      return weeks;
    } catch (err) {
      console.warn('[newsletter] Supabase list failed, using local JSON.', err);
    }
  }

  const local = await loadLocal();
  cachedWeeks = local;
  cacheLoadedAt = Date.now();
  return local;
}

export async function getNewsletterWeek(id: string): Promise<NewsletterWeek | null> {
  const weeks = await getNewsletterWeeks();
  return weeks.find((w) => w.id === id || w.slug === id) || null;
}

export async function getWeekBySlug(slug: string): Promise<NewsletterWeek | null> {
  const weeks = await getNewsletterWeeks();
  return weeks.find((w) => w.slug === slug || w.id === slug || w.weekOf === slug) || null;
}

export async function getPublicNotes(): Promise<NewsletterWeek[]> {
  const weeks = await getNewsletterWeeks();
  return weeks.filter(publicWeek).sort((a, b) => b.weekOf.localeCompare(a.weekOf));
}

export async function getCurrentWeek(now = new Date()): Promise<NewsletterWeek> {
  const sunday = upcomingSunday(now);
  const id = letterIdForSunday(sunday);
  const existing = await getNewsletterWeek(id);
  if (existing) return existing;
  return emptyWeek(sunday, now);
}

export async function upsertNewsletterWeek(week: NewsletterWeek): Promise<NewsletterWeek> {
  const clean = sanitizeWeek(week);
  clean.updatedAt = new Date().toISOString();

  if (isSupabaseUsable()) {
    const { error } = await supabase.from('newsletter_weeks').upsert(
      {
        id: clean.id,
        week_of: clean.weekOf,
        stage: clean.stage,
        payload: clean,
        updated_at: clean.updatedAt,
        created_at: clean.createdAt,
      },
      { onConflict: 'id' }
    );
    if (error) {
      console.warn('[newsletter] Supabase upsert failed:', error);
      throw new Error(error.message);
    }
  }

  const weeks = await getNewsletterWeeks();
  const idx = weeks.findIndex((w) => w.id === clean.id);
  if (idx >= 0) weeks[idx] = clean;
  else weeks.unshift(clean);
  cachedWeeks = weeks;
  cacheLoadedAt = Date.now();
  await saveLocal(weeks).catch(() => undefined);
  return clean;
}

export async function ingestNewsletterWeek(incoming: unknown): Promise<NewsletterWeek> {
  const incomingWeek = sanitizeWeek(incoming);
  const existing = await getNewsletterWeek(incomingWeek.id);
  const merged = mergeIngest(existing, incoming);
  return upsertNewsletterWeek(merged);
}

export async function getNewsletterTaste(): Promise<NewsletterTaste> {
  const weeks = await getNewsletterWeeks();
  return buildTaste(weeks);
}

export async function upsertSubscriberTimezone(input: {
  email: string;
  timezone?: string;
  source?: string;
}): Promise<void> {
  const email = input.email.trim().toLowerCase();
  const timezone = normalizeTimeZone(input.timezone);
  const source = (input.source || 'site').slice(0, 64);
  if (!isSupabaseUsable()) return;
  const { error } = await supabase.from('newsletter_subscribers').upsert(
    {
      email,
      timezone,
      source,
      subscribed_at: new Date().toISOString(),
    },
    { onConflict: 'email' }
  );
  if (error) console.warn('[newsletter] subscriber upsert failed:', error);
}

export async function getSubscriberTimezones(): Promise<Map<string, string>> {
  const map = new Map<string, string>();
  if (!isSupabaseUsable()) return map;
  try {
    const { data, error } = await supabase
      .from('newsletter_subscribers')
      .select('email, timezone');
    if (error) throw error;
    for (const row of data || []) {
      if (row && typeof row.email === 'string') {
        map.set(row.email.toLowerCase(), normalizeTimeZone(row.timezone));
      }
    }
  } catch (err) {
    console.warn('[newsletter] timezone list failed:', err);
  }
  return map;
}

export async function recordReadPing(input: {
  issueId: string;
  sessionId: string;
  seconds: number;
}): Promise<void> {
  if (!isSupabaseUsable()) return;
  const issueId = input.issueId.slice(0, 80);
  const sessionId = input.sessionId.slice(0, 80);
  const seconds = Math.max(0, Math.min(20 * 60, Math.round(input.seconds)));
  const { error } = await supabase.from('newsletter_reads').upsert(
    {
      issue_id: issueId,
      session_id: sessionId,
      seconds,
      last_ping_at: new Date().toISOString(),
    },
    { onConflict: 'issue_id,session_id' }
  );
  if (error) console.warn('[newsletter] read ping failed:', error);
}

export async function getReadSeconds(issueId: string): Promise<number[]> {
  if (!isSupabaseUsable()) return [];
  try {
    const { data, error } = await supabase
      .from('newsletter_reads')
      .select('seconds')
      .eq('issue_id', issueId);
    if (error) throw error;
    return (data || [])
      .map((row) => (row && typeof row.seconds === 'number' ? row.seconds : 0))
      .filter((n) => n > 0);
  } catch {
    return [];
  }
}
