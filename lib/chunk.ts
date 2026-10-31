export function splitText(text: string, size = 7000): string[] {
  const chunks: string[] = [];
  let cur = "";
  for (let line of text.split(/\r?\n/)) {
    while (line.length > size) {
      if (cur) {
        chunks.push(cur);
        cur = "";
      }
      chunks.push(line.slice(0, size));
      line = line.slice(size);
    }
    if (cur && cur.length + line.length + 1 > size) {
      chunks.push(cur);
      cur = line;
    } else {
      cur = cur ? cur + "\n" + line : line;
    }
  }
  if (cur.trim()) chunks.push(cur);
  return chunks.filter((c) => c.trim().length > 30);
}
