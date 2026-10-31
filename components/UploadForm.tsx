"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { upsertDeck } from "@/lib/storage";

export default function UploadForm() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [fileName, setFileName] = useState("");

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
    <form onSubmit={onSubmit} className="panel">
      <div className="two">
        <div>
          <label className="lbl">Subject</label>
          <input name="subject" placeholder="e.g. Biology" />
        </div>
        <div>
          <label className="lbl">Exam or level</label>
          <input name="exam" placeholder="e.g. WAEC, SAT" />
        </div>
      </div>

      <label className="drop">
        <span style={{ fontSize: "1.8rem" }}>📄</span>
        <strong>{fileName || "Tap to upload notes"}</strong>
        <span>PDF, .txt or .md</span>
        <input name="file" type="file" accept=".pdf,.txt,.md" onChange={(e) => setFileName(e.target.files?.[0]?.name || "")} />
      </label>

      <label className="lbl">Or paste your notes</label>
      <textarea name="text" rows={6} placeholder="Paste your notes here..." />

      <button className="btn block" disabled={loading}>
        {loading ? (<><span className="spinner" /> Reading your notes...</>) : "✨ Make flashcards"}
      </button>
      {error && <p className="err">{error}</p>}
    </form>
  );
}
