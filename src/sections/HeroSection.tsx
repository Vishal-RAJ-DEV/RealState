'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import { Search, MapPin } from 'lucide-react';
import dynamic from 'next/dynamic';
import { useApp } from '@/store/PropertyContext';

const ArchitecturalHeroCanvas = dynamic(
  () => import('@/components/shared/ArchitecturalHeroCanvas'),
  { ssr: false }
);

export default function HeroSection() {
  const [searchQuery, setSearchQuery] = useState('');
  const [activeTab, setActiveTab] = useState<'Buy' | 'Rent' | 'Commercial'>('Buy');
  const router = useRouter();
  const { setFilter } = useApp();

  const handleSearch = () => {
    setFilter({ searchQuery, listingType: activeTab });
    router.push('/search');
  };

  return (
    <section className="relative w-full h-screen bg-charcoal overflow-hidden">
      <ArchitecturalHeroCanvas />

      <div className="relative z-10 flex flex-col items-center justify-center h-full px-4">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.3 }}
          className="text-center mb-12"
        >
          <h1 className="font-serif text-5xl sm:text-6xl md:text-7xl lg:text-8xl text-cream mb-4 tracking-tight">
            Find your perfect home
          </h1>
          <p className="text-cream/70 text-base sm:text-lg font-sans">
            Curated listings for modern living
          </p>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.6 }}
          className="w-full max-w-3xl"
        >
          <div className="flex justify-center gap-2 mb-4">
            {(['Buy', 'Rent', 'Commercial'] as const).map((tab) => (
              <button
                key={tab}
                onClick={() => setActiveTab(tab)}
                className={`px-5 py-2 rounded-full text-sm font-medium transition-all ${
                  activeTab === tab
                    ? 'bg-crimson text-white'
                    : 'bg-white/10 text-cream/70 hover:bg-white/20'
                }`}
              >
                {tab}
              </button>
            ))}
          </div>

          <div className="bg-surface-glass backdrop-blur-md rounded-2xl p-3 flex items-center gap-3 shadow-lg">
            <MapPin className="text-charcoal/50 ml-3 shrink-0" size={20} />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
              placeholder="Search city, locality, project..."
              className="flex-1 bg-transparent text-charcoal placeholder:text-charcoal/40 outline-none text-base"
            />
            <button
              onClick={handleSearch}
              className="bg-crimson text-white px-6 py-3 rounded-xl font-medium hover:bg-crimson/90 transition-colors flex items-center gap-2 shrink-0"
            >
              <Search size={18} />
              <span className="hidden sm:inline">Search</span>
            </button>
          </div>
        </motion.div>
      </div>
    </section>
  );
}
