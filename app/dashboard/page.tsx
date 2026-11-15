import { getServerSession } from "next-auth";
import { redirect } from "next/navigation";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { DashboardClient } from "./dashboard-client";

export default async function DashboardPage() {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) redirect("/");
  const user = await prisma.user.findUnique({
    where: { id: session.user.id },
    select: { name: true, email: true, image: true, favoriteMovie: true }
  });
  if (!user?.favoriteMovie) redirect("/onboarding");
  return <DashboardClient name={user.name} email={user.email} image={user.image} initialMovie={user.favoriteMovie} />;
}
