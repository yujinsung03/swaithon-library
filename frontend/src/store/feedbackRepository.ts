import { ensureUserId, supabase } from '../lib/supabase';
import type { FeedbackEntry, NewFeedbackEntry } from './feedbackBook';

// Where Feedback Book entries live. Components only talk to this interface,
// so switching between localStorage and Supabase needs no UI changes.
export interface FeedbackRepository {
  mode: 'local' | 'supabase';
  list(): Promise<FeedbackEntry[]>;
  add(entry: NewFeedbackEntry): Promise<FeedbackEntry>;
  remove(id: string): Promise<void>;
  updateMemo(id: string, memo: string): Promise<void>;
  /** Saves entry.starred. */
  setStarred(entry: FeedbackEntry): Promise<void>;
}

/* ---------------- localStorage ---------------- */

const STORAGE_KEY = 'feedback-book-v1';

function readLocal(): FeedbackEntry[] {
  try {
    const saved = window.localStorage.getItem(STORAGE_KEY);
    if (!saved) return [];
    const parsed: unknown = JSON.parse(saved);
    return Array.isArray(parsed) ? (parsed as FeedbackEntry[]) : [];
  } catch {
    return [];
  }
}

function writeLocal(entries: FeedbackEntry[]) {
  try {
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(entries));
  } catch {
    // Storage can be unavailable (private mode, quota); the in-memory list still works.
  }
}

function createId() {
  return typeof crypto !== 'undefined' && 'randomUUID' in crypto
    ? crypto.randomUUID()
    : `${Date.now()}-${Math.random().toString(36).slice(2)}`;
}

const localRepository: FeedbackRepository = {
  mode: 'local',
  async list() {
    return readLocal();
  },
  async add(entry) {
    const full = { ...entry, id: createId(), createdAt: Date.now(), memo: '' } as FeedbackEntry;
    writeLocal([full, ...readLocal()]);
    return full;
  },
  async remove(id) {
    writeLocal(readLocal().filter((entry) => entry.id !== id));
  },
  async updateMemo(id, memo) {
    writeLocal(readLocal().map((entry) => (entry.id === id ? { ...entry, memo } : entry)));
  },
  async setStarred({ id, starred }) {
    writeLocal(readLocal().map((entry) => (entry.id === id ? { ...entry, starred } : entry)));
  },
};

/* ---------------- Supabase ---------------- */

interface FeedbackRow {
  id: string;
  kind: 'speak' | 'listen';
  korean: string;
  memo: string;
  payload: Record<string, unknown>;
  created_at: string;
}

const TABLE = 'feedback_entries';
const COLUMNS = 'id, kind, korean, memo, payload, created_at';

function rowToEntry(row: FeedbackRow): FeedbackEntry {
  return {
    ...row.payload,
    id: row.id,
    kind: row.kind,
    korean: row.korean,
    memo: row.memo,
    createdAt: Date.parse(row.created_at),
  } as FeedbackEntry;
}

function entryToPayload(entry: NewFeedbackEntry & { starred?: boolean }): Record<string, unknown> {
  // Kind-specific fields (and the star) go into the jsonb payload column, so no table change is needed.
  const starred = entry.starred ?? false;
  if (entry.kind === 'speak') {
    const { sourceText, intentEnglish, tone, corrections } = entry;
    return { sourceText, intentEnglish, tone, corrections, starred };
  }
  const { english, expressions } = entry;
  return { english, expressions, starred };
}

function requireClient() {
  if (!supabase) throw new Error('Supabase is not configured');
  return supabase;
}

const supabaseRepository: FeedbackRepository = {
  mode: 'supabase',
  async list() {
    await ensureUserId();
    const { data, error } = await requireClient()
      .from(TABLE)
      .select(COLUMNS)
      .order('created_at', { ascending: false });
    if (error) throw error;
    return (data as FeedbackRow[]).map(rowToEntry);
  },
  async add(entry) {
    await ensureUserId();
    const { data, error } = await requireClient()
      .from(TABLE)
      .insert({ kind: entry.kind, korean: entry.korean, payload: entryToPayload(entry) })
      .select(COLUMNS)
      .single();
    if (error) throw error;
    return rowToEntry(data as FeedbackRow);
  },
  async remove(id) {
    await ensureUserId();
    const { error } = await requireClient().from(TABLE).delete().eq('id', id);
    if (error) throw error;
  },
  async updateMemo(id, memo) {
    await ensureUserId();
    const { error } = await requireClient().from(TABLE).update({ memo }).eq('id', id);
    if (error) throw error;
  },
  async setStarred(entry) {
    await ensureUserId();
    const { error } = await requireClient().from(TABLE).update({ payload: entryToPayload(entry) }).eq('id', entry.id);
    if (error) throw error;
  },
};

export const feedbackRepository: FeedbackRepository = supabase ? supabaseRepository : localRepository;
