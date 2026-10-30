export async function extractText(file: File): Promise<string> {
  const name = file.name.toLowerCase();
  const buf = Buffer.from(await file.arrayBuffer());
  if (name.endsWith(".pdf")) {
    // @ts-ignore
    const pdf = (await import("pdf-parse/lib/pdf-parse.js")).default;
    const data = await pdf(buf);
    return data.text;
  }
  return buf.toString("utf-8");
}
