import Link from "next/link";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Terms of Service",
  description: "The rules for using Memora.",
  alternates: { canonical: "/terms" },
};

const CONTACT_EMAIL = "fataiquadri446@gmail.com";

export default function Terms() {
  return (
    <div className="lp">
      <nav className="lp-nav">
        <Link href="/" className="brand" style={{ margin: 0 }}>Memora</Link>
      </nav>
      <article className="legal">
        <h1>Terms of Service</h1>
        <p>Last updated: November 14, 2026</p>

        <h2>Using Memora</h2>
        <p>By using Memora you agree to these terms. Memora is a free study tool and is provided as it is, without guarantees.</p>

        <h2>AI-made flashcards</h2>
        <p>Flashcards are written by AI and can contain mistakes or miss details. Always check important facts against your textbook or teacher. Exam-likely tags are a guide, not a promise of what will be asked.</p>

        <h2>Your content</h2>
        <p>You keep ownership of the notes you upload. You confirm you have the right to use them and that they are not unlawful or confidential. Please do not upload anyone else private information.</p>

        <h2>Acceptable use</h2>
        <p>Do not misuse Memora, try to break or overload it, or use it to produce harmful or illegal content.</p>

        <h2>Availability</h2>
        <p>We may change, limit or stop parts of Memora at any time, including because of usage limits on the AI service we rely on.</p>

        <h2>Liability</h2>
        <p>To the extent allowed by law, Memora and its owner are not responsible for losses that come from using the app or relying on its flashcards.</p>

        <h2>Contact</h2>
        <p>Questions: <a href={"mailto:" + CONTACT_EMAIL}>{CONTACT_EMAIL}</a></p>
      </article>
      <footer className="lp-footer"><Link href="/">Back to Memora</Link></footer>
    </div>
  );
}
