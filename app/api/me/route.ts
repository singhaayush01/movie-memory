import { auth } from "@/lib/auth";
import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET() {
  const session = await auth();
  if (!session?.user?.id) return NextResponse.json({ error: { code: "UNAUTHORIZED", message: "Please sign in to continue." } }, { status: 401 });

  const user = await prisma.user.findUnique({
    where: { id: session.user.id },
    select: { id: true, name: true, email: true, image: true, favoriteMovie: true }
  });
  if (!user) return NextResponse.json({ error: { code: "USER_NOT_FOUND", message: "Your account could not be found." } }, { status: 404 });

  const { favoriteMovie, ...profile } = user;
  return NextResponse.json({ user: profile, favoriteMovie });
}
