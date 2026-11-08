export type Part = {
  title: string;
  icon: string;
  cards: { front: string; back: string; examLikely: boolean }[];
};

let pauseUntil = 0;
let dailyHit = false;

export function resetAi() {
  pauseUntil = 0;
  dailyHit = false;
}
export function dailyLimitHit() {
  return dailyHit;
}

function resetTimeLocal(): string {
  try {
    const now = new Date();
    const la = new Date(now.toLocaleString("en-US", { timeZone: "America/Los_Angeles" }));
    const next = new Date(la);
    next.setHours(24, 0, 0, 0);
    const reset = new Date(now.getTime() + (next.getTime() - la.getTime()));
    return reset.toLocaleTimeString([], { hour: "numeric", minute: "2-digit" });
  } catch {
    return "midnight Pacific time";
  }
}
export function dailyMessage() {
  return `The free daily AI limit has been reached. It resets at about ${resetTimeLocal()} your time.`;
}

const sleep = (ms: number) => new Promise((r) => setTimeout(r, ms));

function retrySeconds(msg: string): number {
  const a = msg.match(/retryDelay"?\s*:\s*"?(\d+(?:\.\d+)?)s/i);
  if (a) return parseFloat(a[1]);
  const b = msg.match(/retry in (\d+(?:\.\d+)?)s/i);
  return b ? parseFloat(b[1]) : 0;
}

export async function generate(
  text: string,
  subject: string,
  exam: string,
  part: number,
  parts: number,
  source: string,
  onNote?: (m: string) => void
): Promise<Part> {
  let lastError = "Something went wrong";
  for (let attempt = 0; attempt < 3; attempt++) {
    if (dailyHit) throw Object.assign(new Error(dailyMessage()), { daily: true });

    // every request waits if Google asked us to slow down
    const wait = pauseUntil - Date.now();
    if (wait > 0) {
      onNote?.(`Google's free limit is busy. Waiting ${Math.ceil(wait / 1000)}s, then continuing...`);
      await sleep(wait);
    }

    try {
      const res = await fetch("/api/generate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ text, subject, exam, part, parts, source }),
      });
      const raw = await res.text();
      let data: any = null;
      try {
        data = JSON.parse(raw);
      } catch {}
      if (res.ok && data) return data as Part;
      lastError =
        data?.error ||
        (res.status === 504
          ? "The AI took too long to answer."
          : res.status === 413
          ? "Those notes are too large for one request."
          : "The server sent an unexpected reply.");
    } catch (e: any) {
      lastError = e.message || lastError;
    }

    if (/PerDay|per day/i.test(lastError)) {
      dailyHit = true;
      throw Object.assign(new Error(dailyMessage()), { daily: true });
    }
    if (/429|quota|rate|exhausted|overload|503/i.test(lastError)) {
      const secs = Math.min(Math.max(retrySeconds(lastError) || 20, 5), 60) + 1;
      pauseUntil = Math.max(pauseUntil, Date.now() + secs * 1000);
    } else if (attempt < 2) {
      await sleep(2000 * (attempt + 1));
    }
  }
  throw new Error(lastError);
}
