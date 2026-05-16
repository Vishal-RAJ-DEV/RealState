'use client';

import { Suspense, useState, useEffect, useMemo } from 'react';
import { useSearchParams } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import { SlidersHorizontal, X, ChevronDown, Search, Grid3X3, LayoutList } from 'lucide-react';
import PropertyCard from '@/components/property/PropertyCard';
import { useApp } from '@/store/PropertyContext';
import { cities } from '@/data/properties';

function SearchContent() {
  const searchParams = useSearchParams();
  const { state, setFilter, resetFilters } = useApp();
  const [showFilters, setShowFilters] = useState(false);
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [sortBy, setSortBy] = useState('relevant');

  useEffect(() => {
    const type = searchParams?.get('type');
    if (type === 'Buy') setFilter({ listingType: 'Buy' });
    if (type === 'Rent') setFilter({ listingType: 'Rent' });
    if (type === 'Commercial') setFilter({ listingType: 'Commercial' });
  }, [searchParams, setFilter]);

  const filteredProperties = useMemo(() => {
    const { city, listingType, propertyType, minPrice, maxPrice, beds, searchQuery } = state.filters;
    return state.properties.filter((p) => {
      if (city && !p.city.toLowerCase().includes(city.toLowerCase())) return false;
      if (listingType === 'Buy' && p.listingType !== 'Sale') return false;
      if (listingType === 'Rent' && p.listingType !== 'Rent') return false;
      if (listingType === 'Commercial' && p.type !== 'Commercial') return false;
      if (propertyType && p.type !== propertyType) return false;
      if (p.price < minPrice || p.price > maxPrice) return false;
      if (beds > 0 && p.beds < beds) return false;
      if (searchQuery) {
        const q = searchQuery.toLowerCase();
        const matches =
          p.title.toLowerCase().includes(q) ||
          p.location.toLowerCase().includes(q) ||
          p.city.toLowerCase().includes(q) ||
          p.type.toLowerCase().includes(q);
        if (!matches) return false;
      }
      return true;
    });
  }, [state.properties, state.filters]);

  const sortedProperties = useMemo(() => {
    const sorted = [...filteredProperties];
    switch (sortBy) {
      case 'price-low':
        sorted.sort((a, b) => a.price - b.price);
        break;
      case 'price-high':
        sorted.sort((a, b) => b.price - a.price);
        break;
      case 'newest':
        sorted.sort((a, b) => new Date(b.postedDate).getTime() - new Date(a.postedDate).getTime());
        break;
      default:
        break;
    }
    return sorted;
  }, [filteredProperties, sortBy]);

  const activeFilterCount = [
    state.filters.city,
    state.filters.propertyType,
    state.filters.beds > 0,
    state.filters.searchQuery,
  ].filter(Boolean).length;

  return (
    <main className="min-h-screen bg-cream pt-20 lg:pt-24">
      <div className="sticky top-16 lg:top-20 z-30 bg-cream/95 backdrop-blur-md border-b border-border-subtle">
        <div className="w-full px-4 sm:px-6 lg:px-10">
          <div className="flex items-center gap-3 py-3 overflow-x-auto scrollbar-hide">
            <div className="flex items-center gap-2 bg-white border border-border-subtle rounded-lg px-3 py-2 min-w-[200px]">
              <Search size={16} className="text-charcoal/40 shrink-0" />
              <input
                type="text"
                value={state.filters.searchQuery}
                onChange={(e) => setFilter({ searchQuery: e.target.value })}
                placeholder="Search..."
                className="bg-transparent text-sm outline-none w-full"
              />
              {state.filters.searchQuery && (
                <button onClick={() => setFilter({ searchQuery: '' })}>
                  <X size={14} className="text-charcoal/40" />
                </button>
              )}
            </div>

            <div className="flex bg-white border border-border-subtle rounded-lg overflow-hidden shrink-0">
              {(['Buy', 'Rent', 'Commercial'] as const).map((type) => (
                <button
                  key={type}
                  onClick={() => setFilter({ listingType: type })}
                  className={`px-4 py-2 text-sm font-medium transition-colors ${
                    state.filters.listingType === type
                      ? 'bg-charcoal text-cream'
                      : 'text-charcoal hover:bg-charcoal/5'
                  }`}
                >
                  {type}
                </button>
              ))}
            </div>

            <div className="relative shrink-0">
              <select
                value={state.filters.city}
                onChange={(e) => setFilter({ city: e.target.value })}
                className="appearance-none bg-white border border-border-subtle rounded-lg px-4 py-2 pr-8 text-sm cursor-pointer"
              >
                <option value="">All Cities</option>
                {cities.map((city) => (
                  <option key={city} value={city}>{city}</option>
                ))}
              </select>
              <ChevronDown size={14} className="absolute right-2 top-1/2 -translate-y-1/2 pointer-events-none text-charcoal/40" />
            </div>

            <div className="relative shrink-0">
              <select
                value={state.filters.beds || ''}
                onChange={(e) => setFilter({ beds: Number(e.target.value) || 0 })}
                className="appearance-none bg-white border border-border-subtle rounded-lg px-4 py-2 pr-8 text-sm cursor-pointer"
              >
                <option value="">All Beds</option>
                {[1, 2, 3, 4, 5].map((n) => (
                  <option key={n} value={n}>{n}+ Beds</option>
                ))}
              </select>
              <ChevronDown size={14} className="absolute right-2 top-1/2 -translate-y-1/2 pointer-events-none text-charcoal/40" />
            </div>

            <button
              onClick={() => setShowFilters(!showFilters)}
              className="flex items-center gap-2 bg-white border border-border-subtle rounded-lg px-4 py-2 text-sm font-medium shrink-0 hover:bg-charcoal/5 transition-colors"
            >
              <SlidersHorizontal size={16} />
              Filters
              {activeFilterCount > 0 && (
                <span className="bg-crimson text-white text-xs w-5 h-5 rounded-full flex items-center justify-center">
                  {activeFilterCount}
                </span>
              )}
            </button>

            <div className="hidden sm:flex items-center bg-white border border-border-subtle rounded-lg overflow-hidden shrink-0 ml-auto">
              <button
                onClick={() => setViewMode('grid')}
                className={`p-2 ${viewMode === 'grid' ? 'bg-charcoal text-cream' : 'text-charcoal/40'}`}
              >
                <Grid3X3 size={16} />
              </button>
              <button
                onClick={() => setViewMode('list')}
                className={`p-2 ${viewMode === 'list' ? 'bg-charcoal text-cream' : 'text-charcoal/40'}`}
              >
                <LayoutList size={16} />
              </button>
            </div>

            <div className="relative shrink-0">
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value)}
                className="appearance-none bg-white border border-border-subtle rounded-lg px-4 py-2 pr-8 text-sm cursor-pointer"
              >
                <option value="relevant">Most Relevant</option>
                <option value="price-low">Price: Low to High</option>
                <option value="price-high">Price: High to Low</option>
                <option value="newest">Newest</option>
              </select>
              <ChevronDown size={14} className="absolute right-2 top-1/2 -translate-y-1/2 pointer-events-none text-charcoal/40" />
            </div>
          </div>

          <AnimatePresence>
            {activeFilterCount > 0 && (
              <motion.div
                initial={{ height: 0, opacity: 0 }}
                animate={{ height: 'auto', opacity: 1 }}
                exit={{ height: 0, opacity: 0 }}
                className="flex items-center gap-2 pb-3 overflow-x-auto scrollbar-hide"
              >
                {state.filters.city && (
                  <span className="inline-flex items-center gap-1 bg-charcoal/5 text-charcoal text-xs px-3 py-1.5 rounded-full">
                    {state.filters.city}
                    <button onClick={() => setFilter({ city: '' })}><X size={12} /></button>
                  </span>
                )}
                {state.filters.propertyType && (
                  <span className="inline-flex items-center gap-1 bg-charcoal/5 text-charcoal text-xs px-3 py-1.5 rounded-full">
                    {state.filters.propertyType}
                    <button onClick={() => setFilter({ propertyType: '' })}><X size={12} /></button>
                  </span>
                )}
                {state.filters.beds > 0 && (
                  <span className="inline-flex items-center gap-1 bg-charcoal/5 text-charcoal text-xs px-3 py-1.5 rounded-full">
                    {state.filters.beds}+ Beds
                    <button onClick={() => setFilter({ beds: 0 })}><X size={12} /></button>
                  </span>
                )}
                {state.filters.searchQuery && (
                  <span className="inline-flex items-center gap-1 bg-charcoal/5 text-charcoal text-xs px-3 py-1.5 rounded-full">
                    &quot;{state.filters.searchQuery}&quot;
                    <button onClick={() => setFilter({ searchQuery: '' })}><X size={12} /></button>
                  </span>
                )}
                <button
                  onClick={resetFilters}
                  className="text-xs text-crimson hover:underline"
                >
                  Clear all
                </button>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>

      <div className="w-full px-4 sm:px-6 lg:px-10 py-8">
        <div className="flex items-center justify-between mb-6">
          <h1 className="font-serif text-2xl sm:text-3xl text-charcoal">
            {state.filters.listingType === 'Buy' ? 'Properties for Sale' : state.filters.listingType === 'Rent' ? 'Properties for Rent' : 'Commercial Spaces'}
          </h1>
          <span className="text-sm text-muted-foreground">
            {sortedProperties.length} {sortedProperties.length === 1 ? 'property' : 'properties'} found
          </span>
        </div>

        {sortedProperties.length === 0 ? (
          <div className="text-center py-20">
            <Search size={48} className="mx-auto text-charcoal/20 mb-4" />
            <h3 className="font-serif text-xl text-charcoal mb-2">No properties found</h3>
            <p className="text-muted-foreground mb-4">Try adjusting your filters to see more results</p>
            <button
              onClick={resetFilters}
              className="bg-crimson text-white px-6 py-2.5 rounded font-medium hover:bg-crimson/90 transition-colors"
            >
              Reset Filters
            </button>
          </div>
        ) : (
          <div className={`grid gap-6 ${
            viewMode === 'grid'
              ? 'grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4'
              : 'grid-cols-1 max-w-3xl'
          }`}>
            {sortedProperties.map((property, i) => (
              <PropertyCard key={property.id} property={property} index={i} />
            ))}
          </div>
        )}
      </div>
    </main>
  );
}

export default function SearchPage() {
  return (
    <Suspense>
      <SearchContent />
    </Suspense>
  );
}
