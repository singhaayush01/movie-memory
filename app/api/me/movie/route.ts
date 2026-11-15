import { getServerSession } from "next-auth";
import { NextRequest, NextResponse } from "next/server";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function PUT(request: NextRequest) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) return NextResponse.json({ error: { code: "UNAUTHORIZED", message: "Please sign in to continue." } }, { status: 401 });

  let body: unknown;
  try { body = await request.json(); }
  catch { return NextResponse.json({ error: { code: "INVALID_JSON", message: "Please send a valid JSON request." } }, { status: 400 }); }

  const movie = typeof body === "object" && body !== null && "movie" in body ? (body as { movie: unknown }).movie : null;
  if (typeof movie !== "string") return NextResponse.json({ error: { code: "INVALID_MOVIE", message: "Enter a movie title." } }, { status: 400 });

  const normalizedMovie = movie.trim();
  if (normalizedMovie.length < 1 || normalizedMovie.length > 120) {
    return NextResponse.json({ error: { code: "INVALID_MOVIE", message: "Movie title must be between 1 and 120 characters." } }, { status: 400 });
  }

  const user = await prisma.user.update({
    where: { id: session.user.id }, data: { favoriteMovie: normalizedMovie }, select: { favoriteMovie: true }
  });
  return NextResponse.json({ favoriteMovie: user.favoriteMovie });
}
