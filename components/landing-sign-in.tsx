"use client";

import { signIn } from "next-auth/react";
import { useState } from "react";

export function LandingSignIn() {
  const [loading, setLoading] = useState(false);
  return (
    <button type="button" disabled={loading} onClick={() => {
      setLoading(true);
      void signIn("google", { callbackUrl: "/" }).finally(() => setLoading(false));
    }} className="rounded-full bg-ink px-7 py-4 text-sm font-semibold text-white transition hover:bg-black disabled:opacity-60">
      {loading ? "Connecting..." : "Continue with Google"} <span aria-hidden="true" className="ml-2">↗</span>
    </button>
  );
}
