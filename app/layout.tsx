import "./globals.css";
import Link from "next/link";
import type { Metadata, Viewport } from "next";

export const metadata: Metadata = {
  title: "Memora",
  description: "Turn your notes into flashcards instantly.",
};
export const viewport: Viewport = { themeColor: "#0b0b14" };

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body>
        <div className="wrap">
          <nav className="nav">
            <Link href="/" className="logo">Memora</Link>
            <Link href="/decks" className="navlink">My decks</Link>
          </nav>
          {children}
        </div>
      </body>
    </html>
  );
}
