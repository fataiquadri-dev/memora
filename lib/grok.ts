export async function askGrok(system: string, user: string): Promise<string> {
  const url = "https://generativelanguage.googleapis.com/v1beta/openai/chat/completions";
  const headers = {
    "Content-Type": "application/json",
    Authorization: `Bearer ${process.env.GEMINI_API_KEY}`,
  };
  const base = {
    model: process.env.GEMINI_MODEL || "gemini-2.5-flash",
    temperature: 0.3,
    messages: [
      { role: "system", content: system },
      { role: "user", content: user },
    ],
  };
  // Fast path: no "thinking" and JSON output. Falls back if the model rejects these options.
  let res = await fetch(url, {
    method: "POST",
    headers,
    body: JSON.stringify({ ...base, reasoning_effort: "none", response_format: { type: "json_object" } }),
  });
  if (res.status === 400) {
    res = await fetch(url, { method: "POST", headers, body: JSON.stringify(base) });
  }
  if (!res.ok) throw new Error(`AI error ${res.status}: ${await res.text()}`);
  const data = await res.json();
  return data.choices?.[0]?.message?.content ?? "";
}
