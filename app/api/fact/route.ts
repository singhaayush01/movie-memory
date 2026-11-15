import { getServerSession } from "next-auth";
import { NextResponse } from "next/server";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { createMovieFact } from "@/lib/openai";

export const runtime = "nodejs";

export async function GET() {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) return NextResponse.json({ error: { code: "UNAUTHORIZED", message: "Please sign in to continue." } }, { status: 401 });

  const user = await prisma.user.findUnique({ where: { id: session.user.id }, select: { favoriteMovie: true } });
  if (!user?.favoriteMovie) return NextResponse.json({ error: { code: "MOVIE_REQUIRED", message: "Add your favorite movie before requesting a fact." } }, { status: 409 });
  if (!process.env.OPENAI_API_KEY) return NextResponse.json({ error: { code: "AI_NOT_CONFIGURED", message: "Movie facts are not configured yet." } }, { status: 503 });

  try {
    const fact = await createMovieFact(user.favoriteMovie);
    const savedFact = await prisma.fact.create({ data: { userId: session.user.id, movie: user.favoriteMovie, content: fact } });
    return NextResponse.json({ fact: savedFact.content, movie: savedFact.movie, createdAt: savedFact.createdAt.toISOString() });
  } catch {
    return NextResponse.json({ error: { code: "FACT_GENERATION_FAILED", message: "We could not generate a fact right now. Please try again." } }, { status: 503 });
  }
}
