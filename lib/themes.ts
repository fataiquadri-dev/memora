import type { CSSProperties } from "react";

export const THEMES = [
  { c1: "#7c4dff", c2: "#3b82f6", icon: "💡" },
  { c1: "#06b6d4", c2: "#3b82f6", icon: "🔬" },
  { c1: "#10b981", c2: "#06b6d4", icon: "🌿" },
  { c1: "#f59e0b", c2: "#ef4444", icon: "⚡" },
  { c1: "#ec4899", c2: "#8b5cf6", icon: "🎯" },
  { c1: "#f97316", c2: "#ec4899", icon: "🔥" },
  { c1: "#14b8a6", c2: "#22c55e", icon: "🧠" },
  { c1: "#6366f1", c2: "#06b6d4", icon: "🚀" },
];

function hash(s: string) {
  let h = 0;
  for (let i = 0; i < s.length; i++) h = (h * 31 + s.charCodeAt(i)) | 0;
  return Math.abs(h);
}

export function themeOf(item: { id: string; theme?: number }) {
  const n = typeof item.theme === "number" ? item.theme : hash(item.id);
  return THEMES[n % THEMES.length];
}

export function themeStyle(item: { id: string; theme?: number }): CSSProperties {
  const t = themeOf(item);
  return { "--c1": t.c1, "--c2": t.c2 } as CSSProperties;
}
