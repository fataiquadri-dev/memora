"use client";
import { getName } from "@/lib/profile";
import { getName } from "@/lib/profile";
import Link from "next/link";
import { useEffect, useState } from "react";
import { Deck } from "@/types";
import { loadDecks, loadStats, deckProgress, formatTime } from "@/lib/storage";
import { themeStyle } from "@/lib/themes";

export default function Home() {
  const [decks, setDecks] = useState<Deck[]>([]);
  const [studied, setStudied] = useState(0);
  const [seconds, setSeconds] = useState(0);

  useEffect(() => {
    setDecks(loadDecks());
    const s = loadStats();
    setStudied(s.studiedCards);
    setSeconds(s.studySeconds);
  }, []);

  const total = decks.reduce((a, d) => a + d.cards.length, 0);

  return (
    <>
      <h1>Hi, <span>{getName()}</span> 👋</h1>
      <p className="sub">Your next big breakthrough starts with one card.</p>

      <div className="hero">
        <div className="hero-copy">
          <h2>Small steps.<br />Big results.</h2>
          <p>Your knowledge builds your future. Keep learning, one card at a time.</p>
          <Link className="primary" href={decks.length ? "/study" : "/create"}>
            {decks.length ? "Start studying →" : "Create your first deck →"}
          </Link>
        </div>
        <div className="brain">🧠</div>
      </div>

      <div className="section-head">
        <h2>My decks</h2>
        <Link className="text-btn" href="/library">View all decks →</Link>
      </div>

      {decks.length ? (
        <div className="deck-grid">
          {decks.slice(0, 4).map((d) => (
            <Link key={d.id} href={`/library/${d.id}`} className="deck" style={themeStyle({ id: d.id })}>
              <div className="deck-icon">{d.icon || "📘"}</div>
              <h3>{d.title}</h3>
              <small>{d.cards.length} cards</small>
              <div className="progress"><i style={{ width: `${deckProgress(d)}%` }} /></div>
              <div className="progress-meta"><span>Mastery</span><b>{deckProgress(d)}%</b></div>
            </Link>
          ))}
        </div>
      ) : (
        <div className="empty">
          No decks yet. Upload your notes and Memora will write the flashcards for you.
          <br />
          <Link className="primary" href="/create">✨ Create a deck</Link>
        </div>
      )}

      <div className="quick-row">
        <div className="stat"><span>▤</span><b>{total}</b><small>Total cards</small></div>
        <div className="stat"><span>✦</span><b>{studied}</b><small>Cards studied</small></div>
        <div className="stat"><span>◷</span><b>{formatTime(seconds)}</b><small>Study time</small></div>
      </div>
    </>
  );
}
