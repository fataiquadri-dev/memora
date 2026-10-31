import DeckList from "@/components/DeckList";

export default function Decks() {
  return (
    <>
      <h1 className="hero">My <span className="grad">decks</span></h1>
      <p className="sub">Everything you've made, ready to study.</p>
      <DeckList />
    </>
  );
}
