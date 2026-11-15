import { auth } from "@/lib/auth";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { LandingSignIn } from "@/components/landing-sign-in";

export default async function HomePage() {
  const session = await auth();
  if (session?.user?.id) {
    const user = await prisma.user.findUnique({ where: { id: session.user.id }, select: { favoriteMovie: true } });
    redirect(user?.favoriteMovie ? "/dashboard" : "/onboarding");
  }

  return (
    <main className="min-h-screen px-6 py-8 sm:px-10">
      <nav className="mx-auto flex max-w-6xl items-center justify-between">
        <a href="/" className="text-sm font-bold tracking-tight">movie memory<span className="text-lime-600">.</span></a>
        <span className="text-xs text-muted">A little space for your favorite films</span>
      </nav>
      <section className="mx-auto grid min-h-[82vh] max-w-6xl items-center gap-14 py-16 md:grid-cols-[1.05fr_.95fr]">
        <div>
          <p className="mb-6 text-xs font-semibold uppercase tracking-[.22em] text-muted">Your personal movie shelf</p>
          <h1 className="max-w-2xl text-5xl font-semibold leading-[1.05] tracking-[-.055em] sm:text-7xl">Some movies just <span className="underline decoration-lime-400 decoration-[8px] underline-offset-4">stay</span> with you.</h1>
          <p className="mt-8 max-w-lg text-lg leading-8 text-muted">Keep your all-time favorite close. Movie Memory saves the film you love and finds a small fact to make you love it a little more.</p>
          <div className="mt-10"><LandingSignIn /><p className="mt-4 text-xs text-muted">Sign in securely with your Google account.</p></div>
        </div>
        <div className="relative mx-auto w-full max-w-md">
          <div className="absolute -inset-5 rotate-3 rounded-[2rem] bg-lime-200/70" />
          <div className="relative rounded-[1.75rem] bg-ink p-7 text-white shadow-soft sm:p-10">
            <div className="flex items-center justify-between text-xs text-white/55"><span>YOUR MOVIE MEMORY</span><span>№ 001</span></div>
            <div className="mt-16">
              <div className="mb-5 flex h-12 w-12 items-center justify-center rounded-full bg-lime-300 text-xl text-ink">✳</div>
              <p className="text-xs uppercase tracking-[.2em] text-white/50">A favorite worth keeping</p>
              <h2 className="mt-3 text-4xl font-semibold leading-tight tracking-tight">The stories<br />we return to.</h2>
            </div>
            <div className="mt-16 border-t border-white/15 pt-5 text-sm text-white/65">One movie. A memory. A new little detail.</div>
          </div>
        </div>
      </section>
    </main>
  );
}
