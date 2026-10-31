"use client";
import { useEffect, useState } from "react";
import { Stats } from "@/types";
import { loadStats, loadDecks, currentStreak, formatTime } from "@/lib/storage";

function timeAgo(t: number) {
  const m = Math.floor((Date.now() - t) / 60000);
  if (m < 1) return "just now";
  if (m < 60) return `${m}m ago`;
  const h = Math.floor(m / 60);
  if (h < 24) return `${h}h ago`;
  return `${Math.floor(h / 24)}d ago`;
}

export default function Profile() {
  const [stats, setStats] = useState<Stats | null>(null);
  const [deckCount, setDeckCount] = useState(0);
  useEffect(() => {
    setStats(loadStats());
    setDeckCount(loadDecks().length);
  }, []);

  return (
    <>
      <h1>Your <span>progress.</span></h1>
      <p className="sub">A little consistency goes a long way.</p>

      <div className="profile-head">
        <div className="profile-avatar">🧠</div>
        <div>
          <h2>StudyMind</h2>
          <p>Consistency builds mastery.</p>
        </div>
      </div>

      <div className="quick-row">
        <div className="stat"><span>🔥</span><b>{stats ? currentStreak(stats) : 0}</b><small>Day streak</small></div>
        <div className="stat"><span>⭐</span><b>{deckCount}</b><small>Total decks</small></div>
        <div className="stat"><span>◷</span><b>{formatTime(stats?.studySeconds || 0)}</b><small>Study time</small></div>
      </div>

      <div className="section-head">
        <h2>Recent activity</h2>
        <span className="eyebrow">THIS WEEK</span>
      </div>

      <div className="activity">
        {stats && stats.activity.length ? (
          stats.activity.map((a, i) => (
            <div className="activity-item" key={i}>
              <div className="deck-icon">{a.icon}</div>
              <div>
                <b>{a.deckTitle}</b>
                <small>{a.text}</small>
              </div>
              <time>{timeAgo(a.at)}</time>
            </div>
          ))
        ) : (
          <div className="empty">Your study sessions will show up here.</div>
        )}
      </div>

      <div className="quote">
        <div className="mountain">🏔️</div>
        <div>
          <b>Progress, not perfection.</b>
          <small>Keep going. Your future self will thank you.</small>
        </div>
      </div>
    </>
  );
}
