"use client";
import { useEffect } from "react";
import { useRouter } from "next/navigation";

export default function ReturningRedirect() {
  const router = useRouter();
  useEffect(() => {
    try {
      if (new URLSearchParams(window.location.search).has("stay")) return;
      if (localStorage.getItem("memora_name")) router.replace("/home");
    } catch {}
  }, [router]);
  return null;
}
