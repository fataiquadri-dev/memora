"use client";
import { useEffect, useState } from "react";
import Link from "next/link";
import { Deck } from "@/types";
import { loadDecks, deleteDeck } from "@/lib/storage";

export default function DeckList() {
  const [decks, setDecks] = useState<Deck[]>([]);
  useEffect(() => setDecks(loadDecks()), []);

  if (!decks.length) return <p className="sub">No decks yet.</p>;
  return (
    <>
      {decks.map((d) => (
        <div className="card" key={d.id}>
          <strong>{d.title}</strong>
          <p className="sub">{d.cards.length} cards</p>
          <div className="row">
            <Link className="btn" href={`/decks/${d.id}/study`}>Study</Link>
            <Link className="btn ghost" href={`/decks/${d.id}`}>Edit</Link>
            <button className="danger" onClick={() => { deleteDeck(d.id); setDecks(loadDecks()); }}>Delete</button>
          </div>
        </div>
      ))}
    </>
  );
}
