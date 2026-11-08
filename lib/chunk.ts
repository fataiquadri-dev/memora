export function splitText(text: string, size = 4500): string[] {
  const pieces: string[] = [];
  for (const line of text.split(/\r?\n/)) {
    if (!line.trim()) continue;
    if (line.length <= size) {
      pieces.push(line);
      continue;
    }
    // very long paragraph: cut at sentence ends so nothing is lost mid-sentence
    const sentences = line.match(/[^.!?]+[.!?]*\s*/g) || [line];
    let cur = "";
    for (const s of sentences) {
      if (cur && cur.length + s.length > size) {
        pieces.push(cur);
        cur = "";
      }
      if (s.length > size) {
        for (let i = 0; i < s.length; i += size) pieces.push(s.slice(i, i + size));
      } else {
        cur += s;
      }
    }
    if (cur) pieces.push(cur);
  }

  const chunks: string[] = [];
  let cur = "";
  for (const p of pieces) {
    if (cur && cur.length + p.length + 1 > size) {
      chunks.push(cur);
      cur = p;
    } else {
      cur = cur ? cur + "\n" + p : p;
    }
  }
  if (cur.trim()) {
    // a tiny leftover is joined to the previous part instead of being thrown away
    if (chunks.length && cur.length < 400) chunks[chunks.length - 1] += "\n" + cur;
    else chunks.push(cur);
  }
  return chunks.filter((c) => c.trim().length > 0);
}
