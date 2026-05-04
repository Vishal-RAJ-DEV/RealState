import Link from "next/link";

import { Button } from "@/components/ui/button";
import { auth, signOut } from "@/lib/auth";

export default async function HomePage() {
  const session = await auth();

  async function handleSignOut() {
    "use server";

    await signOut({ redirectTo: "/" });
  }

  return (
    <section className="mx-auto flex w-full max-w-4xl flex-col items-center justify-center px-6 py-24 text-center">
      <div className="inline-flex rounded-full bg-primary/10 px-4 py-1 text-sm font-medium text-primary">
        Phase 2 authentication system
      </div>
      <h1 className="mt-6 text-4xl font-bold tracking-tight sm:text-5xl">
        PropFinder is coming soon
      </h1>
      {session ? (
        <>
          <p className="mt-4 max-w-2xl text-lg text-muted-foreground">
            Welcome back, {session.user.name ?? "there"}! You are a {session.user.role ?? "user"}.
          </p>
          <form action={handleSignOut} className="mt-8">
            <Button type="submit">Sign Out</Button>
          </form>
        </>
      ) : (
        <div className="mt-8 flex flex-col gap-3 sm:flex-row">
          <Button asChild>
            <Link href="/login">Login</Link>
          </Button>
          <Button asChild variant="outline">
            <Link href="/signup">Sign Up</Link>
          </Button>
        </div>
      )}
      <p className="mt-8 text-sm text-muted-foreground">
        Full home page coming in Phase 3
      </p>
    </section>
  );
}
