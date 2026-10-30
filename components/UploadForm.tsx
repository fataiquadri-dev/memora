"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { upsertDeck } from "@/lib/storage";

export default function UploadForm() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  async function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      const res = await fetch("/api/generate", { method: "POST", body: new FormData(e.currentTarget) });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error);
      const id = String(Date.now());
      upsertDeck({ id, title: data.title, createdAt: Date.now(), cards: data.cards });
      router.push(`/decks/${id}`);
    } catch (err: any) {
      setError(err.message);
      setLoading(false);
    }
  }

  return (
    <form onSubmit={onSubmit} className="card">
      <label>Subject</label>
      <input name="subject" placeholder="e.g. Biology" />
      <label>Exam or level (optional)</label>
      <input name="exam" placeholder="e.g. WAEC, SAT, GCSE, 200L" />
      <label>Upload notes (PDF or .txt)</label>
      <input name="file" type="file" accept=".pdf,.txt,.md" />
      <label>Or paste notes</label>
      <textarea name="text" rows={6} placeholder="Paste your notes here..." />
      <button disabled={loading}>{loading ? "Creating flashcards..." : "Make flashcards"}</button>
      {error && <p className="err">{error}</p>}
    </form>
  );
}
