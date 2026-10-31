"use client";
import { useState } from "react";
import { Flashcard } from "@/types";
import { themeOf, themeStyle } from "@/lib/themes";

export default function ThemedCard({
  card,
  big,
  flipped,
  onFlip,
}: {
  card: Flashcard;
  big?: boolean;
  flipped?: boolean;
  onFlip?: () => void;
}) {
  const [inner, setInner] = useState(false);
  const on = flipped ?? inner;
  const toggle = () => (onFlip ? onFlip() : setInner(!inner));
  const t = themeOf(card);

  return (
    <div className={`tcard ${big ? "big" : ""} ${on ? "flipped" : ""}`} style={themeStyle(card)} onClick={toggle}>
      <div className="tcard-inner">
        <div className="face front">
          <span className="face-badge">{t.icon}</span>
          <span className="face-label">Question</span>
          {card.examLikely && <span className="pill">⭐ Exam likely</span>}
          <div className="face-text">{card.front || "(empty)"}</div>
          <span className="tap-hint">Tap to reveal the answer</span>
        </div>
        <div className="face back">
          <span className="face-badge">{t.icon}</span>
          <span className="face-label">Answer</span>
          <div className="face-text">{card.back || "(empty)"}</div>
          <span className="tap-hint">Tap to return to the question</span>
        </div>
      </div>
    </div>
  );
}
