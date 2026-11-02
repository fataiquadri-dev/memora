import { Deck, Stats } from "@/types";

export const K = {
  decks: "memora_decks",
  stats: "memora_stats",
  name: "memora_name",
  dirty: "memora_dirty",
  deleted: "memora_deleted",
  statsDirty: "memora_stats_dirty",
  imported: "memora_imported",
};

const has = () => typeof window !== "undefined";

function read<T>(key: string, fallback: T): T {
  if (!has()) return fallback;
  try {
    const v = localStorage.getItem(key);
    return v ? (JSON.parse(v) as T) : fallback;
  } catch {
    return fallback;
  }
}
function write(key: string, value: unknown) {
  if (!has()) return;
  try {
    localStorage.setItem(key, JSON.stringify(value));
  } catch {}
}

export const readDecks = () => read<Deck[]>(K.decks, []);
export const writeDecks = (d: Deck[]) => write(K.decks, d);
export const readStatsRaw = () => read<Partial<Stats>>(K.stats, {});
export const writeStats = (s: Stats) => write(K.stats, s);
export const readList = (key: string) => read<string[]>(key, []);
export const writeList = (key: string, v: string[]) => write(key, v);
export const readFlag = (key: string) => read<boolean>(key, false);
export const writeFlag = (key: string, v: boolean) => write(key, v);
export function readName(): string {
  if (!has()) return "";
  try {
    return localStorage.getItem(K.name) || "";
  } catch {
    return "";
  }
}
