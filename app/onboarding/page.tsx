import { getServerSession } from "next-auth";
import { redirect } from "next/navigation";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { OnboardingForm } from "./onboarding-form";

export default async function OnboardingPage() {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) redirect("/");
  const user = await prisma.user.findUnique({ where: { id: session.user.id }, select: { favoriteMovie: true } });
  if (user?.favoriteMovie) redirect("/dashboard");

  return (
    <main className="min-h-screen px-6 py-10 sm:px-10">
      <div className="mx-auto max-w-3xl">
        <a href="/" className="text-sm font-bold">movie memory<span className="text-lime-600">.</span></a>
        <div className="mt-24 max-w-2xl">
          <p className="text-xs font-semibold uppercase tracking-[.2em] text-muted">First, the important question</p>
          <h1 className="mt-5 text-5xl font-semibold leading-tight tracking-[-.05em] sm:text-6xl">What is your all-time favorite movie?</h1>
          <p className="mt-6 text-lg leading-8 text-muted">The one you can watch again and again. We’ll save it to your personal shelf.</p>
          <OnboardingForm />
        </div>
      </div>
    </main>
  );
}
