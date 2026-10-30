import Link from "next/link";
import UploadForm from "@/components/UploadForm";

export default function Home() {
  return (
    <>
      <h1>Memora</h1>
      <p className="sub">Upload your notes. Get flashcards.</p>
      <UploadForm />
      <Link href="/decks">My decks →</Link>
    </>
  );
}
