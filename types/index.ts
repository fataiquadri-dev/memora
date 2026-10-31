export interface Flashcard {
  id: string;
  front: string;
  back: string;
  examLikely?: boolean;
  theme?: number;
  known?: boolean;
}
export interface Deck {
  id: string;
  title: string;
  createdAt: number;
  cards: Flashcard[];
  icon?: string;
  description?: string;
  favorite?: boolean;
  lastStudied?: number;
}
export interface Activity {
  deckTitle: string;
  icon: string;
  text: string;
  at: number;
}
export interface Stats {
  streak: number;
  lastDay: string;
  studySeconds: number;
  studiedCards: number;
  activity: Activity[];
}
