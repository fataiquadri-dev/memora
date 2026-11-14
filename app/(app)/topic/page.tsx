"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { upsertDeck } from "@/lib/storage";
import { THEMES } from "@/lib/themes";
import { uid } from "@/lib/ids";
import { callAI, resetAi } from "@/lib/aiClient";
import ModeTabs from "@/components/ModeTabs";

const COUNTS = [10, 20, 30, 50];

export default function TopicPage() {
  const router = useRouter();
  const [count, setCount] = useState(20);
  const [loading, setLoading] = useState(false);
  const [status, setStatus] = useState("");
  const [error, setError] = useState("");

  async function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setError("");
    resetAi();
    const fd = new FormData(e.currentTarget);
    const topic = String(fd.get("topic") || "").trim();
    const level = String(fd.get("level") || "").trim();
    const name = String(fd.get("name") || "").trim();
    if (topic.length < 3) {
      setError("Tell me what you want to learn.");
      return;
    }
    setLoading(true);
    setStatus(`Writing ${count} flashcards on your topic...`);
    try {
      const data = await callAI("/api/topic", { topic, level, count }, setStatus);
      if (!data.cards.length) throw new Error("No flashcards came back. Try wording your topic differently.");
      const start = Math.floor(Math.random() * THEMES.length);
      const id = uid();
      upsertDeck({
        id,
        title: name || data.title || topic.slice(0, 40),
        icon: data.icon || "💡",
        description: topic.slice(0, 200),
        createdAt: Date.now(),
        cards: data.cards.map((c, i) => ({
          id: uid(),
          front: c.front,
          back: c.back,
          examLikely: !!c.examLikely,
          theme: (start + i) % THEMES.length,
        })),
      });
      router.push(`/library/${id}`);
    } catch (err: any) {
      setError(err.message || "Something went wrong");
      setLoading(false);
    }
  }

  return (
    <>
      <h1>Learn any <span>topic.</span></h1>
      <p className="sub">Tell Memora what you want to study and it writes the flashcards for you.</p>
      <ModeTabs active="topic" />

      <div className="form-card">
        <form onSubmit={onSubmit}>
          <div className="field">
            <label>What do you want to learn?</label>
            <textarea
              name="topic"
              placeholder="e.g. Photosynthesis, Newton's laws of motion, causes of World War 1..."
              maxLength={600}
            />
          </div>
          <div className="field">
            <label>Level or exam (optional)</label>
            <input name="level" placeholder="e.g. WAEC, SAT, 200L, JSS3" />
          </div>
          <div className="field">
            <label>How many cards?</label>
            <div className="chips-row">
              {COUNTS.map((n) => (
                <button type="button" key={n} className={`chip ${count === n ? "on" : ""}`} onClick={() => setCount(n)}>
                  {n}
                </button>
              ))}
            </div>
          </div>
          <div className="field">
            <label>Deck name (optional)</label>
            <input name="name" maxLength={50} placeholder="Memora can name it" />
          </div>
          <button className="primary" style={{ width: "100%" }} disabled={loading}>✨ Make flashcards</button>
          {error && <p className="err">{error}</p>}
        </form>
      </div>

      {loading && (
        <div className="overlay">
          <div className="overlay-card">
            <div className="spinner" />
            <b>{status}</b>
            <p>This usually takes under a minute. Please keep this page open.</p>
          </div>
        </div>
      )}
    </>
  );
}
