"use client";
import { useEffect, useRef } from "react";
import { usePathname } from "next/navigation";
import { useUser } from "@clerk/nextjs";

function getSessionId(): string {
  if (typeof window === "undefined") return "";
  let id = sessionStorage.getItem("rr_session");
  if (!id) {
    id = Math.random().toString(36).slice(2) + Date.now().toString(36);
    sessionStorage.setItem("rr_session", id);
  }
  return id;
}

export default function PageTracker() {
  const pathname = usePathname();
  const { user } = useUser();
  const lastTracked = useRef<string>("");

  useEffect(() => {
    if (pathname === lastTracked.current) return;
    lastTracked.current = pathname;

    const sessionId = getSessionId();
    const userId = user?.id ?? null;

    // Fire and forget — never block rendering
    fetch("/api/track", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ path: pathname, sessionId, userId }),
    }).catch(() => {}); // silent fail
  }, [pathname, user?.id]);

  return null;
}