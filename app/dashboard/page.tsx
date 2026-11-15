import { auth } from "@/lib/auth";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { DashboardClient } from "./dashboard-client";

export default async function DashboardPage() {
  const session = await auth();
  if (!session?.user?.id) redirect("/");
  const user = await prisma.user.findUnique({
    where: { id: session.user.id },
    select: { name: true, email: true, image: true, favoriteMovie: true }
  });
  if (!user?.favoriteMovie) redirect("/onboarding");
  return <DashboardClient name={user.name} email={user.email} image={user.image} initialMovie={user.favoriteMovie} />;
}
