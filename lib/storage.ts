import { Deck, Stats, Activity } from "@/types";

const DECKS = "memora_decks";
const STATS = "memora_stats";
const isBrowser = () => typeof window !== "undefined";

export function loadDecks(): Deck[] {
  if (!isBrowser()) return [];
  try {
    return JSON.parse(localStorage.getItem(DECKS) || "[]");
  } catch {
    return [];
  }
}
export function saveDecks(decks: Deck[]) {
  try {
    localStorage.setItem(DECKS, JSON.stringify(decks));
  } catch {}
}
export function getDeck(id: string): Deck | undefined {
  return loadDecks().find((d) => d.id === id);
}
export function upsertDeck(deck: Deck) {
  const all = loadDecks();
  const idx = all.findIndex((d) => d.id === deck.id);
  if (idx >= 0) all[idx] = deck;
  else all.unshift(deck);
  saveDecks(all);
}
export function deleteDeck(id: string) {
  saveDecks(loadDecks().filter((d) => d.id !== id));
}
export function deckProgress(d: Deck) {
  if (!d.cards.length) return 0;
  return Math.round((d.cards.filter((c) => c.known).length / d.cards.length) * 100);
}

const emptyStats: Stats = { streak: 0, lastDay: "", studySeconds: 0, studiedCards: 0, activity: [] };

export function loadStats(): Stats {
  if (!isBrowser()) return { ...emptyStats };
  try {
    return { ...emptyStats, ...JSON.parse(localStorage.getItem(STATS) || "{}") };
  } catch {
    return { ...emptyStats };
  }
}
function saveStats(s: Stats) {
  try {
    localStorage.setItem(STATS, JSON.stringify(s));
  } catch {}
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
}
export function formatTime(sec: number) {
  if (sec < 60) return `${sec}s`;
  const m = Math.floor(sec / 60);
  if (m < 60) return `${m}m`;
  return `${Math.floor(m / 60)}h ${m % 60}m`;
}
