"use client";
import Link from "next/link";
import { useEffect, useState } from "react";
import { Deck } from "@/types";
import { loadDecks, deckProgress } from "@/lib/storage";
import { themeStyle } from "@/lib/themes";

export default function StudyPicker() {
  const [decks, setDecks] = useState<Deck[]>([]);
  const [ready, setReady] = useState(false);
  useEffect(() => {
    setDecks(loadDecks());
    setReady(true);
  }, []);

  return (
    <>
      <h1>Study <span>session.</span></h1>
      <p className="sub">Pick a deck and focus on understanding, not just memorising.</p>
      {ready && !decks.length && (
        <div className="empty">
          You have no decks yet.
          <br />
          <Link className="primary" href="/create">✨ Create a deck</Link>
        </div>
      )}
      <div className="deck-list">
        {decks.map((d) => (
          <div className="deck-row" key={d.id} style={themeStyle({ id: d.id })}>
            <div className="deck-icon">{d.icon || "📘"}</div>
            <div className="deck-row-info">
              <b>{d.title}</b>
              <small>{d.cards.length} cards · {deckProgress(d)}% mastered</small>
              <div className="progress" style={{ maxWidth: 240 }}><i style={{ width: `${deckProgress(d)}%` }} /></div>
            </div>
            <div className="row-actions">
              <Link className="primary" href={`/study/${d.id}`}>Study</Link>
            </div>
          </div>
        ))}
      </div>
    </>
  );
}
