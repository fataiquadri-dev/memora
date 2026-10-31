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
  const [ready, setReady] = useState(false);
  useEffect(() => { setDeck(getDeck(id) || null); setReady(true); }, [id]);

  if (!ready) return null;
  if (!deck) return <div className="panel empty"><p className="sub">Deck not found.</p><Link className="btn" href="/">Make a deck</Link></div>;
  const change = (d: Deck) => { setDeck(d); upsertDeck(d); };

  return (
    <>
      <div className="row" style={{ marginBottom: 14 }}>
        <Link className="btn" href={`/decks/${id}/study`}>▶ Study</Link>
        <Link className="btn ghost" href="/decks">All decks</Link>
      </div>
      <FlashcardEditor deck={deck} onChange={change} />
    </>
  );
}
