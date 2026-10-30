export async function askGrok(system: string, user: string): Promise<string> {
  const res = await fetch(
    "https://generativelanguage.googleapis.com/v1beta/openai/chat/completions",
    {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${process.env.GEMINI_API_KEY}`,
      },
      body: JSON.stringify({
        model: process.env.GEMINI_MODEL || "gemini-2.5-flash",
        temperature: 0.3,
        messages: [
          { role: "system", content: system },
          { role: "user", content: user },
        ],
      }),
    }
  );
  if (!res.ok) throw new Error(`AI error ${res.status}: ${await res.text()}`);
  const data = await res.json();
  return data.choices?.[0]?.message?.content ?? "";
}
