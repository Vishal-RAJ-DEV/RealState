import { CheckCircle2 } from "lucide-react";
import { redirect } from "next/navigation";
import type { ReactNode } from "react";

import { auth } from "@/lib/auth";

const trustStats = [
  "12,400+ Properties",
  "340+ Cities",
  "50,000+ Happy buyers",
];

export default async function AuthLayout({
  children,
}: {
  children: ReactNode;
}) {
  const session = await auth();

  if (session) {
    redirect("/");
  }

  return (
    <div className="min-h-screen bg-white lg:grid lg:grid-cols-2">
      <aside className="hidden min-h-screen flex-col justify-between bg-primary px-12 py-14 text-white lg:flex">
        <div className="space-y-6">
          <div className="text-3xl font-bold tracking-tight">PropFinder</div>
          <div className="space-y-3">
            <p className="text-sm font-semibold uppercase tracking-[0.24em] text-white/70">
              Trusted real estate partner
            </p>
            <h1 className="max-w-md text-5xl font-bold leading-tight">
              Find your perfect home
            </h1>
            <p className="max-w-md text-base text-white/80">
              A faster, cleaner property marketplace built to help Indians buy,
              rent, and list with confidence.
            </p>
          </div>
        </div>

        <div className="space-y-5">
          {trustStats.map((stat) => (
            <div key={stat} className="flex items-center gap-3 text-lg">
              <CheckCircle2 className="h-5 w-5" />
              <span>{stat}</span>
            </div>
          ))}
        </div>
      </aside>

      <section className="flex min-h-screen items-center justify-center bg-white px-6 py-12">
        {children}
      </section>
    </div>
  );
}
