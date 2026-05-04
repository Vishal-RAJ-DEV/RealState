import { Building2, Heart, Menu } from "lucide-react";
import Link from "next/link";

import { UserAvatarMenu } from "@/components/layout/UserAvatarMenu";
import { Button } from "@/components/ui/button";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
import { auth, signOut } from "@/lib/auth";

const navLinks = [
  { href: "/search?for=SALE", label: "Buy" },
  { href: "/search?for=RENT", label: "Rent" },
  { href: "/about", label: "About" },
];

export async function Navbar() {
  const session = await auth();

  async function handleSignOut() {
    "use server";

    await signOut({ redirectTo: "/" });
  }

  return (
    <header className="sticky top-0 z-50 border-b bg-white">
      <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4">
        <div className="flex items-center gap-6">
          <Link href="/" className="flex flex-col">
            <span className="text-xl font-bold tracking-tight">
              <span className="text-black">Prop</span>
              <span className="text-primary">Finder</span>
            </span>
            <span className="hidden text-xs text-muted-foreground md:block">
              India&apos;s trusted property marketplace
            </span>
          </Link>

          <nav className="hidden items-center md:flex">
            {navLinks.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                className="px-3 py-2 text-sm font-medium text-gray-600 transition-colors hover:text-primary"
              >
                {link.label}
              </Link>
            ))}
          </nav>
        </div>

        <div className="hidden items-center gap-3 md:flex">
          {!session && (
            <>
              <Button asChild variant="ghost">
                <Link href="/login">Login</Link>
              </Button>
              <Button asChild>
                <Link href="/post">
                  <Building2 className="mr-2 h-4 w-4" />
                  Post Property
                </Link>
              </Button>
            </>
          )}

          {session?.user.role === "SELLER" && (
            <>
              <Button asChild variant="ghost">
                <Link href="/dashboard">Dashboard</Link>
              </Button>
              <Button asChild>
                <Link href="/post">
                  <Building2 className="mr-2 h-4 w-4" />
                  Post Property
                </Link>
              </Button>
              <UserAvatarMenu
                name={session.user.name}
                email={session.user.email}
                image={session.user.image}
              />
            </>
          )}

          {session?.user.role === "BUYER" && (
            <>
              <Button asChild variant="ghost">
                <Link href="#">
                  <Heart className="mr-2 h-4 w-4" />
                  Saved
                </Link>
              </Button>
              <UserAvatarMenu
                name={session.user.name}
                email={session.user.email}
                image={session.user.image}
              />
            </>
          )}
        </div>

        <div className="md:hidden">
          <Sheet>
            <SheetTrigger asChild>
              <Button variant="ghost" size="icon" aria-label="Open navigation">
                <Menu className="h-5 w-5" />
              </Button>
            </SheetTrigger>
            <SheetContent side="right" className="w-[300px]">
              <SheetHeader>
                <SheetTitle className="text-left text-xl font-bold">
                  <span className="text-black">Prop</span>
                  <span className="text-primary">Finder</span>
                </SheetTitle>
              </SheetHeader>

              <div className="mt-8 flex flex-col gap-2">
                {navLinks.map((link) => (
                  <Link
                    key={link.href}
                    href={link.href}
                    className="rounded-lg px-3 py-2 text-sm font-medium text-foreground transition-colors hover:bg-muted"
                  >
                    {link.label}
                  </Link>
                ))}
              </div>

              <div className="mt-8 flex flex-col gap-3">
                {!session && (
                  <>
                    <Button asChild variant="outline" className="w-full">
                      <Link href="/login">Login</Link>
                    </Button>
                    <Button asChild className="w-full">
                      <Link href="/post">
                        <Building2 className="mr-2 h-4 w-4" />
                        Post Property
                      </Link>
                    </Button>
                  </>
                )}

                {session && (
                  <>
                    {session.user.role === "SELLER" && (
                      <>
                        <Button asChild variant="outline" className="w-full">
                          <Link href="/dashboard">Dashboard</Link>
                        </Button>
                        <Button asChild className="w-full">
                          <Link href="/post">
                            <Building2 className="mr-2 h-4 w-4" />
                            Post Property
                          </Link>
                        </Button>
                      </>
                    )}

                    {session.user.role === "BUYER" && (
                      <Button asChild variant="outline" className="w-full">
                        <Link href="#">
                          <Heart className="mr-2 h-4 w-4" />
                          Saved
                        </Link>
                      </Button>
                    )}

                    <Button asChild variant="outline" className="w-full">
                      <Link href="#">My Profile</Link>
                    </Button>

                    <form action={handleSignOut}>
                      <Button type="submit" variant="ghost" className="w-full">
                        Sign out
                      </Button>
                    </form>
                  </>
                )}
              </div>
            </SheetContent>
          </Sheet>
        </div>
      </div>
    </header>
  );
}
