"use client";
import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { Deck, Flashcard } from "@/types";
import { upsertDeck, recordStudy, addActivity, deckProgress } from "@/lib/storage";
import ThemedCard from "./ThemedCard";

export default function StudySession({ initial }: { initial: Deck }) {
  const [deck, setDeck] = useState<Deck>(initial);
  const [queue, setQueue] = useState<Flashcard[]>(initial.cards);
  const [i, setI] = useState(0);
  const [flipped, setFlipped] = useState(false);
  const [examOnly, setExamOnly] = useState(false);
  const [missed, setMissed] = useState<string[]>([]);
  const [gotIt, setGotIt] = useState<string[]>([]);
  const [done, setDone] = useState(false);
  const last = useRef(Date.now());
  const reviewed = useRef(0);

  const flush = () => {
    const now = Date.now();
    const sec = Math.min(Math.round((now - last.current) / 1000), 600);
    last.current = now;
    if (sec > 0) recordStudy(0, sec);
  };
  useEffect(() => () => flush(), []);

  const begin = (cards: Flashcard[]) => {
    setQueue(cards);
    setI(0);
    setFlipped(false);
    setMissed([]);
    setGotIt([]);
    setDone(false);
    reviewed.current = 0;
    last.current = Date.now();
  };
  const pool = (ex: boolean) => (ex ? deck.cards.filter((c) => c.examLikely) : deck.cards);
  const toggleExam = () => {
    const ex = !examOnly;
    setExamOnly(ex);
    begin(pool(ex));
  };
  const shuffle = () => begin([...queue].sort(() => Math.random() - 0.5));

  const card = queue[i];

  const finish = () => {
    setDone(true);
    flush();
    addActivity({
      deckTitle: deck.title,
      icon: deck.icon || "📘",
      text: `Reviewed ${reviewed.current} cards`,
      at: Date.now(),
    });
  };

  const answer = (knew: boolean) => {
    if (!card) return;
    const updated: Deck = {
      ...deck,
      cards: deck.cards.map((c) => (c.id === card.id ? { ...c, known: knew } : c)),
      lastStudied: Date.now(),
    };
    setDeck(updated);
    upsertDeck(updated);
    recordStudy(1, 0);
    reviewed.current += 1;
    if (knew) setGotIt([...gotIt, card.id]);
    else setMissed([...missed, card.id]);
    if (i >= queue.length - 1) finish();
    else {
      setI(i + 1);
      setFlipped(false);
    }
  };

  if (!queue.length)
    return (
      <div className="empty">
        <p>No cards to show here.</p>
        {examOnly ? (
          <button className="primary" onClick={toggleExam}>Show all cards</button>
        ) : (
          <Link className="primary" href={`/library/${deck.id}`}>Add cards</Link>
        )}
      </div>
    );

  if (done)
    return (
      <div className="empty">
        <div style={{ fontSize: "2.6rem" }}>🎉</div>
        <div className="done-score">{gotIt.length} / {queue.length}</div>
        <p>{gotIt.length === queue.length ? "Perfect round! You know this deck." : "Nice work. Go again to lock them in."}</p>
        <div className="row-actions" style={{ justifyContent: "center", marginTop: 16 }}>
          {missed.length > 0 && (
            <button className="primary" onClick={() => begin(queue.filter((c) => missed.includes(c.id)))}>
              Study missed ({missed.length})
            </button>
          )}
          <button className="soft-btn" onClick={() => begin(pool(examOnly))}>Study again</button>
          <Link className="soft-btn" href="/library">Back to library</Link>
        </div>
      </div>
    );

  const pct = Math.round((i / queue.length) * 100);

  return (
    <div className="study-layout">
      <div className="study-card-wrap">
        <div className="study-top">
          <Link href="/study" className="back-btn">← Back</Link>
          <span className="study-deck">{deck.icon || "📘"} {deck.title} · {queue.length} cards</span>
        </div>

        <div className="chips-row">
          <button className={`chip ${examOnly ? "on" : ""}`} onClick={toggleExam}>⭐ Exam likely only</button>
          <button className="chip" onClick={shuffle}>🔀 Shuffle</button>
        </div>

        <ThemedCard key={card.id} card={card} big flipped={flipped} onFlip={() => setFlipped(!flipped)} />

        <div className="study-progress">
          <small>
            <span>{i + 1} / {queue.length}</span>
            <span>{pct}% complete</span>
          </small>
          <div className="progress"><i style={{ width: `${pct}%` }} /></div>
        </div>

        <div className="study-controls">
          <button className="control" onClick={() => answer(false)}>
            <span className="big">⏭</span>Skip
          </button>
          <div className="flip-col">
            <button className="control flip" onClick={() => setFlipped(!flipped)}>⟳</button>
            <span>Flip</span>
          </div>
          <button className="control" onClick={() => answer(true)}>
            <span className="big">✓</span>Got it!
          </button>
        </div>
      </div>

      <aside className="study-side">
        <h3>Session overview</h3>
        <p>Stay consistent. Every card you review strengthens your recall.</p>
        <div className="mini-stat"><span>Cards in deck</span><b>{deck.cards.length}</b></div>
        <div className="mini-stat"><span>Exam likely</span><b>{deck.cards.filter((c) => c.examLikely).length}</b></div>
        <div className="mini-stat"><span>Deck mastery</span><b>{deckProgress(deck)}%</b></div>
        <div className="mini-stat"><span>Got it this session</span><b>{gotIt.length}</b></div>
      </aside>
    </div>
  );
}
