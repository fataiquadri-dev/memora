const KEY = "memora_name";

export function getName(): string {
  if (typeof window === "undefined") return "";
  try {
    return localStorage.getItem(KEY) || "";
  } catch {
    return "";
  }
}
export function setName(name: string) {
  try {
    localStorage.setItem(KEY, name.trim());
  } catch {}
}
