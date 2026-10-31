"use client";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";
import { loadStats, currentStreak } from "@/lib/storage";

const NAV = [
  { href: "/", label: "Home", icon: "⌂" },
  { href: "/study", label: "Study", icon: "♧" },
  { href: "/create", label: "Create", icon: "⊕" },
  { href: "/library", label: "Library", icon: "▤" },
  { href: "/profile", label: "Profile", icon: "◉" },
];

const EYEBROW: Record<string, string> = {
  "/": "YOUR LEARNING SPACE",
  "/study": "FOCUS MODE",
  "/create": "BUILD YOUR KNOWLEDGE",
  "/library": "YOUR COLLECTION",
  "/profile": "YOUR JOURNEY",
};

export default function Shell({ children }: { children: React.ReactNode }) {
  const path = usePathname() || "/";
  const [streak, setStreak] = useState(0);
  useEffect(() => {
    setStreak(currentStreak(loadStats()));
  }, [path]);

  const isActive = (href: string) =>
    href === "/" ? path === "/" : path === href || path.startsWith(href + "/");
  const eyebrow = EYEBROW["/" + (path.split("/")[1] || "")] || "YOUR LEARNING SPACE";

  return (
    <div className="app">
      <aside className="sidebar">
        <div className="brand">Memora</div>
        <p className="tagline">Study Smarter. Remember Longer.</p>
        <div className="nav-label">WORKSPACE</div>
        <nav className="nav">
          {NAV.map((n) => (
            <Link key={n.href} href={n.href} className={isActive(n.href) ? "active" : ""}>
              <span className="ico">{n.icon}</span>
              {n.label}
            </Link>
          ))}
        </nav>
        <div className="sidebar-bottom">
          <div className="streak">
            <strong>🔥 {streak > 0 ? `${streak} day streak` : "Start your streak"}</strong>
            <small>A little progress every day adds up.</small>
          </div>
          <div className="user">
            <div className="avatar">M</div>
            <div>
              <b>My workspace</b>
              <small>Free study space</small>
            </div>
          </div>
        </div>
      </aside>

      <main className="main">
        <header className="topbar">
          <div className="eyebrow">{eyebrow}</div>
          <div className="top-actions">
            <Link href="/create" className="icon-btn" title="New deck">＋</Link>
          </div>
        </header>
        <div className="page" key={path}>
          {children}
        </div>
      </main>

      <nav className="mobile-nav">
        {NAV.map((n) => (
          <Link key={n.href} href={n.href} className={isActive(n.href) ? "active" : ""}>
            <span>{n.icon}</span>
            {n.label}
          </Link>
        ))}
      </nav>
    </div>
  );
}
