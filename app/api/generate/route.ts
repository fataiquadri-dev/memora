import { NextResponse } from "next/server";
import { askGrok } from "@/lib/grok";
import { SYSTEM_PROMPT, buildUserPrompt } from "@/lib/prompts";

export const runtime = "nodejs";
export const maxDuration = 60;

function parseJson(raw: string) {
  const start = raw.indexOf("{");
  const end = raw.lastIndexOf("}");
  if (start < 0 || end < 0) throw new Error("The AI did not return flashcards. Please try again.");
  try {
    return JSON.parse(raw.slice(start, end + 1));
  } catch {
    throw new Error("The AI reply was not readable. Please try again.");
  }
}

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const text = String(body.text || "").slice(0, 12000);
    if (text.trim().length < 30) {
      return NextResponse.json({ error: "Please add more notes." }, { status: 400 });
    }
    const raw = await askGrok(
      SYSTEM_PROMPT,
      buildUserPrompt(text, String(body.subject || ""), String(body.exam || ""), Number(body.part) || 0, Number(body.parts) || 1)
    );
    const json = parseJson(raw);
    const list: any[] = Array.isArray(json.cards) ? json.cards : [];
    const cards = list
      .filter((c) => c && c.front && c.back)
      .map((c) => ({
        front: String(c.front).trim(),
        back: String(c.back).trim(),
        importance: Number(c.importance) || 3,
      }));

    // Only the most important cards (max ~35%) get the exam-likely tag
    const limit = Math.ceil(cards.length * 0.35);
    const flagged = new Set(
      [...cards]
        .sort((a, b) => b.importance - a.importance)
        .filter((c) => c.importance >= 4)
        .slice(0, limit)
    );

    return NextResponse.json({
      title: String(json.title || ""),
      icon: String(json.icon || ""),
      cards: cards.map((c) => ({ front: c.front, back: c.back, examLikely: flagged.has(c) })),
    });
  } catch (e: any) {
    return NextResponse.json({ error: e.message || "Something went wrong" }, { status: 500 });
  }
}
