'use client';

import Link from 'next/link';
import { ArrowLeft, Heart } from 'lucide-react';
import PropertyCard from '@/components/property/PropertyCard';
import { useApp } from '@/store/PropertyContext';

export default function SavedPropertiesPage() {
  const { getSavedProperties } = useApp();
  const saved = getSavedProperties();

  return (
    <main className="min-h-screen bg-cream pt-20 lg:pt-24">
      <div className="w-full px-4 sm:px-6 lg:px-10 py-8">
        <div className="flex items-center gap-4 mb-8">
          <Link
            href="/"
            className="flex items-center gap-2 text-sm font-medium text-charcoal hover:text-crimson transition-colors"
          >
            <ArrowLeft size={18} />
          </Link>
          <div>
            <h1 className="font-serif text-2xl sm:text-3xl text-charcoal">Saved Properties</h1>
            <p className="text-sm text-muted-foreground">
              {saved.length} {saved.length === 1 ? 'property' : 'properties'} saved
            </p>
          </div>
        </div>

        {saved.length === 0 ? (
          <div className="text-center py-20">
            <Heart size={48} className="mx-auto text-charcoal/20 mb-4" />
            <h3 className="font-serif text-xl text-charcoal mb-2">No saved properties</h3>
            <p className="text-muted-foreground mb-6">
              Start exploring and save properties you like
            </p>
            <Link
              href="/search"
              className="bg-crimson text-white px-6 py-2.5 rounded-lg font-medium hover:bg-crimson/90 transition-colors"
            >
              Browse Properties
            </Link>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {saved.map((property, i) => (
              <PropertyCard key={property.id} property={property} index={i} />
            ))}
          </div>
        )}
      </div>
    </main>
  );
}
