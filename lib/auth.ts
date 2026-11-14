import { getClient } from "@/lib/supabase";
import { K, readName } from "@/lib/local";
import { reassignLocalIds, restoreFromCloud, markStatsDirty, scheduleFlush, flushNow } from "@/lib/sync";

export async function signInGoogle() {
  const sb = getClient();
  if (!sb) throw new Error("Sign-in is not set up yet.");
  const { error } = await sb.auth.signInWithOAuth({
    provider: "google",
    options: { redirectTo: `${window.location.origin}/auth/callback` },
  });
  if (error) throw error;
}

export async function finishSignIn() {
  const sb = getClient();
  if (!sb) throw new Error("Sign-in is not set up yet.");
  const q = new URLSearchParams(window.location.search);
  const h = new URLSearchParams(window.location.hash.replace(/^#/, ""));
  const err = q.get("error_description") || h.get("error_description");
  if (err) throw new Error(err);

  const { data, error } = await sb.auth.getSession();
  const user = data.session?.user;
  if (error || !user) throw new Error("Could not sign you in. Please try again.");

  // a different account than before on this phone: give local decks fresh ids so they upload cleanly
  const prev = localStorage.getItem("memora_uid");
  if (prev && prev !== user.id) reassignLocalIds();
  localStorage.setItem("memora_uid", user.id);

  await restoreFromCloud();
  if (!readName()) {
    const m: any = user.user_metadata || {};
    const full = String(m.full_name || m.name || (user.email || "").split("@")[0] || "Student");
    localStorage.setItem(K.name, full.split(" ")[0]);
  }
  markStatsDirty();
  scheduleFlush();
}

export async function signOutAndClear() {
  await flushNow();
  const sb = getClient();
  try {
    await sb?.auth.signOut();
  } catch {}
  try {
    Object.keys(localStorage)
      .filter((k) => k.startsWith("memora_") || k.startsWith("sb-"))
      .forEach((k) => localStorage.removeItem(k));
  } catch {}
  window.location.href = "/";
}
