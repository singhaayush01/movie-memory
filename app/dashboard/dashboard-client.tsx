import Link from "next/link";
"use client";

import Image from "next/image";
import { signOut } from "next-auth/react";
import { useCallback, useEffect, useRef, useState } from "react";
import { ApiError, getFact, updateMovie, type FactResponse } from "@/lib/api";
import { saveMovieOptimistically } from "@/lib/movie-edit";

const FACT_CACHE_MS = 30_000;
type Props = { userId: string; name: string | null; email: string | null; image: string | null; initialMovie: string };
type CachedFact = { value: FactResponse; cachedAt: number };

function readFactCache(key: string, movie: string): CachedFact | null {
  try {
    const stored = sessionStorage.getItem(key);
    if (!stored) return null;
    const cached = JSON.parse(stored) as CachedFact;
    const isValid =
      Boolean(cached.value?.fact) &&
      cached.value.movie === movie &&
      Number.isFinite(cached.cachedAt);
    if (isValid && Date.now() >= cached.cachedAt && Date.now() - cached.cachedAt < FACT_CACHE_MS) return cached;
    sessionStorage.removeItem(key);
  } catch {
    // Storage can be unavailable or contain invalid JSON. In that case, fetch a fresh fact.
  }
  return null;
}

function writeFactCache(key: string, value: CachedFact) {
  try { sessionStorage.setItem(key, JSON.stringify(value)); } catch { /* Storage may be disabled. */ }
}

export function DashboardClient({ userId, name, email, image, initialMovie }: Props) {
  const [favoriteMovie, setFavoriteMovie] = useState(initialMovie);
  const favoriteMovieRef = useRef(initialMovie);
  const [editing, setEditing] = useState(false);
  const [draft, setDraft] = useState(initialMovie);
  const [saving, setSaving] = useState(false);
  const [fact, setFact] = useState<FactResponse | null>(null);
  const cacheKey = "movie-memory:fact:" + userId;
  const [factLoading, setFactLoading] = useState(true);
  const [factError, setFactError] = useState("");
  const activeFactRequest = useRef(0);

  const loadFact = useCallback(async (forceNew = false) => {
    const requestId = ++activeFactRequest.current;

    if (!forceNew) {
      const cached = readFactCache(cacheKey, favoriteMovieRef.current);
      if (cached) {
        setFact(cached.value);
        setFactError("");
        setFactLoading(false);
        return;
      }
    }

    setFactLoading(true);
    setFactError("");
    try {
      const result = await getFact();
      if (requestId !== activeFactRequest.current) return;
      writeFactCache(cacheKey, { value: result, cachedAt: Date.now() });
      setFact(result);
    } catch (error) {
      if (requestId !== activeFactRequest.current) return;
      setFactError(error instanceof ApiError ? error.message : "Could not load a movie fact.");
    } finally {
      if (requestId === activeFactRequest.current) setFactLoading(false);
    }
  }, [cacheKey]);

  useEffect(() => { void loadFact(); }, [loadFact]);

  function updateFavoriteMovie(movie: string) {
    favoriteMovieRef.current = movie;
    setFavoriteMovie(movie);
  }

  async function handleSave() {
    const nextMovie = draft.trim();
    if (!nextMovie || nextMovie.length > 120) return;
    setSaving(true);
    try {
      await saveMovieOptimistically(
        favoriteMovie, nextMovie,
        async (movie) => (await updateMovie(movie)).favoriteMovie,
        updateFavoriteMovie
      );
      setEditing(false);
      try { sessionStorage.removeItem(cacheKey); } catch { /* Storage may be disabled. */ }
      setFact(null);
      setFactError("");
      await loadFact(true);
    } catch (error) {
      setDraft(favoriteMovie);
      setFactError(error instanceof ApiError ? error.message : "Could not update your movie. Your previous movie was restored.");
    } finally {
      setSaving(false);
    }
  }

  function cancelEdit() {
    setDraft(favoriteMovie);
    setEditing(false);
  }

  return (
    <main className="min-h-screen px-6 py-8 sm:px-10">
      <nav className="mx-auto flex max-w-6xl items-center justify-between">
        <Link href="/" className="text-sm font-bold">movie memory<span className="text-lime-600">.</span></Link>
        <button onClick={() => void signOut({ redirectTo: "/" })} className="rounded-full border border-line px-5 py-2.5 text-xs font-semibold hover:bg-white">Sign out</button>
      </nav>
      <div className="mx-auto max-w-6xl pb-16 pt-16">
        <div className="flex flex-col justify-between gap-8 border-b border-line pb-10 sm:flex-row sm:items-end">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[.2em] text-muted">Your personal shelf</p>
            <h1 className="mt-4 text-5xl font-semibold tracking-[-.055em] sm:text-6xl">Welcome back{name ? ", " + name.split(" ")[0] : ""}.</h1>
          </div>
          <div className="flex items-center gap-3">
            {image ? <Image src={image} alt="" width={44} height={44} className="rounded-full" unoptimized /> :
              <div className="flex h-11 w-11 items-center justify-center rounded-full bg-lime-200 font-semibold">{(name?.[0] || email?.[0] || "M").toUpperCase()}</div>}
            <div><p className="text-sm font-semibold">{name || "Movie fan"}</p><p className="text-xs text-muted">{email || "Google account"}</p></div>
          </div>
        </div>
        <section className="mt-10 grid gap-6 md:grid-cols-[1.05fr_.95fr]">
          <div className="rounded-[2rem] bg-ink p-8 text-white shadow-soft sm:p-10">
            <div className="flex items-center justify-between text-xs text-white/55"><span>YOUR FAVORITE MOVIE</span><span>✳</span></div>
            {editing ? (
              <div className="mt-16">
                <label htmlFor="movie-edit" className="text-xs uppercase tracking-[.18em] text-white/55">Edit movie title</label>
                <input id="movie-edit" value={draft} onChange={(event) => setDraft(event.target.value)} maxLength={120} className="mt-3 w-full rounded-xl border border-white/20 bg-white/10 px-4 py-3 text-xl text-white outline-none focus:border-lime-300" />
                <div className="mt-5 flex gap-3">
                  <button onClick={() => void handleSave()} disabled={saving || !draft.trim()} className="rounded-full bg-lime-300 px-5 py-3 text-sm font-semibold text-ink disabled:opacity-50">{saving ? "Saving..." : "Save"}</button>
                  <button onClick={cancelEdit} disabled={saving} className="rounded-full border border-white/25 px-5 py-3 text-sm font-semibold text-white disabled:opacity-50">Cancel</button>
                </div>
              </div>
            ) : (
              <>
                <h2 className="mt-16 break-words text-4xl font-semibold leading-tight tracking-[-.04em] sm:text-5xl">{favoriteMovie}</h2>
                <p className="mt-5 text-sm text-white/55">The one you chose to keep close.</p>
                <button onClick={() => { setDraft(favoriteMovie); setEditing(true); }} className="mt-10 rounded-full border border-white/25 px-5 py-3 text-sm font-semibold transition hover:bg-white/10">Edit favorite movie <span className="ml-2">↗</span></button>
              </>
            )}
          </div>
          <div className="flex min-h-[340px] flex-col rounded-[2rem] border border-line bg-white p-8 sm:p-10">
            <div className="flex items-center justify-between"><p className="text-xs font-semibold uppercase tracking-[.2em] text-muted">A little movie trivia</p><span className="text-lg">✦</span></div>
            <div className="my-auto py-12">
              {factLoading ? <p className="text-muted">Finding something interesting...</p> :
                fact ? <><p className="text-xs font-semibold uppercase tracking-[.15em] text-muted">{fact.movie}</p><p className="mt-5 text-xl leading-8 tracking-tight">{fact.fact}</p><p className="mt-5 text-xs text-muted">Saved {new Date(fact.createdAt).toLocaleString()}</p></> :
                <p className="text-sm leading-7 text-muted">{factError || "Your next movie fact will show up here."}</p>}
            </div>
            {factError && fact && <p role="alert" className="mb-3 text-xs text-red-700">{factError}</p>}
            <button onClick={() => void loadFact(true)} disabled={factLoading} className="self-start rounded-full bg-paper px-5 py-3 text-sm font-semibold transition hover:bg-lime-100 disabled:opacity-50">{factLoading ? "Loading..." : "Give me another fact"} <span className="ml-2">↗</span></button>
            <p className="mt-3 text-xs text-muted">Facts are reused for 30 seconds unless you ask for a new one.</p>
          </div>
        </section>
      </div>
    </main>
  );
}
