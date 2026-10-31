import { NextResponse } from "next/server";
import { extractText } from "@/lib/extractText";

export const runtime = "nodejs";
export const maxDuration = 60;

export async function POST(req: Request) {
  try {
    const form = await req.formData();
    const file = form.get("file");
    if (!(file instanceof File) || !file.size) {
      return NextResponse.json({ error: "No file received." }, { status: 400 });
    }
    const text = await extractText(file);
    return NextResponse.json({ text });
  } catch (e: any) {
    return NextResponse.json({ error: e.message || "Could not read that file." }, { status: 500 });
  }
}
