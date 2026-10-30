"use client";
import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import Link from "next/link";
import { Deck } from "@/types";
import { getDeck } from "@/lib/storage";
import FlashcardViewer from "@/components/FlashcardViewer";

export default function StudyPage() {
  const { id } = useParams<{ id: string }>();
  const [deck, setDeck] = useState<Deck | null>(null);
  useEffect(() => setDeck(getDeck(id) || null), [id]);

  if (!deck) return <p className="sub">Deck not found.</p>;
  return (
    <>
      <h1>{deck.title}</h1>
      <p className="sub"><Link href={`/decks/${id}`}>Edit deck</Link></p>
      <FlashcardViewer cards={deck.cards} />
    </>
  );
}
