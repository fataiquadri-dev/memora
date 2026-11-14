"use client";
import { useEffect, useState } from "react";
import { getClient } from "@/lib/supabase";
import GoogleButton from "@/components/GoogleButton";
import { signOutAndClear } from "@/lib/auth";

export default function AccountCard() {
  const [email, setEmail] = useState<string | null | undefined>(undefined);
  useEffect(() => {
    const sb = getClient();
    if (!sb) {
      setEmail(null);
      return;
    }
    sb.auth.getSession().then(({ data }) => {
      const u = data.session?.user;
      setEmail(u && !u.is_anonymous ? u.email || "your Google account" : null);
    });
  }, []);
  if (email === undefined || !getClient()) return null;

  if (email)
    return (
      <div className="panel">
        <b>✅ Signed in as {email}</b>
        <p className="sub" style={{ margin: "6px 0 14px" }}>Your decks are saved to your account and follow you to any phone.</p>
        <button
          className="soft-btn danger"
          onClick={() => {
            if (confirm("Sign out? Your decks leave this phone but stay in your account.")) signOutAndClear();
          }}
        >
          Sign out
        </button>
      </div>
    );

  return (
    <div className="panel">
      <b>Save your progress</b>
      <p className="sub" style={{ margin: "6px 0 14px" }}>Sign in with Google to keep your decks safe and open them on any phone.</p>
      <GoogleButton label="Save my progress with Google" />
    </div>
  );
}
