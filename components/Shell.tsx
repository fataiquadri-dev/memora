"use client";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";
import { loadStats, currentStreak } from "@/lib/storage";
import { getName, setName as saveName } from "@/lib/profile";

const NAV = [
  { href: "/home", label: "Home", icon: "⌂" },
  { href: "/study", label: "Study", icon: "♧" },
  { href: "/create", label: "Create", icon: "⊕" },
  { href: "/library", label: "Library", icon: "▤" },
  { href: "/profile", label: "Profile", icon: "◉" },
];

const EYEBROW: Record<string, string> = {
  "/home": "YOUR LEARNING SPACE",
  "/study": "FOCUS MODE",
  "/create": "BUILD YOUR KNOWLEDGE",
  "/library": "YOUR COLLECTION",
  "/profile": "YOUR JOURNEY",
};

function Welcome({ onDone }: { onDone: (n: string) => void }) {
  const [v, setV] = useState("");
  return (
    <div className="welcome">
      <div className="welcome-card">
        <div className="brand" style={{ margin: 0, fontSize: 40 }}>Memora</div>
        <p className="tagline" style={{ margin: "6px 0 26px" }}>Study Smarter. Remember Longer.</p>
        <h1 style={{ fontSize: 30 }}>Welcome! 👋</h1>
        <p className="sub" style={{ marginBottom: 18 }}>What should we call you?</p>
        <form
          onSubmit={(e) => {
            e.preventDefault();
            if (v.trim()) onDone(v.trim());
          }}
        >
          <input
            autoFocus
            className="welcome-input"
            value={v}
            onChange={(e) => setV(e.target.value)}
            maxLength={30}
            placeholder="Your name"
          />
          <button className="primary" style={{ width: "100%", marginTop: 14 }} disabled={!v.trim()}>
            Continue →
          </button>
        </form>
      </div>
    </div>
  );
}

export default function Shell({ children }: { children: React.ReactNode }) {
  const path = usePathname() || "/";
  const [streak, setStreak] = useState(0);
  const [name, setName] = useState<string | null>(null);

  useEffect(() => {
    setName(getName());
  }, []);
  useEffect(() => {
    setStreak(currentStreak(loadStats()));
  }, [path]);

  if (name === null) return null;
  if (!name)
    return (
      <Welcome
        onDone={(n) => {
          saveName(n);
          setName(n);
        }}
      />
    );

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
            <div className="avatar">{name.charAt(0).toUpperCase()}</div>
            <div>
              <b>{name}</b>
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
