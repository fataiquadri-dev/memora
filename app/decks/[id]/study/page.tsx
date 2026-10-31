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
  const [ready, setReady] = useState(false);
  useEffect(() => { setDeck(getDeck(id) || null); setReady(true); }, [id]);

  if (!ready) return null;
  if (!deck) return <div className="panel empty"><p className="sub">Deck not found.</p><Link className="btn" href="/">Make a deck</Link></div>;

  return (
    <>
      <h1 className="hero" style={{ fontSize: "1.6rem" }}>{deck.title}</h1>
      <p className="sub"><Link href={`/decks/${id}`}>← Edit deck</Link></p>
      <FlashcardViewer cards={deck.cards} deckId={id} />
    </>
  );
}
