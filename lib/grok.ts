// Remembers if the model rejected our speed options, so we do not waste requests
let tuned = true;

export async function askGrok(system: string, user: string): Promise<string> {
  const url = "https://generativelanguage.googleapis.com/v1beta/openai/chat/completions";
  const headers = {
    "Content-Type": "application/json",
    Authorization: `Bearer ${process.env.GEMINI_API_KEY}`,
  };
  const model = process.env.GEMINI_MODEL || "gemini-3.5-flash-lite";
  const isGemini3 = /gemini-3/.test(model);
  const base: Record<string, unknown> = {
    model,
    messages: [
      { role: "system", content: system },
      { role: "user", content: user },
    ],
  };
  if (!isGemini3) base.temperature = 0.3; // Gemini 3 works best with its default

  const post = (body: object) =>
    fetch(url, { method: "POST", headers, body: JSON.stringify(body) });

  // lowest thinking setting each model family allows
  const effort = /gemini-2\.5/.test(model) ? "none" : isGemini3 ? "minimal" : "";

  let res: Response;
  if (tuned && effort) {
    res = await post({ ...base, reasoning_effort: effort, response_format: { type: "json_object" } });
    if (res.status === 400) {
      tuned = false;
      res = await post(base);
    }
  } else {
    res = await post(base);
  }
  if (!res.ok) throw new Error(`AI error ${res.status}: ${await res.text()}`);
  const data = await res.json();
  return data.choices?.[0]?.message?.content ?? "";
}
