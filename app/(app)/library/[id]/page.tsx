"use client";
import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import Link from "next/link";
import { Deck } from "@/types";
import { getDeck, upsertDeck } from "@/lib/storage";
import DeckEditor from "@/components/DeckEditor";

export default function DeckPage() {
  const { id } = useParams<{ id: string }>();
  const [deck, setDeck] = useState<Deck | null>(null);
  const [ready, setReady] = useState(false);
  useEffect(() => {
    setDeck(getDeck(id) || null);
    setReady(true);
  }, [id]);

  if (!ready) return null;
  if (!deck)
    return (
      <div className="empty">
        Deck not found.
        <br />
        <Link className="primary" href="/create">Make a deck</Link>
      </div>
    );

  const change = (d: Deck) => {
    setDeck(d);
    upsertDeck(d);
  };

  return (
    <>
      <Link href="/library" className="back-btn">← Library</Link>
      <DeckEditor deck={deck} onChange={change} />
    </>
  );
}
