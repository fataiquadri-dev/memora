import "./globals.css";
import type { Metadata, Viewport } from "next";

const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || "https://memora-flashcards-app.vercel.app";
const google = process.env.NEXT_PUBLIC_GOOGLE_VERIFICATION;

export const metadata: Metadata = {
  metadataBase: new URL(siteUrl),
  title: { default: "Memora: AI Flashcard Maker for Students", template: "%s | Memora" },
  description:
    "Memora turns your notes into flashcards in seconds. Upload a PDF or paste your notes, study with flip cards, and focus on exam-likely questions. Free for students.",
  keywords: ["Memora", "flashcards", "flashcard app", "AI flashcard maker", "study app", "exam revision", "notes to flashcards"],
  applicationName: "Memora",
  openGraph: {
    title: "Memora: AI Flashcard Maker for Students",
    description: "Turn your notes into flashcards in seconds and study smarter.",
    url: siteUrl,
    siteName: "Memora",
    type: "website",
  },
  verification: google ? { google } : undefined,
};
export const viewport: Viewport = { themeColor: "#050b19", width: "device-width", initialScale: 1 };

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link
          href="https://fonts.googleapis.com/css2?family=DM+Sans:wght@400;500;600;700;800&family=Space+Grotesk:wght@500;600;700&display=swap"
          rel="stylesheet"
        />
      </head>
      <body>{children}</body>
    </html>
  );
}
