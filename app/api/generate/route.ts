import { NextResponse } from "next/server";
import { extractText } from "@/lib/extractText";
import { askGrok } from "@/lib/grok";
import { SYSTEM_PROMPT, buildUserPrompt } from "@/lib/prompts";

export const runtime = "nodejs";
export const maxDuration = 60;

export async function POST(req: Request) {
  try {
    const form = await req.formData();
    const file = form.get("file");
    let text = String(form.get("text") || "");
    if (file instanceof File && file.size > 0) {
      text += "\n" + (await extractText(file));
    }
    text = text.trim().slice(0, 30000);
    if (text.length < 30) {
      return NextResponse.json({ error: "Please add more notes." }, { status: 400 });
    }
    const subject = String(form.get("subject") || "");
    const exam = String(form.get("exam") || "");
    const raw = await askGrok(SYSTEM_PROMPT, buildUserPrompt(text, subject, exam));
    const json = JSON.parse(raw.replace(/```json|```/g, "").trim());
    const cards = (json.cards || []).map((c: any, i: number) => ({
      id: `${Date.now()}-${i}`,
      front: String(c.front),
      back: String(c.back),
      examLikely: !!c.examLikely,
    }));
    return NextResponse.json({ title: json.title || subject || "New deck", cards });
  } catch (e: any) {
    return NextResponse.json({ error: e.message || "Something went wrong" }, { status: 500 });
  }
}
