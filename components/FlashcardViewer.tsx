"use client";
import { useState } from "react";
import Link from "next/link";
import { Flashcard } from "@/types";

export default function FlashcardViewer({ cards, deckId }: { cards: Flashcard[]; deckId: string }) {
  const [list, setList] = useState(cards);
  const [i, setI] = useState(0);
  const [flipped, setFlipped] = useState(false);
  const [examOnly, setExamOnly] = useState(false);
  const [known, setKnown] = useState<string[]>([]);
  const [done, setDone] = useState(false);

  const shown = examOnly ? list.filter((c) => c.examLikely) : list;
  const card = shown[i];

  const reset = () => { setI(0); setFlipped(false); setKnown([]); setDone(false); };
  const shuffle = () => { setList([...list].sort(() => Math.random() - 0.5)); reset(); };
  const toggleExam = () => { setExamOnly(!examOnly); reset(); };
  const prev = () => { if (i > 0) { setI(i - 1); setFlipped(false); } };
  const mark = (knew: boolean) => {
    const others = known.filter((id) => id !== card.id);
    setKnown(knew ? [...others, card.id] : others);
    if (i >= shown.length - 1) setDone(true);
    else { setI(i + 1); setFlipped(false); }
  };

  if (!shown.length)
    return (
      <div className="panel empty">
        <p className="sub">No cards to show here.</p>
        {examOnly && <button className="btn" onClick={toggleExam}>Show all cards</button>}
      </div>
    );

  if (done) {
    const score = shown.filter((c) => known.includes(c.id)).length;
    return (
      <div className="panel empty">
        <div style={{ fontSize: "2.5rem" }}>🎉</div>
        <div className="score grad">{score} / {shown.length}</div>
        <p className="sub">{score === shown.length ? "Perfect round!" : "Nice work. Go again to lock them in."}</p>
        <div className="row" style={{ justifyContent: "center" }}>
          <button className="btn" onClick={reset}>Study again</button>
          <Link className="btn ghost" href={`/decks/${deckId}`}>Back to deck</Link>
        </div>
      </div>
    );
  }

  return (
    <>
      <div className="progress"><div style={{ width: `${((i + 1) / shown.length) * 100}%` }} /></div>
      <div className="hint">Card {i + 1} of {shown.length}</div>

      <div key={card.id} className={`fc big ${flipped ? "flipped" : ""}`} onClick={() => setFlipped(!flipped)}>
        <div className="fc-inner">
          <div className="face front">
            <span className="label">Question</span>
            {card.examLikely && <span className="tag">Exam likely</span>}
            <div className="txt">{card.front}</div>
          </div>
          <div className="face back">
            <span className="label">Answer</span>
            <div className="txt">{card.back}</div>
          </div>
        </div>
      </div>
      <div className="hint">Tap the card to flip</div>

      <div className="two-btn">
        <button className="btn bad" onClick={() => mark(false)}>✗ Still learning</button>
        <button className="btn ok" onClick={() => mark(true)}>✓ Got it</button>
      </div>
      <div className="row">
        <button className="mini" onClick={prev}>← Back</button>
        <button className="mini" onClick={shuffle}>🔀 Shuffle</button>
        <button className="mini" onClick={toggleExam}>{examOnly ? "Show all" : "⭐ Exam likely only"}</button>
      </div>
    </>
  );
}
