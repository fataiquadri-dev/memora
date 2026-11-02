import { createClient, SupabaseClient } from "@supabase/supabase-js";

let client: SupabaseClient | null = null;

export function getClient(): SupabaseClient | null {
  if (client) return client;
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
  if (!url || !key) return null;
  client = createClient(url, key, { auth: { persistSession: true, autoRefreshToken: true } });
  return client;
}

let sessionPromise: Promise<string | null> | null = null;

export function ensureUser(): Promise<string | null> {
  if (sessionPromise) return sessionPromise;
  sessionPromise = (async () => {
    const sb = getClient();
    if (!sb) return null;
    try {
      const { data } = await sb.auth.getSession();
      if (data.session) return data.session.user.id;
      const { data: d2, error } = await sb.auth.signInAnonymously();
      if (error || !d2.user) return null;
      return d2.user.id;
    } catch {
      return null;
    }
  })().then((id) => {
    if (!id) sessionPromise = null;
    return id;
  });
  return sessionPromise;
}
