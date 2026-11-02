import { Deck, Stats, Activity } from "@/types";
import { readDecks, writeDecks, readStatsRaw, writeStats } from "@/lib/local";
import { markDirty, markDeleted, markStatsDirty, logActivity, scheduleFlush } from "@/lib/sync";

export function loadDecks(): Deck[] {
  return readDecks();
}
export function saveDecks(decks: Deck[]) {
  const prev = readDecks();
  const prevJson = new Map(prev.map((d) => [d.id, JSON.stringify(d)]));
  const nextIds = new Set(decks.map((d) => d.id));
  writeDecks(decks);
  for (const d of prev) if (!nextIds.has(d.id)) markDeleted(d.id);
  for (const d of decks) if (prevJson.get(d.id) !== JSON.stringify(d)) markDirty(d.id);
  scheduleFlush();
}
export function getDeck(id: string): Deck | undefined {
  return readDecks().find((d) => d.id === id);
}
export function upsertDeck(deck: Deck) {
  const all = readDecks();
  const idx = all.findIndex((d) => d.id === deck.id);
  if (idx >= 0) all[idx] = deck;
  else all.unshift(deck);
  saveDecks(all);
}
export function deleteDeck(id: string) {
  saveDecks(readDecks().filter((d) => d.id !== id));
}
export function deckProgress(d: Deck) {
  if (!d.cards.length) return 0;
  return Math.round((d.cards.filter((c) => c.known).length / d.cards.length) * 100);
}

const emptyStats: Stats = { streak: 0, lastDay: "", studySeconds: 0, studiedCards: 0, activity: [] };

export function loadStats(): Stats {
  return { ...emptyStats, ...readStatsRaw() } as Stats;
}
function saveStats(s: Stats) {
  writeStats(s);
  markStatsDirty();
  scheduleFlush();
}
function dayKey(d = new Date()) {
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
}
export function currentStreak(s: Stats) {
  if (!s.lastDay) return 0;
  const y = new Date();
  y.setDate(y.getDate() - 1);
  return s.lastDay === dayKey() || s.lastDay === dayKey(y) ? s.streak : 0;
}
export function recordStudy(cards: number, seconds: number) {
  const s = loadStats();
  const today = dayKey();
  if (s.lastDay !== today) {
    const y = new Date();
    y.setDate(y.getDate() - 1);
    s.streak = s.lastDay === dayKey(y) ? s.streak + 1 : 1;
    s.lastDay = today;
  }
  s.studiedCards += cards;
  s.studySeconds += seconds;
  saveStats(s);
}
export function addActivity(a: Activity) {
  const s = loadStats();
  s.activity = [a, ...s.activity].slice(0, 10);
  saveStats(s);
  logActivity(a);
}
export function formatTime(sec: number) {
  if (sec < 60) return `${sec}s`;
  const m = Math.floor(sec / 60);
  if (m < 60) return `${m}m`;
  return `${Math.floor(m / 60)}h ${m % 60}m`;
}
