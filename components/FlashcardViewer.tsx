"use client";
import { useState } from "react";
import { Flashcard } from "@/types";

export default function FlashcardViewer({ cards }: { cards: Flashcard[] }) {
  const [list, setList] = useState(cards);
  const [i, setI] = useState(0);
  const [flipped, setFlipped] = useState(false);
  const [examOnly, setExamOnly] = useState(false);

  const shown = examOnly ? list.filter((c) => c.examLikely) : list;
  const card = shown[i];
  if (!card) return <p className="sub">No cards to show.</p>;

  const go = (n: number) => { setI((i + n + shown.length) % shown.length); setFlipped(false); };
  const shuffle = () => { setList([...list].sort(() => Math.random() - 0.5)); setI(0); setFlipped(false); };

  return (
    <>
      <div className="card flip" onClick={() => setFlipped(!flipped)}>
        {flipped ? card.back : card.front}
      </div>
      <p className="sub">{i + 1} / {shown.length} · tap card to flip</p>
      <div className="row">
        <button className="ghost" onClick={() => go(-1)}>← Prev</button>
        <button onClick={() => go(1)}>Next →</button>
        <button className="ghost" onClick={shuffle}>Shuffle</button>
        <button className="ghost" onClick={() => { setExamOnly(!examOnly); setI(0); setFlipped(false); }}>
          {examOnly ? "Show all" : "Exam-likely only"}
        </button>
      </div>
    </>
  );
}
