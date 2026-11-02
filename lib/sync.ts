import type { SupabaseClient } from "@supabase/supabase-js";
import { Deck } from "@/types";
import { ensureUser, getClient } from "@/lib/supabase";
import { THEMES } from "@/lib/themes";
import { uid, isUuid } from "@/lib/ids";
import {
  K,
  readDecks,
  writeDecks,
  readStatsRaw,
  readList,
  writeList,
  readFlag,
  writeFlag,
  readName,
} from "@/lib/local";

let chain: Promise<unknown> = Promise.resolve();
function enqueue(fn: () => Promise<unknown>) {
  chain = chain.then(fn).catch(() => {});
}

export function markDirty(id: string) {
  const list = readList(K.dirty);
  if (!list.includes(id)) writeList(K.dirty, [...list, id]);
}
function removeDirty(id: string) {
  writeList(K.dirty, readList(K.dirty).filter((x) => x !== id));
}
export function markDeleted(id: string) {
  removeDirty(id);
  const list = readList(K.deleted);
  if (!list.includes(id)) writeList(K.deleted, [...list, id]);
}
export function markStatsDirty() {
  writeFlag(K.statsDirty, true);
}

async function pushDeck(sb: SupabaseClient, d: Deck) {
  const { error } = await sb.from("decks").upsert({
    id: d.id,
    title: d.title || "Untitled",
    icon: d.icon || "📘",
    description: d.description || "",
    favorite: !!d.favorite,
    last_studied: d.lastStudied ? new Date(d.lastStudied).toISOString() : null,
    created_at: new Date(d.createdAt || Date.now()).toISOString(),
  });
  if (error) throw error;

  const rows = d.cards.map((c, i) => ({
    id: c.id,
    deck_id: d.id,
    front: c.front,
    back: c.back,
    exam_likely: !!c.examLikely,
    theme: c.theme ?? i % THEMES.length,
    known: !!c.known,
    position: i,
  }));
  for (let i = 0; i < rows.length; i += 200) {
    const { error: e2 } = await sb.from("cards").upsert(rows.slice(i, i + 200));
    if (e2) throw e2;
  }

  const { data: remote, error: e3 } = await sb.from("cards").select("id").eq("deck_id", d.id).limit(5000);
  if (e3) throw e3;
  const keep = new Set(d.cards.map((c) => c.id));
  const gone = (remote || []).map((r: any) => r.id as string).filter((id) => !keep.has(id));
  for (let i = 0; i < gone.length; i += 100) {
    await sb.from("cards").delete().in("id", gone.slice(i, i + 100));
  }
}

async function flush() {
  const sb = getClient();
  if (!sb) return;
  const user = await ensureUser();
  if (!user) return;

  // One-time import of what is already saved on this phone
  if (!readFlag(K.imported)) {
    readDecks().forEach((d) => markDirty(d.id));
    markStatsDirty();
    const acts = (readStatsRaw().activity || []).slice().reverse();
    if (acts.length) {
      await sb.from("activity").insert(
        acts.map((a) => ({
          deck_title: a.deckTitle,
          icon: a.icon,
          text: a.text,
          created_at: new Date(a.at).toISOString(),
        }))
      );
    }
    writeFlag(K.imported, true);
  }

  for (const id of readList(K.deleted)) {
    if (!isUuid(id)) {
      writeList(K.deleted, readList(K.deleted).filter((x) => x !== id));
      continue;
    }
    const { error } = await sb.from("decks").delete().eq("id", id);
    if (!error) writeList(K.deleted, readList(K.deleted).filter((x) => x !== id));
  }

  for (const id of readList(K.dirty)) {
    const deck = readDecks().find((d) => d.id === id);
    removeDirty(id);
    if (!deck) continue;
    try {
      await pushDeck(sb, deck);
    } catch {
      markDirty(id);
    }
  }

  if (readFlag(K.statsDirty)) {
    writeFlag(K.statsDirty, false);
    const s = readStatsRaw();
    const { error } = await sb.from("profiles").upsert({
      id: user,
      name: readName() || "Student",
      streak: s.streak || 0,
      last_day: s.lastDay || "",
      study_seconds: s.studySeconds || 0,
      studied_cards: s.studiedCards || 0,
    });
    if (error) markStatsDirty();
  }
}

let timer: any = null;
export function scheduleFlush() {
  if (typeof window === "undefined") return;
  clearTimeout(timer);
  timer = setTimeout(() => enqueue(flush), 1200);
}

export function logActivity(a: { deckTitle: string; icon: string; text: string; at: number }) {
  if (typeof window === "undefined") return;
  enqueue(async () => {
    const sb = getClient();
    const user = await ensureUser();
    if (!sb || !user) return;
    await sb.from("activity").insert({
      deck_title: a.deckTitle,
      icon: a.icon,
      text: a.text,
      created_at: new Date(a.at).toISOString(),
    });
  });
}

let started = false;
export function startSync() {
  if (typeof window === "undefined" || started) return;
  if (!readName()) return;
  started = true;
  enqueue(flush);
}

// Old decks used timestamp ids. Supabase needs real unique ids, so convert them once.
function normalizeLocalIds() {
  const decks = readDecks();
  let changed = false;
  const next = decks.map((d) => {
    let id = d.id;
    if (!isUuid(id)) {
      id = uid();
      changed = true;
    }
    const cards = d.cards.map((c) => {
      if (isUuid(c.id)) return c;
      changed = true;
      return { ...c, id: uid() };
    });
    return { ...d, id, cards };
  });
  if (changed) writeDecks(next);
}

if (typeof window !== "undefined") {
  normalizeLocalIds();
  startSync();
  window.addEventListener("online", scheduleFlush);
}
