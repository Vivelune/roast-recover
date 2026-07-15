"use client";
import { useEffect } from "react";
import { useSearchParams } from "next/navigation";

export default function ReferralCapture() {
  const params = useSearchParams();

  useEffect(() => {
    const ref = params.get("ref");
    if (ref) {
      // Store in localStorage — survives Stripe redirect unlike cookies
      localStorage.setItem("rr_ref", ref);
    }
  }, [params]);

  return null;
}