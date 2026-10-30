import { Deck } from "@/types";

const KEY = "memora_decks";

export function loadDecks(): Deck[] {
  if (typeof window === "undefined") return [];
  try {
    return JSON.parse(localStorage.getItem(KEY) || "[]");
  } catch {
    return [];
  }
}
export function saveDecks(decks: Deck[]) {
  localStorage.setItem(KEY, JSON.stringify(decks));
}
export function getDeck(id: string): Deck | undefined {
  return loadDecks().find((d) => d.id === id);
}
export function upsertDeck(deck: Deck) {
  const decks = loadDecks().filter((d) => d.id !== deck.id);
  saveDecks([deck, ...decks]);
}
export function deleteDeck(id: string) {
  saveDecks(loadDecks().filter((d) => d.id !== id));
}
