import { NextResponse } from "next/server";
import { askGrok } from "@/lib/grok";

export const runtime = "nodejs";
export const maxDuration = 60;

const SYSTEM = `You are Memora, an expert tutor that writes study flashcards on any topic a student asks for.
Rules:
- Make the number of cards requested (or as close as possible). Cover the topic broadly and in a logical order, from the basics to more advanced ideas.
- One idea per card. The front is a clear question or term. The back is a short, accurate answer (1 to 2 short sentences).
- Be accurate. Never invent facts. If the request is unclear, still return valid JSON with an empty cards list.
- For each card give "importance" from 1 to 5: how likely it is to be asked in an exam at the given level (most cards 2 or 3, only essential ones 4 or 5).
- "title" is a short deck name. "icon" is ONE emoji that fits the topic.
- Return ONLY valid JSON with no markdown, in this exact shape:
{"title": string, "icon": string, "cards": [{"front": string, "back": string, "importance": number}]}`;

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
    const topic = String(body.topic || "").trim().slice(0, 600);
    const level = String(body.level || "").trim().slice(0, 120);
    const count = Math.min(Math.max(Number(body.count) || 20, 5), 50);
    if (topic.length < 3) return NextResponse.json({ error: "Tell me what you want to learn." }, { status: 400 });

    const raw = await askGrok(SYSTEM, `Topic: ${topic}\nLevel / exam: ${level || "not given"}\nNumber of cards: ${count}`);
    const json = parseJson(raw);
    const list: any[] = Array.isArray(json.cards) ? json.cards : [];
    const cards = list
      .filter((c) => c && c.front && c.back)
      .map((c) => ({ front: String(c.front).trim(), back: String(c.back).trim(), importance: Number(c.importance) || 3 }));
    const limit = Math.ceil(cards.length * 0.35);
    const flagged = new Set([...cards].sort((a, b) => b.importance - a.importance).filter((c) => c.importance >= 4).slice(0, limit));

    return NextResponse.json({
      title: String(json.title || ""),
      icon: String(json.icon || ""),
      cards: cards.map((c) => ({ front: c.front, back: c.back, examLikely: flagged.has(c) })),
    });
  } catch (e: any) {
    return NextResponse.json({ error: e.message || "Something went wrong" }, { status: 500 });
  }
}
