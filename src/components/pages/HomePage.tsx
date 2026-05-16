'use client';

import HeroSection from '@/sections/HeroSection';
import FeaturedSection from '@/sections/FeaturedSection';
import CategoriesMarquee from '@/sections/CategoriesMarquee';
import StatsSection from '@/sections/StatsSection';

export default function HomePage() {
  return (
    <main className="min-h-screen">
      <HeroSection />
      <FeaturedSection />
      <CategoriesMarquee />
      <StatsSection />
    </main>
  );
}
