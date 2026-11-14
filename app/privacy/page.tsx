import Link from "next/link";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Privacy Policy",
  description: "How Memora collects, uses and protects your information.",
  alternates: { canonical: "/privacy" },
};

const CONTACT_EMAIL = "fataiquadri446@gmail.com";

export default function Privacy() {
  return (
    <div className="lp">
      <nav className="lp-nav">
        <Link href="/" className="brand" style={{ margin: 0 }}>Memora</Link>
      </nav>
      <article className="legal">
        <h1>Privacy Policy</h1>
        <p>Last updated: November 14, 2026</p>

        <h2>What Memora is</h2>
        <p>Memora is a free study app that turns notes and topics into flashcards using AI.</p>

        <h2>Information we collect</h2>
        <ul>
          <li>Your name: the first name you enter, or the name on your Google account if you sign in with Google.</li>
          <li>If you sign in with Google: your Google account email address and name. We do not access your Gmail, contacts, files or any other Google data.</li>
          <li>Your flashcard decks, cards and study progress (streak, study time and cards studied).</li>
          <li>The notes, files and topics you submit so that flashcards can be made.</li>
        </ul>

        <h2>How we use it</h2>
        <p>We use this information only to run Memora: to make your flashcards, save your decks and progress, and let you open them on other devices. We do not sell your information and we do not show ads.</p>

        <h2>Services we use</h2>
        <ul>
          <li>Supabase stores account, deck and progress data.</li>
          <li>Google Gemini processes the notes and topics you submit to write flashcards. Under Google free-tier terms, submitted content may be used to improve Google products, so please do not submit confidential material.</li>
          <li>Google provides the Sign in with Google option.</li>
          <li>Vercel hosts the website and may collect basic technical and visit statistics.</li>
        </ul>

        <h2>Data on your device</h2>
        <p>Your decks are also kept in your browser storage on your device so that Memora works quickly. Clearing your browser data removes that local copy.</p>

        <h2>Keeping and deleting your data</h2>
        <p>You can delete decks inside the app at any time. To delete your account and all data stored about you, email us and we will remove it within 30 days.</p>

        <h2>Children</h2>
        <p>Memora is not directed at children under 13. If you believe a child has given us personal information, contact us and we will delete it.</p>

        <h2>Changes</h2>
        <p>We may update this policy and will change the date above when we do.</p>

        <h2>Contact</h2>
        <p>Questions or deletion requests: <a href={"mailto:" + CONTACT_EMAIL}>{CONTACT_EMAIL}</a></p>
      </article>
      <footer className="lp-footer"><Link href="/">Back to Memora</Link></footer>
    </div>
  );
}
