"use client";
import { useState } from "react";
import Link from "next/link";
import { Deck, Flashcard } from "@/types";
import { THEMES } from "@/lib/themes";
import { deckProgress } from "@/lib/storage";
import ThemedCard from "./ThemedCard";

type Draft = Flashcard & { isNew: boolean };

export default function DeckEditor({ deck, onChange }: { deck: Deck; onChange: (d: Deck) => void }) {
  const [draft, setDraft] = useState<Draft | null>(null);

  const save = () => {
    if (!draft) return;
    const { isNew, ...rest } = draft;
    const card: Flashcard = { ...rest, front: rest.front.trim(), back: rest.back.trim() };
    const cards = isNew ? [...deck.cards, card] : deck.cards.map((c) => (c.id === card.id ? card : c));
    onChange({ ...deck, cards });
    setDraft(null);
  };
  const remove = (id: string) => {
    if (confirm("Delete this card?")) onChange({ ...deck, cards: deck.cards.filter((c) => c.id !== id) });
  };
  const add = () =>
    setDraft({
      id: String(Date.now()),
      front: "",
      back: "",
      theme: Math.floor(Math.random() * THEMES.length),
      isNew: true,
    });

  return (
    <>
      <div className="editor-head">
        <input className="title-input" value={deck.title} onChange={(e) => onChange({ ...deck, title: e.target.value })} />
        <button className="icon-btn" onClick={() => onChange({ ...deck, favorite: !deck.favorite })}>
          {deck.favorite ? "★" : "☆"}
        </button>
      </div>

      <div className="chips-row" style={{ marginTop: 10 }}>
        <span className="chip">{deck.cards.length} cards</span>
        <span className="chip">{deck.cards.filter((c) => c.examLikely).length} exam likely</span>
        <span className="chip">{deckProgress(deck)}% mastered</span>
      </div>

      <div className="row-actions" style={{ justifyContent: "flex-start", marginTop: 6 }}>
        <Link className="primary" href={`/study/${deck.id}`}>▶ Study</Link>
        <button className="soft-btn" onClick={add}>＋ Add card</button>
      </div>

      <div className="card-grid">
        {deck.cards.map((c) => (
          <div key={c.id}>
            <ThemedCard card={c} />
            <div className="card-actions">
              <button className="soft-btn" onClick={() => setDraft({ ...c, isNew: false })}>✏️ Edit</button>
              <button className="soft-btn danger" onClick={() => remove(c.id)}>🗑 Delete</button>
            </div>
          </div>
        ))}
      </div>

      {draft && (
        <div className="modal-bg" onClick={() => setDraft(null)}>
          <div className="sheet" onClick={(e) => e.stopPropagation()}>
            <h3>{draft.isNew ? "New card" : "Edit card"}</h3>
            <div className="field">
              <label>Question</label>
              <textarea value={draft.front} onChange={(e) => setDraft({ ...draft, front: e.target.value })} />
            </div>
            <div className="field">
              <label>Answer</label>
              <textarea value={draft.back} onChange={(e) => setDraft({ ...draft, back: e.target.value })} />
            </div>
            <div className="sheet-actions">
              <button className="primary" onClick={save}>Save</button>
              <button className="soft-btn" onClick={() => setDraft(null)}>Cancel</button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
