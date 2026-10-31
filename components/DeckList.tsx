"use client";
import { useEffect, useState } from "react";
import Link from "next/link";
import { Deck } from "@/types";
import { loadDecks, deleteDeck } from "@/lib/storage";

export default function DeckList() {
  const [decks, setDecks] = useState<Deck[]>([]);
  const [ready, setReady] = useState(false);
  useEffect(() => { setDecks(loadDecks()); setReady(true); }, []);

  if (!ready) return null;
  if (!decks.length)
    return (
      <div className="panel empty">
        <div style={{ fontSize: "2.5rem" }}>🗂️</div>
        <p className="sub">No decks yet. Make your first one from your notes.</p>
        <Link className="btn" href="/">✨ Create a deck</Link>
      </div>
    );

  return (
    <>
      {decks.map((d) => (
        <div className="panel deck-card" key={d.id}>
          <h3>{d.title}</h3>
          <p className="sub">{d.cards.length} cards · {new Date(d.createdAt).toLocaleDateString()}</p>
          <div className="row">
            <Link className="btn" href={`/decks/${d.id}/study`}>Study</Link>
            <Link className="btn ghost" href={`/decks/${d.id}`}>Edit</Link>
            <button className="mini danger" onClick={() => { if (confirm("Delete this deck?")) { deleteDeck(d.id); setDecks(loadDecks()); } }}>Delete</button>
          </div>
        </div>
      ))}
    </>
  );
}
