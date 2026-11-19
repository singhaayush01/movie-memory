import { auth } from "@/lib/auth";
import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { createMovieFact } from "@/lib/openai";

export const runtime = "nodejs";

export async function GET() {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json(
      { error: { code: "UNAUTHORIZED", message: "Please sign in to continue." } },
      { status: 401 }
    );
  }

  const user = await prisma.user.findUnique({
    where: { id: session.user.id },
    select: { favoriteMovie: true }
  });

  if (!user?.favoriteMovie) {
    return NextResponse.json(
      { error: { code: "MOVIE_REQUIRED", message: "Add your favorite movie before requesting a fact." } },
      { status: 409 }
    );
  }

  if (!process.env.OPENAI_API_KEY) {
    return NextResponse.json(
      { error: { code: "AI_NOT_CONFIGURED", message: "Movie facts are not configured yet." } },
      { status: 503 }
    );
  }

  try {
    // Only use this user's facts for this movie, so one user never sees another user's history.
    const recentFacts = await prisma.fact.findMany({
      where: { userId: session.user.id, movie: user.favoriteMovie },
      orderBy: { createdAt: "desc" },
      take: 5,
      select: { content: true }
    });

    const fact = await createMovieFact(
      user.favoriteMovie,
      recentFacts.map((item) => item.content)
    );

    const savedFact = await prisma.fact.create({
      data: { userId: session.user.id, movie: user.favoriteMovie, content: fact }
    });

    return NextResponse.json({
      fact: savedFact.content,
      movie: savedFact.movie,
      createdAt: savedFact.createdAt.toISOString()
    });
  } catch (error) {
    console.error(
      "Fact generation failed:",
      error instanceof Error ? error.message : "Unknown error"
    );

    return NextResponse.json(
      { error: { code: "FACT_GENERATION_FAILED", message: "We could not generate a fact right now. Please try again." } },
      { status: 503 }
    );
  }
}
