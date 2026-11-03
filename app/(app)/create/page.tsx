"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { Flashcard } from "@/types";
import { upsertDeck } from "@/lib/storage";
import { THEMES } from "@/lib/themes";
import { splitText } from "@/lib/chunk";
import { uid } from "@/lib/ids";

type Part = { title: string; icon: string; cards: { front: string; back: string; examLikely: boolean }[] };

const PDFJS = "https://cdnjs.cloudflare.com/ajax/libs/pdf.js/3.11.174/pdf.min.js";
const PDFJS_WORKER = "https://cdnjs.cloudflare.com/ajax/libs/pdf.js/3.11.174/pdf.worker.min.js";
const MAX_PARTS = 30;

let pdfPromise: Promise<any> | null = null;
function loadPdfJs(): Promise<any> {
  if (pdfPromise) return pdfPromise;
  pdfPromise = new Promise((resolve, reject) => {
    const w = window as any;
    if (w.pdfjsLib) return resolve(w.pdfjsLib);
    const s = document.createElement("script");
    s.src = PDFJS;
    s.onload = () => {
      w.pdfjsLib.GlobalWorkerOptions.workerSrc = PDFJS_WORKER;
      resolve(w.pdfjsLib);
    };
    s.onerror = () => {
      pdfPromise = null;
      reject(new Error("Could not load the PDF reader. Check your internet and try again."));
    };
    document.head.appendChild(s);
  });
  return pdfPromise;
}

async function readPdf(file: File, onPage: (p: number, n: number) => void): Promise<string> {
  const lib = await loadPdfJs();
  const pdf = await lib.getDocument({ data: await file.arrayBuffer() }).promise;
  let out = "";
  for (let p = 1; p <= pdf.numPages; p++) {
    const page = await pdf.getPage(p);
    const content = await page.getTextContent();
    out += content.items.map((it: any) => it.str + (it.hasEOL ? "\n" : " ")).join("") + "\n";
    onPage(p, pdf.numPages);
  }
  return out;
}

const sleep = (ms: number) => new Promise((r) => setTimeout(r, ms));

async function generate(text: string, subject: string, exam: string, part: number, parts: number): Promise<Part> {
  let lastError = "Something went wrong";
  for (let attempt = 0; attempt < 3; attempt++) {
    try {
      const res = await fetch("/api/generate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ text, subject, exam, part, parts }),
      });
      const raw = await res.text();
      let data: any = null;
      try {
        data = JSON.parse(raw);
      } catch {}
      if (res.ok && data) return data as Part;
      lastError =
        data?.error ||
        (res.status === 504
          ? "The AI took too long to answer."
          : res.status === 413
          ? "Those notes are too large for one request."
          : "The server sent an unexpected reply.");
    } catch (e: any) {
      lastError = e.message || lastError;
    }
    if (attempt < 2) await sleep(3000 * (attempt + 1));
  }
  throw new Error(lastError);
}

export default function CreatePage() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [status, setStatus] = useState("");
  const [error, setError] = useState("");
  const [fileName, setFileName] = useState("");

  async function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setError("");
    const fd = new FormData(e.currentTarget);
    const file = fd.get("file");
    let text = String(fd.get("text") || "");
    const name = String(fd.get("name") || "").trim();
    const subject = String(fd.get("subject") || "").trim();
    const exam = String(fd.get("exam") || "").trim();
    const description = String(fd.get("description") || "").trim();

    setLoading(true);
    setStatus("Reading your notes...");
    try {
      if (file instanceof File && file.size > 0) {
        if (file.size > 30 * 1024 * 1024) throw new Error("That file is over 30 MB. Please use a smaller one.");
        if (file.name.toLowerCase().endsWith(".pdf")) {
          text += "\n" + (await readPdf(file, (p, n) => setStatus(`Reading your PDF (page ${p} of ${n})...`)));
        } else {
          text += "\n" + (await file.text());
        }
      }
      const chunks = splitText(text.trim(), 4500);
      if (!chunks.length) {
        throw new Error("Not enough readable text found. If your PDF is scanned pictures, paste the text instead.");
      }
      if (chunks.length > MAX_PARTS) {
        throw new Error(
          `These notes are very long (${chunks.length} parts). Please upload a smaller section, about 30 to 50 pages at a time.`
        );
      }

      const results: (Part | null)[] = chunks.map(() => null);
      const queue = chunks.map((_, n) => n);
      let finished = 0;
      let failed = 0;
      let lastError = "";
      setStatus(`Writing flashcards (0 of ${chunks.length} parts done)...`);

      const worker = async () => {
        while (queue.length) {
          const n = queue.shift() as number;
          try {
            results[n] = await generate(chunks[n], subject, exam, n, chunks.length);
          } catch (err: any) {
            failed++;
            lastError = err.message;
          }
          finished++;
          setStatus(`Writing flashcards (${finished} of ${chunks.length} parts done)...`);
        }
      };
      await Promise.all(Array.from({ length: Math.min(3, chunks.length) }, worker));

      let title = "";
      let icon = "";
      let all: Part["cards"] = [];
      for (const r of results) {
        if (!r) continue;
        if (!title && r.title) title = r.title;
        if (!icon && r.icon) icon = r.icon;
        all = all.concat(r.cards);
      }

      const seen = new Set<string>();
      const unique = all.filter((c) => {
        const k = c.front.toLowerCase().replace(/\s+/g, " ");
        if (seen.has(k)) return false;
        seen.add(k);
        return true;
      });
      if (!unique.length) throw new Error(lastError || "No flashcards could be made from these notes.");

      const start = Math.floor(Math.random() * THEMES.length);
      const stamp = Date.now();
      const cards: Flashcard[] = unique.map((c, i) => ({
        id: uid(),
        front: c.front,
        back: c.back,
        examLikely: !!c.examLikely,
        theme: (start + i) % THEMES.length,
      }));

      const id = uid();
      upsertDeck({
        id,
        title: name || title || subject || "New deck",
        icon: icon || "📘",
        description,
        createdAt: stamp,
        cards,
      });
      if (failed) alert(`${failed} part(s) of your notes could not be processed, but the rest was saved.`);
      router.push(`/library/${id}`);
    } catch (err: any) {
      setError(err.message || "Something went wrong");
      setLoading(false);
    }
  }

  return (
    <>
      <h1>Create a <span>deck.</span></h1>
      <p className="sub">Upload your notes and Memora writes the flashcards for you.</p>

      <div className="form-card">
        <form onSubmit={onSubmit}>
          <label className="upload-box">
            <strong>📄</strong>
            {fileName || "Tap to upload your notes"}
            <small style={{ display: "block", marginTop: 5 }}>PDF, .txt or .md</small>
            <input name="file" type="file" accept=".pdf,.txt,.md" onChange={(e) => setFileName(e.target.files?.[0]?.name || "")} />
          </label>

          <div className="field">
            <label>Or paste your notes</label>
            <textarea name="text" placeholder="Paste your notes here..." />
          </div>

          <div className="two">
            <div className="field">
              <label>Subject</label>
              <input name="subject" placeholder="e.g. Biology" />
            </div>
            <div className="field">
              <label>Exam or level (optional)</label>
              <input name="exam" placeholder="e.g. WAEC, SAT, 200L" />
            </div>
          </div>

          <div className="field">
            <label>Deck name (optional, Memora can name it)</label>
            <input name="name" maxLength={50} placeholder="e.g. Cell Biology" />
          </div>

          <div className="field">
            <label>Description (optional)</label>
            <input name="description" maxLength={200} placeholder="What will you learn in this deck?" />
          </div>

          <div className="field">
            <label>Card format</label>
            <div className="format-grid">
              <div className="format-option selected">▤<b>Basic cards</b><small>Front &amp; back</small></div>
              <div className="format-option disabled">☷<b>Multiple choice</b><small>Coming soon</small></div>
            </div>
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
            <p>Longer notes take a little longer. Please keep this page open.</p>
          </div>
        </div>
      )}
    </>
  );
}
