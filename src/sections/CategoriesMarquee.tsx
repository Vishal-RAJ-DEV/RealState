'use client';

import { useState, useRef } from 'react';
import { useRouter } from 'next/navigation';
import Image from 'next/image';
import { motion, useMotionValue, useTransform } from 'framer-motion';
import { useApp } from '@/store/PropertyContext';

const categories = ['VILLAS', 'APARTMENTS', 'LOFTS', 'PENTHOUSES', 'HOUSES', 'COMMERCIAL'];

export default function CategoriesMarquee() {
  const [hoveredIndex, setHoveredIndex] = useState<number | null>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const mouseX = useMotionValue(0);
  const router = useRouter();
  const { setFilter } = useApp();

  const imageX = useTransform(mouseX, [-500, 500], [-150, 150]);

  const handleMouseMove = (e: React.MouseEvent) => {
    if (containerRef.current) {
      const rect = containerRef.current.getBoundingClientRect();
      mouseX.set(e.clientX - rect.left - rect.width / 2);
    }
  };

  const handleCategoryClick = (category: string) => {
    const typeMap: Record<string, string> = {
      'VILLAS': 'Villa',
      'APARTMENTS': 'Apartment',
      'LOFTS': 'Loft',
      'PENTHOUSES': 'Penthouse',
      'HOUSES': 'House',
      'COMMERCIAL': 'Commercial',
    };
    setFilter({ propertyType: typeMap[category] || '' });
    router.push('/search');
  };

  return (
    <section
      ref={containerRef}
      className="w-full py-20 lg:py-32 bg-cream overflow-hidden relative"
      onMouseMove={handleMouseMove}
    >
      <motion.div
        style={{ x: imageX }}
        className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 z-20 pointer-events-none"
      >
        <motion.div
          animate={{ opacity: hoveredIndex !== null ? 1 : 0, scale: hoveredIndex !== null ? 1 : 0.8 }}
          transition={{ duration: 0.3 }}
          className="relative w-48 h-32 sm:w-64 sm:h-44 rounded-xl overflow-hidden shadow-card"
        >
          {hoveredIndex !== null && (
            <Image
              src={`/images/prop_${(hoveredIndex % 8) + 1}.jpg`}
              alt={categories[hoveredIndex]}
              fill
              className="object-cover"
              sizes="(max-width: 640px) 192px, 256px"
            />
          )}
        </motion.div>
      </motion.div>

      <div className="overflow-hidden">
        <div className="flex whitespace-nowrap animate-marquee">
          {[...categories, ...categories].map((cat, i) => (
            <button
              key={`${cat}-${i}`}
              onMouseEnter={() => setHoveredIndex(i % categories.length)}
              onMouseLeave={() => setHoveredIndex(null)}
              onClick={() => handleCategoryClick(cat)}
              className={`font-serif text-6xl sm:text-8xl lg:text-9xl mx-6 sm:mx-10 transition-colors duration-300 cursor-pointer ${
                hoveredIndex === i % categories.length ? 'text-crimson' : 'text-charcoal/10 hover:text-charcoal/30'
              }`}
            >
              {cat}
            </button>
          ))}
        </div>
      </div>

      <div className="overflow-hidden mt-4">
        <div className="flex whitespace-nowrap animate-marquee" style={{ animationDirection: 'reverse', animationDuration: '25s' }}>
          {[...categories, ...categories].reverse().map((cat, i) => (
            <button
              key={`rev-${cat}-${i}`}
              onMouseEnter={() => setHoveredIndex((categories.length - 1 - (i % categories.length)) % categories.length)}
              onMouseLeave={() => setHoveredIndex(null)}
              onClick={() => handleCategoryClick(cat)}
              className={`font-serif text-6xl sm:text-8xl lg:text-9xl mx-6 sm:mx-10 transition-colors duration-300 cursor-pointer ${
                hoveredIndex === (categories.length - 1 - (i % categories.length)) % categories.length ? 'text-crimson' : 'text-charcoal/10 hover:text-charcoal/30'
              }`}
            >
              {cat}
            </button>
          ))}
        </div>
      </div>
    </section>
  );
}
