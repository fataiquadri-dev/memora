"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { Flashcard } from "@/types";
import { upsertDeck } from "@/lib/storage";
import { THEMES } from "@/lib/themes";
import { splitText } from "@/lib/chunk";
import { uid } from "@/lib/ids";

type Card = { front: string; back: string; examLikely: boolean };
type Part = { title: string; icon: string; cards: Card[] };
type Source = { name: string; text: string };
type Job = { src: number; n: number; total: number; text: string };

const PDFJS = "https://cdnjs.cloudflare.com/ajax/libs/pdf.js/3.11.174/pdf.min.js";
const PDFJS_WORKER = "https://cdnjs.cloudflare.com/ajax/libs/pdf.js/3.11.174/pdf.worker.min.js";
const MAX_FILES = 20;
const MAX_FILE_MB = 30;
const CHUNK = 4500;

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

async function readFile(file: File, onPage: (p: number, n: number) => void): Promise<string> {
  if (file.name.toLowerCase().endsWith(".pdf")) return readPdf(file, onPage);
  return file.text();
}

const sleep = (ms: number) => new Promise((r) => setTimeout(r, ms));
const prettyName = (n: string) => n.replace(/\.[^.]+$/, "").replace(/[_-]+/g, " ").trim() || n;

function dedupe(cards: Card[]): Card[] {
  const seen = new Set<string>();
  return cards.filter((c) => {
    const k = c.front.toLowerCase().replace(/\s+/g, " ");
    if (seen.has(k)) return false;
    seen.add(k);
    return true;
  });
}

async function generate(
  text: string,
  subject: string,
  exam: string,
  part: number,
  parts: number,
  source: string
): Promise<Part> {
  let lastError = "Something went wrong";
  for (let attempt = 0; attempt < 4; attempt++) {
    try {
      const res = await fetch("/api/generate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ text, subject, exam, part, parts, source }),
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
    const limited = /429|quota|rate|exhausted|overload|503/i.test(lastError);
    if (attempt < 3) await sleep((limited ? 15000 : 3000) * (attempt + 1));
  }
  throw new Error(lastError);
}

export default function CreatePage() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [status, setStatus] = useState("");
  const [error, setError] = useState("");
  const [files, setFiles] = useState<File[]>([]);

  function addFiles(picked: File[]) {
    setFiles((prev) => {
      const next = [...prev];
      for (const f of picked) {
        if (next.length >= MAX_FILES) break;
        if (!next.some((x) => x.name === f.name && x.size === f.size)) next.push(f);
      }
      return next;
    });
  }
  const removeFile = (i: number) => setFiles((prev) => prev.filter((_, k) => k !== i));
  const sizeLabel = (b: number) =>
    b > 1024 * 1024 ? `${(b / 1024 / 1024).toFixed(1)} MB` : `${Math.max(1, Math.round(b / 1024))} KB`;

  async function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setError("");
    const fd = new FormData(e.currentTarget);
    const pasted = String(fd.get("text") || "").trim();
    const name = String(fd.get("name") || "").trim();
    const subject = String(fd.get("subject") || "").trim();
    const exam = String(fd.get("exam") || "").trim();
    const description = String(fd.get("description") || "").trim();
    const separate = fd.get("separate") === "on";

    if (!pasted && !files.length) {
      setError("Add at least one file or paste some notes.");
      return;
    }

    setLoading(true);
    setStatus("Getting ready...");
    let lock: any = null;
    try {
      try {
        lock = await (navigator as any).wakeLock?.request("screen");
      } catch {}

      // 1. Read every file, one at a time
      const sources: Source[] = [];
      const unreadable: string[] = [];
      if (pasted) sources.push({ name: "Pasted notes", text: pasted });
      for (let i = 0; i < files.length; i++) {
        const f = files[i];
        if (f.size > MAX_FILE_MB * 1024 * 1024) {
          unreadable.push(`${f.name} (over ${MAX_FILE_MB} MB)`);
          continue;
        }
        setStatus(`Reading ${f.name} (file ${i + 1} of ${files.length})...`);
        let text = "";
        try {
          text = await readFile(f, (p, n) =>
            setStatus(`Reading ${f.name}, page ${p} of ${n} (file ${i + 1} of ${files.length})...`)
          );
        } catch (err: any) {
          unreadable.push(`${f.name} (${err.message || "could not be read"})`);
          continue;
        }
        if (text.trim().length < 10) {
          unreadable.push(`${f.name} (no readable text)`);
          continue;
        }
        sources.push({ name: f.name, text });
      }
      if (!sources.length) {
        throw new Error(
          unreadable.length
            ? `Could not read: ${unreadable.join(", ")}. If a PDF is scanned pictures, paste the text instead.`
            : "Please add more notes."
        );
      }

      // 2. Cut everything into sections. Nothing is dropped.
      const jobs: Job[] = [];
      sources.forEach((s, si) => {
        const chunks = splitText(s.text, CHUNK);
        chunks.forEach((c, n) => jobs.push({ src: si, n, total: chunks.length, text: c }));
      });
      if (!jobs.length) throw new Error("Not enough readable text found.");

      if (jobs.length > 40) {
        const mins = Math.max(2, Math.round(((jobs.length / 3) * 12) / 60));
        const ok = confirm(
          `This is a lot of material (${jobs.length} sections). It will take about ${mins} minutes. Keep this page open and your screen on. Continue?`
        );
        if (!ok) {
          setLoading(false);
          return;
        }
      }

      // 3. Write cards for every section, 3 at a time
      const results: (Part | null)[] = jobs.map(() => null);
      const queue = jobs.map((_, i) => i);
      let done = 0;
      let lastErr = "";
      const run = async (i: number) => {
        const j = jobs[i];
        results[i] = await generate(j.text, subject, exam, j.n, j.total, sources[j.src].name);
      };
      const worker = async () => {
        while (queue.length) {
          const i = queue.shift() as number;
          try {
            await run(i);
          } catch (err: any) {
            lastErr = err.message;
          }
          done++;
          setStatus(`Writing flashcards (${done} of ${jobs.length} sections done)...`);
        }
      };
      setStatus(`Writing flashcards (0 of ${jobs.length} sections done)...`);
      await Promise.all(Array.from({ length: Math.min(3, jobs.length) }, worker));

      // 4. Second chance for any section that failed
      const retry = jobs.map((_, i) => i).filter((i) => !results[i]);
      for (let k = 0; k < retry.length; k++) {
        setStatus(`Retrying section ${k + 1} of ${retry.length} that did not go through...`);
        await sleep(6000);
        try {
          await run(retry[k]);
        } catch (err: any) {
          lastErr = err.message;
        }
      }
      const failed = jobs.map((_, i) => i).filter((i) => !results[i]);

      // 5. Build the deck(s)
      const bySource = sources.map((s) => ({ name: s.name, title: "", icon: "", cards: [] as Card[] }));
      jobs.forEach((j, i) => {
        const r = results[i];
        if (!r) return;
        const o = bySource[j.src];
        if (!o.title && r.title) o.title = r.title;
        if (!o.icon && r.icon) o.icon = r.icon;
        o.cards.push(...r.cards);
      });

      const toMake =
        separate && sources.length > 1
          ? bySource
              .filter((o) => o.cards.length)
              .map((o) => ({ title: prettyName(o.name), icon: o.icon, cards: dedupe(o.cards) }))
          : [
              {
                title: name || bySource.find((o) => o.title)?.title || subject || "New deck",
                icon: bySource.find((o) => o.icon)?.icon || "",
                cards: dedupe(bySource.flatMap((o) => o.cards)),
              },
            ];

      if (!toMake.some((d) => d.cards.length)) {
        throw new Error(lastErr || "No flashcards could be made from these notes.");
      }

      const stamp = Date.now();
      const ids: string[] = [];
      toMake.forEach((d, di) => {
        const start = Math.floor(Math.random() * THEMES.length);
        const cards: Flashcard[] = d.cards.map((c, i) => ({
          id: uid(),
          front: c.front,
          back: c.back,
          examLikely: !!c.examLikely,
          theme: (start + i) % THEMES.length,
        }));
        const id = uid();
        ids.push(id);
        upsertDeck({
          id,
          title: d.title || "New deck",
          icon: d.icon || "📘",
          description,
          createdAt: stamp - di,
          cards,
        });
      });

      // 6. Tell the student exactly what, if anything, was missed
      const notes: string[] = [];
      if (unreadable.length) {
        notes.push(`Could not read: ${unreadable.join(", ")}. Scanned pictures cannot be read yet, so paste their text instead.`);
      }
      if (failed.length) {
        const labels = failed
          .slice(0, 8)
          .map((i) => `${sources[jobs[i].src].name} (section ${jobs[i].n + 1} of ${jobs[i].total})`)
          .join("; ");
        notes.push(
          `${failed.length} section(s) could not be processed: ${labels}${failed.length > 8 ? "..." : ""}. The free AI limit may have been reached. Everything else was saved. Try those files again later.`
        );
      }
      if (notes.length) alert(notes.join("\n\n"));

      router.push(ids.length === 1 ? `/library/${ids[0]}` : "/library");
    } catch (err: any) {
      setError(err.message || "Something went wrong");
      setLoading(false);
    } finally {
      try {
        await lock?.release();
      } catch {}
    }
  }

  return (
    <>
      <h1>Create a <span>deck.</span></h1>
      <p className="sub">Add your notes and Memora writes flashcards from every part of them.</p>

      <div className="form-card">
        <form onSubmit={onSubmit}>
          <label className="upload-box">
            <strong>📄</strong>
            {files.length ? "Tap to add more files" : "Tap to add your notes"}
            <small style={{ display: "block", marginTop: 5 }}>
              PDF, .txt or .md. Select several files at once.
            </small>
            <input
              type="file"
              multiple
              accept=".pdf,.txt,.md"
              onChange={(e) => {
                const picked = Array.from(e.target.files || []);
                e.target.value = "";
                addFiles(picked);
              }}
            />
          </label>

          {files.length > 0 && (
            <div className="file-list">
              {files.map((f, i) => (
                <div className="file-row" key={f.name + f.size}>
                  <span className="n">📎 {f.name}</span>
                  <small>{sizeLabel(f.size)}</small>
                  <button type="button" onClick={() => removeFile(i)} aria-label="Remove file">✕</button>
                </div>
              ))}
            </div>
          )}

          {files.length > 1 && (
            <label className="check">
              <input type="checkbox" name="separate" />
              Make a separate deck for each file
            </label>
          )}

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
            <p>Every section of your notes is being read. Please keep this page open.</p>
          </div>
        </div>
      )}
    </>
  );
}
