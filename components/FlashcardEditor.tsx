"use client";
import { Deck } from "@/types";

export default function FlashcardEditor({ deck, onChange }: { deck: Deck; onChange: (d: Deck) => void }) {
  const update = (id: string, field: "front" | "back", value: string) =>
    onChange({ ...deck, cards: deck.cards.map((c) => (c.id === id ? { ...c, [field]: value } : c)) });
  const remove = (id: string) => onChange({ ...deck, cards: deck.cards.filter((c) => c.id !== id) });
  const add = () =>
    onChange({ ...deck, cards: [...deck.cards, { id: String(Date.now()), front: "", back: "" }] });

  return (
    <>
      <input value={deck.title} onChange={(e) => onChange({ ...deck, title: e.target.value })} />
      {deck.cards.map((c) => (
        <div className="card" key={c.id}>
          {c.examLikely && <span className="tag">likely exam question</span>}
          <textarea rows={2} value={c.front} placeholder="Front" onChange={(e) => update(c.id, "front", e.target.value)} />
          <textarea rows={3} value={c.back} placeholder="Back" onChange={(e) => update(c.id, "back", e.target.value)} />
          <button className="danger" onClick={() => remove(c.id)}>Delete card</button>
        </div>
      ))}
      <button className="ghost" onClick={add}>+ Add card</button>
    </>
  );
}
