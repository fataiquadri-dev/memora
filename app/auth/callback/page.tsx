"use client";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { finishSignIn } from "@/lib/auth";

export default function AuthCallback() {
  const router = useRouter();
  const [msg, setMsg] = useState("");
  useEffect(() => {
    finishSignIn()
      .then(() => router.replace("/home"))
      .catch((e: any) => setMsg(e.message || "Sign-in failed."));
  }, [router]);
  return (
    <div className="welcome">
      <div className="welcome-card">
        {msg ? (
          <>
            <p className="err">{msg}</p>
            <a className="primary" href="/">Back to Memora</a>
          </>
        ) : (
          <>
            <div className="spinner" />
            <b>Signing you in and loading your decks...</b>
          </>
        )}
      </div>
    </div>
  );
}
