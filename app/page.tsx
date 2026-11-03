import Link from "next/link";
import type { Metadata } from "next";
import ReturningRedirect from "@/components/ReturningRedirect";

const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || "https://memora-flashcards-app.vercel.app";

export const metadata: Metadata = {
  title: { absolute: "Memora: Free AI Flashcard Maker for Students" },
  description:
    "Upload your notes and Memora writes flashcards for you with AI, flags the questions most likely to appear in exams, and helps you study with flip cards. Free for students.",
  alternates: { canonical: "/" },
};

const STEPS = [
  { t: "Add your notes", d: "Upload a PDF or text file, or paste your notes. Long notes are fine." },
  { t: "Memora writes the cards", d: "AI turns your notes into clear question and answer flashcards and marks the ones likely to appear in exams." },
  { t: "Study and track progress", d: "Flip cards, mark what you know, and watch your mastery, streak, and study time grow." },
];

const FEATURES = [
  { i: "🧠", t: "AI flashcards from your notes", d: "Every key idea, definition, and formula becomes a card. No typing them out by hand." },
  { i: "⭐", t: "Exam-likely tags", d: "Spot the cards most likely to be tested, and study only those when time is short." },
  { i: "🔄", t: "Flip-card study mode", d: "Tap to flip, mark Got it or Skip, and re-study the cards you missed." },
  { i: "✏️", t: "Edit anything", d: "Fix a word, add your own card, or delete the ones you do not need." },
  { i: "📊", t: "Progress and streaks", d: "See your mastery for each deck, your daily streak, and your total study time." },
  { i: "📱", t: "Made for your phone", d: "Works in your browser. There is nothing to install." },
];

const FAQ = [
  { q: "Is Memora free?", a: "Yes, Memora is free to use right now." },
  { q: "Do I need to create an account?", a: "No password is needed. Just enter your first name and start making flashcards." },
  { q: "What can I upload?", a: "PDF, .txt, and .md files, or you can paste text straight in. Scanned PDFs that are only pictures cannot be read yet." },
  { q: "How does Memora decide which cards are exam-likely?", a: "The AI rates each card by how likely it is to be tested for your subject and level, using your notes and its general knowledge. It is a helpful guide, not a guarantee." },
  { q: "Are my notes private?", a: "Your decks are saved on your device and backed up to your Memora account. Your notes are sent to an AI service (Google Gemini) only to write your flashcards, so please do not upload anything confidential." },
];

export default function Landing() {
  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "WebApplication",
    name: "Memora",
    url: siteUrl,
    applicationCategory: "EducationalApplication",
    operatingSystem: "Any (web browser)",
    description: "Memora turns student notes into flashcards with AI and helps them study with flip cards.",
    offers: { "@type": "Offer", price: "0", priceCurrency: "USD" },
  };

  return (
    <div className="lp">
      <ReturningRedirect />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />

      <nav className="lp-nav">
        <div className="brand" style={{ margin: 0 }}>Memora</div>
        <Link className="lp-ghost" href="/home">Open app</Link>
      </nav>

      <header className="lp-hero">
        <div>
          <h1>Turn your notes into <span>flashcards</span> in seconds.</h1>
          <p className="lp-lead">
            Upload a PDF or paste your notes. Memora uses AI to write the flashcards for you, flags the questions most likely to show up in exams, and gives you a clean flip-card mode to study.
          </p>
          <div className="lp-cta">
            <Link className="primary" href="/create">✨ Make my flashcards</Link>
            <a className="lp-ghost" href="#how">See how it works</a>
          </div>
          <p className="lp-note">Free to use. No password, just your first name.</p>
        </div>
        <div className="lp-cards" aria-hidden="true">
          <div className="lp-card q">
            <small>Question</small>
            <p>What is the powerhouse of the cell?</p>
            <span className="lp-pill">⭐ Exam likely</span>
          </div>
          <div className="lp-card a">
            <small>Answer</small>
            <p>The mitochondrion. It releases energy as ATP.</p>
          </div>
        </div>
      </header>

      <section className="lp-section" id="how">
        <h2>How Memora works</h2>
        <p className="lp-sub">From messy notes to a study-ready deck in three steps.</p>
        <div className="lp-steps">
          {STEPS.map((s, i) => (
            <div className="lp-step" key={s.t}>
              <b className="num">{i + 1}</b>
              <h3>{s.t}</h3>
              <p>{s.d}</p>
            </div>
          ))}
        </div>
      </section>

      <section className="lp-section">
        <h2>Everything you need to revise</h2>
        <p className="lp-sub">Preparing for WAEC, SAT, GCSE, or a university course? Add your subject and level, and Memora uses them to judge what is most likely to be tested.</p>
        <div className="lp-features">
          {FEATURES.map((f) => (
            <div className="lp-feature" key={f.t}>
              <span className="ic">{f.i}</span>
              <h3>{f.t}</h3>
              <p>{f.d}</p>
            </div>
          ))}
        </div>
      </section>

      <section className="lp-section lp-faq">
        <h2>Questions</h2>
        <p className="lp-sub">Quick answers before you start.</p>
        {FAQ.map((f) => (
          <details key={f.q}>
            <summary>{f.q}</summary>
            <p>{f.a}</p>
          </details>
        ))}
      </section>

      <section className="lp-final">
        <h2 style={{ marginBottom: 8 }}>Ready to study smarter?</h2>
        <p className="lp-sub" style={{ marginBottom: 20 }}>Turn your next set of notes into flashcards today.</p>
        <Link className="primary" href="/create">✨ Make my flashcards</Link>
      </section>

      <footer className="lp-footer">© 2026 Memora. Study smarter. Remember longer.</footer>
    </div>
  );
}
