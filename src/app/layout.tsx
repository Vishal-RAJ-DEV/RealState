import type { Metadata } from "next";
import { Plus_Jakarta_Sans } from "next/font/google";

import Navbar from "@/components/layout/Navbar";
import Footer from "@/components/layout/Footer";
import { SessionProvider } from "@/components/providers/SessionProvider";
import { Toaster } from "@/components/ui/toaster";
import { AppProvider } from "@/store/PropertyContext";
import { cn } from "@/lib/utils";

import "./globals.css";

const plusJakartaSans = Plus_Jakarta_Sans({
  subsets: ["latin"],
  variable: "--font-sans",
});

export const metadata: Metadata = {
  title: "PropFinder - Find your perfect home",
  description: "Curated listings for modern living",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body
        className={cn(
          plusJakartaSans.variable,
          "min-h-screen bg-cream font-sans antialiased",
        )}
      >
        <SessionProvider>
          <AppProvider>
            <div className="flex min-h-screen flex-col">
              <Navbar />
              <main className="flex-1">{children}</main>
              <Footer />
            </div>
            <Toaster />
          </AppProvider>
        </SessionProvider>
      </body>
    </html>
  );
}
