"use client";
import { useState } from "react";
import { Deck, Flashcard } from "@/types";

function FlipCard({ card, onEdit, onDelete }: { card: Flashcard; onEdit: () => void; onDelete: () => void }) {
  const [flipped, setFlipped] = useState(false);
  return (
    <div>
      <div className={`fc ${flipped ? "flipped" : ""}`} onClick={() => setFlipped(!flipped)}>
        <div className="fc-inner">
          <div className="face front">
            <span className="label">Question</span>
            {card.examLikely && <span className="tag">Exam likely</span>}
            <div className="txt">{card.front || "(empty)"}</div>
          </div>
          <div className="face back">
            <span className="label">Answer</span>
            <div className="txt">{card.back || "(empty)"}</div>
          </div>
        </div>
      </div>
      <div className="actions">
        <button className="mini" onClick={onEdit}>✏️ Edit</button>
        <button className="mini danger" onClick={onDelete}>🗑 Delete</button>
      </div>
    </div>
  );
}

type Draft = { id: string; front: string; back: string; examLikely?: boolean; isNew: boolean };

export default function FlashcardEditor({ deck, onChange }: { deck: Deck; onChange: (d: Deck) => void }) {
  const [draft, setDraft] = useState<Draft | null>(null);

  const save = () => {
    if (!draft) return;
    const card: Flashcard = { id: draft.id, front: draft.front.trim(), back: draft.back.trim(), examLikely: draft.examLikely };
    const cards = draft.isNew ? [...deck.cards, card] : deck.cards.map((c) => (c.id === card.id ? card : c));
    onChange({ ...deck, cards });
    setDraft(null);
  };
  const remove = (id: string) => {
    if (confirm("Delete this card?")) onChange({ ...deck, cards: deck.cards.filter((c) => c.id !== id) });
  };

  return (
    <>
      <input className="title-input" value={deck.title} onChange={(e) => onChange({ ...deck, title: e.target.value })} />
      <div className="chips">
        <span className="chip">{deck.cards.length} cards</span>
        <span className="chip">{deck.cards.filter((c) => c.examLikely).length} exam likely</span>
        <span className="chip">Tap a card to flip</span>
      </div>

      <div className="grid">
        {deck.cards.map((c) => (
          <FlipCard key={c.id} card={c} onEdit={() => setDraft({ ...c, isNew: false })} onDelete={() => remove(c.id)} />
        ))}
      </div>

      <div style={{ marginTop: 22 }}>
        <button className="btn ghost" onClick={() => setDraft({ id: String(Date.now()), front: "", back: "", isNew: true })}>+ Add card</button>
      </div>

      {draft && (
        <div className="modal-bg" onClick={() => setDraft(null)}>
          <div className="sheet" onClick={(e) => e.stopPropagation()}>
            <h3>{draft.isNew ? "New card" : "Edit card"}</h3>
            <label className="lbl">Question</label>
            <textarea rows={3} value={draft.front} onChange={(e) => setDraft({ ...draft, front: e.target.value })} />
            <label className="lbl">Answer</label>
            <textarea rows={4} value={draft.back} onChange={(e) => setDraft({ ...draft, back: e.target.value })} />
            <div className="row" style={{ marginTop: 18 }}>
              <button className="btn" onClick={save}>Save</button>
              <button className="btn ghost" onClick={() => setDraft(null)}>Cancel</button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
