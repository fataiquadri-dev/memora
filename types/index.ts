export interface Flashcard {
  id: string;
  front: string;
  back: string;
  examLikely?: boolean;
}
export interface Deck {
  id: string;
  title: string;
  createdAt: number;
  cards: Flashcard[];
}
