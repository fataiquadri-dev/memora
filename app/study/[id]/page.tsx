"use client";
import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import Link from "next/link";
import { Deck } from "@/types";
import { getDeck } from "@/lib/storage";
import StudySession from "@/components/StudySession";

export default function StudyDeckPage() {
  const { id } = useParams<{ id: string }>();
  const [deck, setDeck] = useState<Deck | null>(null);
  const [ready, setReady] = useState(false);
  useEffect(() => {
    setDeck(getDeck(id) || null);
    setReady(true);
  }, [id]);

  if (!ready) return null;
  if (!deck)
    return (
      <div className="empty">
        Deck not found.
        <br />
        <Link className="primary" href="/library">Go to library</Link>
      </div>
    );

  return (
    <>
      <h1>Study <span>session.</span></h1>
      <p className="sub">Focus on understanding, not just memorising.</p>
      <StudySession initial={deck} />
    </>
  );
}
