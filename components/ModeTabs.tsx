import Link from "next/link";

export default function ModeTabs({ active }: { active: "notes" | "topic" }) {
  return (
    <div className="tabs">
      <Link href="/create" className={`tab ${active === "notes" ? "on" : ""}`}>📄 From my notes</Link>
      <Link href="/topic" className={`tab ${active === "topic" ? "on" : ""}`}>💡 From a topic</Link>
    </div>
  );
}
