"use client";

import { type FormEvent, useState } from "react";
import { useRouter } from "next/navigation";
import { ApiError, updateMovie } from "@/lib/api";

export function OnboardingForm() {
  const router = useRouter();
  const [movie, setMovie] = useState("");
  const [error, setError] = useState("");
  const [saving, setSaving] = useState(false);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError("");
    setSaving(true);
    try {
      await updateMovie(movie);
      router.push("/dashboard");
      router.refresh();
    } catch (err) {
      setError(err instanceof ApiError ? err.message : "Could not save your movie. Please try again.");
    } finally {
      setSaving(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} className="mt-10">
      <label htmlFor="favorite-movie" className="mb-3 block text-sm font-semibold">Your favorite movie</label>
      <input id="favorite-movie" value={movie} onChange={(event) => setMovie(event.target.value)} maxLength={120} required placeholder="e.g. The Shawshank Redemption" className="w-full rounded-2xl border border-line bg-white px-5 py-5 text-base outline-none transition focus:border-ink" />
      <p className="mt-2 text-xs text-muted">Keep it between 1 and 120 characters.</p>
      {error && <p role="alert" className="mt-4 text-sm text-red-700">{error}</p>}
      <button disabled={saving} className="mt-7 rounded-full bg-ink px-7 py-4 text-sm font-semibold text-white hover:bg-black disabled:opacity-60">{saving ? "Saving..." : "Save my movie"} <span aria-hidden="true" className="ml-2">→</span></button>
    </form>
  );
}
