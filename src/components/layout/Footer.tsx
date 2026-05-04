import { BriefcaseBusiness, Camera, Send } from "lucide-react";
import Link from "next/link";

import { Separator } from "@/components/ui/separator";

const buyAndRentLinks = [
  { href: "/search?type=FLAT&for=SALE", label: "Buy Flat" },
  { href: "/search?type=VILLA&for=SALE", label: "Buy Villa" },
  { href: "/search?type=FLAT&for=RENT", label: "Rent Apartment" },
  { href: "/search?type=COMMERCIAL", label: "Commercial" },
];

const companyLinks = [
  { href: "/about", label: "About Us" },
  { href: "/contact", label: "Contact" },
  { href: "/blog", label: "Blog" },
  { href: "/careers", label: "Careers" },
];

const socialLinks = [
  { href: "https://twitter.com", label: "Twitter", icon: Send },
  { href: "https://instagram.com", label: "Instagram", icon: Camera },
  { href: "https://linkedin.com", label: "LinkedIn", icon: BriefcaseBusiness },
];

export function Footer() {
  return (
    <footer className="bg-gray-900 text-white">
      <div className="mx-auto max-w-7xl px-4 py-14">
        <div className="grid gap-10 md:grid-cols-2 lg:grid-cols-4">
          <div className="space-y-4">
            <div className="text-2xl font-bold tracking-tight">
              <span className="text-white">Prop</span>
              <span className="text-blue-400">Finder</span>
            </div>
            <p className="max-w-sm text-sm text-gray-300">
              Discover, compare, and close on the right property faster with a
              cleaner marketplace built for Indian buyers and sellers.
            </p>
            <p className="text-sm text-gray-400">Made with love for India 🇮🇳</p>
          </div>

          <div>
            <h3 className="mb-4 text-sm font-semibold uppercase tracking-[0.2em] text-gray-400">
              Buy &amp; Rent
            </h3>
            <div className="space-y-3">
              {buyAndRentLinks.map((link) => (
                <Link
                  key={link.label}
                  href={link.href}
                  className="block text-sm text-gray-300 transition-colors hover:text-white"
                >
                  {link.label}
                </Link>
              ))}
            </div>
          </div>

          <div>
            <h3 className="mb-4 text-sm font-semibold uppercase tracking-[0.2em] text-gray-400">
              Company
            </h3>
            <div className="space-y-3">
              {companyLinks.map((link) => (
                <Link
                  key={link.label}
                  href={link.href}
                  className="block text-sm text-gray-300 transition-colors hover:text-white"
                >
                  {link.label}
                </Link>
              ))}
            </div>
          </div>

          <div>
            <h3 className="mb-4 text-sm font-semibold uppercase tracking-[0.2em] text-gray-400">
              Connect
            </h3>
            <div className="space-y-3">
              {socialLinks.map((link) => {
                const Icon = link.icon;

                return (
                  <Link
                    key={link.label}
                    href={link.href}
                    target="_blank"
                    rel="noreferrer"
                    className="flex items-center gap-3 text-sm text-gray-300 transition-colors hover:text-white"
                  >
                    <Icon className="h-4 w-4" />
                    {link.label}
                  </Link>
                );
              })}
            </div>
          </div>
        </div>

        <Separator className="my-8 bg-white/10" />

        <div className="flex flex-col gap-3 text-sm text-gray-400 md:flex-row md:items-center md:justify-between">
          <p>© 2025 PropFinder. All rights reserved.</p>
          <div className="flex items-center gap-4">
            <Link href="/privacy" className="transition-colors hover:text-white">
              Privacy Policy
            </Link>
            <Link href="/terms" className="transition-colors hover:text-white">
              Terms of Service
            </Link>
          </div>
        </div>
      </div>
    </footer>
  );
}
