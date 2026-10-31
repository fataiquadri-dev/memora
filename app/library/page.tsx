"use client";
import Link from "next/link";
import { useEffect, useState } from "react";
import { Deck } from "@/types";
import { loadDecks, saveDecks, deckProgress } from "@/lib/storage";
import { themeStyle } from "@/lib/themes";

type Filter = "All" | "Recent" | "Favorites";

export default function Library() {
  const [decks, setDecks] = useState<Deck[]>([]);
  const [ready, setReady] = useState(false);
  const [filter, setFilter] = useState<Filter>("All");
  const [q, setQ] = useState("");
  useEffect(() => {
    setDecks(loadDecks());
    setReady(true);
  }, []);

  const week = Date.now() - 7 * 24 * 3600 * 1000;
  const list = decks.filter(
    (d) =>
      d.title.toLowerCase().includes(q.toLowerCase()) &&
      (filter === "All" ||
        (filter === "Favorites" && d.favorite) ||
        (filter === "Recent" && Math.max(d.lastStudied || 0, d.createdAt) > week))
  );

  const update = (next: Deck[]) => {
    setDecks(next);
    saveDecks(next);
  };
  const toggleFav = (id: string) => update(decks.map((d) => (d.id === id ? { ...d, favorite: !d.favorite } : d)));
  const remove = (id: string) => {
    if (confirm("Delete this deck from this device?")) update(decks.filter((d) => d.id !== id));
  };

  return (
    <>
      <h1>My <span>library.</span></h1>
      <p className="sub">All your learning decks, organised in one place.</p>

      <div className="toolbar">
        <input className="search" placeholder="⌕ Search your decks..." value={q} onChange={(e) => setQ(e.target.value)} />
        {(["All", "Recent", "Favorites"] as Filter[]).map((f) => (
          <button key={f} className={`filter ${filter === f ? "active" : ""}`} onClick={() => setFilter(f)}>
            {f === "All" ? "All decks" : f}
          </button>
        ))}
        <Link className="primary" href="/create">＋ Create</Link>
      </div>

      {ready && !list.length && (
        <div className="empty">No decks found. Create your first deck to get started.</div>
      )}

      <div className="deck-list">
        {list.map((d) => (
          <div className="deck-row" key={d.id} style={themeStyle({ id: d.id })}>
            <div className="deck-icon">{d.icon || "📘"}</div>
            <div className="deck-row-info">
              <b>{d.title}</b>
              <small>{d.cards.length} cards · {deckProgress(d)}% mastered</small>
              <div className="progress" style={{ maxWidth: 240 }}><i style={{ width: `${deckProgress(d)}%` }} /></div>
            </div>
            <div className="row-actions">
              <Link className="soft-btn" href={`/study/${d.id}`}>Study</Link>
              <Link className="soft-btn" href={`/library/${d.id}`}>Edit</Link>
              <button className="soft-btn" onClick={() => toggleFav(d.id)}>{d.favorite ? "★" : "☆"}</button>
              <button className="soft-btn danger" onClick={() => remove(d.id)}>Delete</button>
            </div>
          </div>
        ))}
      </div>
    </>
  );
}
