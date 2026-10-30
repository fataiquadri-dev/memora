import Link from "next/link";
import DeckList from "@/components/DeckList";

export default function Decks() {
  return (
    <>
      <h1>My decks</h1>
      <p className="sub"><Link href="/">+ New deck</Link></p>
      <DeckList />
    </>
  );
}
