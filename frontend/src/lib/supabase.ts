import { createClient, type SupabaseClient } from '@supabase/supabase-js';

// Configure in .env.local (see .env.example). When either value is missing,
// the app falls back to saving data in this browser's localStorage.
const url = import.meta.env.VITE_SUPABASE_URL as string | undefined;
const key = import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY as string | undefined;

export const supabase: SupabaseClient | null = url && key ? createClient(url, key) : null;

let sessionPromise: Promise<string> | null = null;

/**
 * Makes sure there is a signed-in user and returns its id.
 * Without a login screen we use Supabase anonymous sign-in, so every browser gets its own user.
 * The promise is cached so parallel callers (e.g. React StrictMode) don't create two users.
 */
export function ensureUserId(): Promise<string> {
  if (!supabase) return Promise.reject(new Error('Supabase is not configured'));
  const client = supabase;

  sessionPromise ??= (async () => {
    const { data: sessionData, error: sessionError } = await client.auth.getSession();
    if (sessionError) throw sessionError;
    if (sessionData.session) return sessionData.session.user.id;

    const { data, error } = await client.auth.signInAnonymously();
    if (error) throw error;
    if (!data.user) throw new Error('Anonymous sign-in returned no user');
    return data.user.id;
  })().catch((error: unknown) => {
    sessionPromise = null; // allow a retry later
    throw error;
  });

  return sessionPromise;
}
