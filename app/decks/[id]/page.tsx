"use client";
import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import Link from "next/link";
import { Deck } from "@/types";
import { getDeck, upsertDeck } from "@/lib/storage";
import FlashcardEditor from "@/components/FlashcardEditor";

export default function DeckPage() {
  const { id } = useParams<{ id: string }>();
  const [deck, setDeck] = useState<Deck | null>(null);
  useEffect(() => setDeck(getDeck(id) || null), [id]);

  if (!deck) return <p className="sub">Deck not found.</p>;
  const change = (d: Deck) => { setDeck(d); upsertDeck(d); };

  return (
    <>
      <div className="row">
        <Link className="btn" href={`/decks/${id}/study`}>Study</Link>
        <Link className="btn ghost" href="/decks">All decks</Link>
      </div>
      <br />
      <FlashcardEditor deck={deck} onChange={change} />
    </>
  );
}
