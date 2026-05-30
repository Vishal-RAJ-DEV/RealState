'use client';

import { motion } from 'framer-motion';
import Link from 'next/link';
import { ArrowRight } from 'lucide-react';
import PropertyCard from '@/components/property/PropertyCard';
import { useApp } from '@/store/PropertyContext';

export default function FeaturedSection() {
  const { state } = useApp();
  const featured = state.properties.slice(0, 8);

  return (
    <section className="w-full py-20 lg:py-32 bg-cream">
      <div className="w-full px-4 sm:px-6 lg:px-10">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="flex items-end justify-between mb-12"
        >
          <div>
            <h2 className="font-serif text-3xl sm:text-4xl lg:text-5xl text-charcoal mb-2">
              Featured Properties
            </h2>
            <p className="text-muted-foreground text-base">
              Handpicked listings for discerning buyers
            </p>
          </div>
          <Link
            href="/search"
            className="hidden sm:flex items-center gap-2 text-sm font-medium text-charcoal hover:text-crimson transition-colors"
          >
            View all
            <ArrowRight size={16} />
          </Link>
        </motion.div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {featured.map((property, i) => (
            <PropertyCard key={property.id} property={property} index={i} />
          ))}
        </div>

        <div className="sm:hidden mt-8 text-center">
          <Link
            href="/search"
            className="inline-flex items-center gap-2 text-sm font-medium text-charcoal hover:text-crimson transition-colors"
          >
            View all properties
            <ArrowRight size={16} />
          </Link>
        </div>
      </div>
    </section>
  );
}
