'use client';

import Link from 'next/link';
import Image from 'next/image';
import { motion } from 'framer-motion';
import { Heart, MapPin, Bed, Bath, Maximize, Users } from 'lucide-react';
import type { Property } from '@/types';
import { useApp } from '@/store/PropertyContext';

interface PropertyCardProps {
  property: Property;
  index?: number;
}

export default function PropertyCard({ property, index = 0 }: PropertyCardProps) {
  const { state, toggleSave } = useApp();
  const isSaved = state.savedProperties.includes(property.id);

  const formatPrice = (price: number) => {
    if (price >= 1000000) {
      return `$${(price / 1000000).toFixed(1)}M`;
    }
    if (price >= 1000) {
      return `$${(price / 1000).toFixed(0)}K`;
    }
    return `$${price}`;
  };

  const priceSuffix = property.type === 'PG_ROOM' ? '/mo' : '';

  return (
    <motion.div
      initial={{ opacity: 0, y: 30 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: '-50px' }}
      transition={{ duration: 0.5, delay: index * 0.08 }}
      className="group"
    >
      <Link href={`/property/${property.id}`} className="block">
        <div className="bg-white rounded-2xl overflow-hidden shadow-subtle hover:shadow-card transition-shadow duration-300">
          <div className="relative aspect-[4/3] overflow-hidden">
              <Image
                src={property.images[0] || '/images/placeholder.jpg'}
                alt={property.title}
                fill
                className="object-cover group-hover:scale-105 transition-transform duration-500"
                sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
              />
            <div className="absolute top-3 left-3 flex gap-2">
              <span
                className={`px-3 py-1 text-xs font-semibold rounded ${
                  property.listingType === 'Sale'
                    ? 'bg-crimson text-white'
                    : 'bg-charcoal text-white'
                }`}
              >
                FOR {property.listingType.toUpperCase()}
              </span>
              <span className="px-3 py-1 text-xs font-medium rounded bg-white/90 text-charcoal">
                {property.type === 'PG_ROOM' ? 'PG' : property.type.charAt(0) + property.type.slice(1).toLowerCase()}
              </span>
            </div>
            <button
              onClick={(e) => {
                e.preventDefault();
                e.stopPropagation();
                toggleSave(property.id);
              }}
              className="absolute top-3 right-3 w-9 h-9 rounded-full bg-white/90 flex items-center justify-center hover:bg-white transition-colors"
            >
              <Heart
                size={18}
                className={isSaved ? 'fill-crimson text-crimson' : 'text-charcoal'}
              />
            </button>
          </div>

          <div className="p-4">
            <div className="flex items-start justify-between mb-2">
              <h3 className="font-serif text-lg font-semibold text-charcoal line-clamp-1 group-hover:text-crimson transition-colors">
                {property.title}
              </h3>
            </div>

            <div className="flex items-center gap-1 text-sm text-muted-foreground mb-3">
              <MapPin size={14} />
              <span className="truncate">{property.location}</span>
            </div>

            <div className="flex items-center gap-4 text-sm text-muted-foreground mb-4">
              {property.type === 'FLAT' && (
                <>
                  <div className="flex items-center gap-1">
                    <Bed size={14} />
                    <span>{property.beds} Beds</span>
                  </div>
                  <div className="flex items-center gap-1">
                    <Bath size={14} />
                    <span>{property.baths} Baths</span>
                  </div>
                </>
              )}
              {property.type === 'PLOT' && (
                <div className="flex items-center gap-1">
                  <Maximize size={14} />
                  <span>{property.sqft.toLocaleString()} sqft</span>
                </div>
              )}
              {property.type === 'PG_ROOM' && (
                <>
                  <div className="flex items-center gap-1">
                    <Users size={14} />
                    <span>{property.beds} Beds</span>
                  </div>
                  <div className="flex items-center gap-1">
                    <Maximize size={14} />
                    <span>{property.sqft > 0 ? `${property.sqft} sqft` : 'N/A'}</span>
                  </div>
                </>
              )}
            </div>

            <div className="flex items-baseline justify-between pt-3 border-t border-border-subtle">
              <span className="text-xl font-bold text-charcoal font-sans">
                {formatPrice(property.price)}{priceSuffix}
              </span>
              {property.sqft > 0 && property.type !== 'PG_ROOM' && (
                <span className="text-sm text-muted-foreground">
                  ${Math.round(property.price / property.sqft).toLocaleString()}/sqft
                </span>
              )}
            </div>
          </div>
        </div>
      </Link>
    </motion.div>
  );
}
