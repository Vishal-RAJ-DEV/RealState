'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import {
  Bell, Plus, Building2, Eye, Phone, MoreVertical,
  Heart, Trash2,
} from 'lucide-react';
import { useApp } from '@/store/PropertyContext';
import PropertyCard from '@/components/property/PropertyCard';

export default function DashboardPage() {
  const router = useRouter();
  const { state, logout, getSavedProperties, deleteProperty } = useApp();
  const savedProperties = getSavedProperties();
  const [showMenu, setShowMenu] = useState<string | null>(null);
  const [myListings, setMyListings] = useState<any[]>([]);
  const [stats, setStats] = useState({
    total: 0,
    active: 0,
    sold: 0,
    totalLeads: 0,
    totalViews: 0,
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchMyListings = async () => {
      try {
        const res = await fetch('/api/properties/my-listings');
        if (res.ok) {
          const data = await res.json();
          setMyListings(data.properties);
          setStats(data.stats);
        }
      } catch (error) {
        console.error('Error fetching my listings:', error);
      } finally {
        setLoading(false);
      }
    };
    fetchMyListings();
  }, []);

  const handleDelete = async (id: string) => {
    if (!confirm('Delete this property? This action cannot be undone.')) return;
    try {
      const res = await fetch(`/api/properties/${id}`, { method: 'DELETE' });
      if (res.ok) {
        setMyListings(prev => prev.filter(p => p.id !== id));
      }
    } catch (error) {
      console.error('Error deleting property:', error);
    }
  };

  const displayStats = [
    { label: 'My Listings', value: stats.total, icon: Building2, color: 'bg-crimson/10 text-crimson' },
    { label: 'Total Views', value: stats.totalViews, icon: Eye, color: 'bg-blue-50 text-blue-600' },
    { label: 'Inquiries', value: stats.totalLeads, icon: Phone, color: 'bg-green-50 text-green-600' },
    { label: 'Saved', value: savedProperties.length, icon: Heart, color: 'bg-amber-50 text-amber-600' },
  ];

  const greeting = () => {
    const hour = new Date().getHours();
    if (hour < 12) return 'Good morning';
    if (hour < 17) return 'Good afternoon';
    return 'Good evening';
  };

  return (
    <main className="min-h-screen bg-cream">
      <div className="fixed top-0 left-0 right-0 z-50 bg-cream/95 backdrop-blur-md border-b border-border-subtle">
        <div className="w-full px-4 sm:px-6 lg:px-10">
          <div className="flex items-center justify-between h-16">
            <h1 className="font-serif text-xl text-charcoal">My Dashboard</h1>
            <div className="flex items-center gap-3">
              <button className="w-9 h-9 rounded-full bg-charcoal/5 flex items-center justify-center hover:bg-charcoal/10 transition-colors relative">
                <Bell size={18} />
                <span className="absolute top-0 right-0 w-2.5 h-2.5 bg-crimson rounded-full border-2 border-cream" />
              </button>
              <button
                onClick={logout}
                className="text-sm text-muted-foreground hover:text-crimson transition-colors"
              >
                Logout
              </button>
            </div>
          </div>
        </div>
      </div>

      <div className="pt-20 pb-32 px-4 sm:px-6 lg:px-10">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-8"
        >
          <h2 className="font-serif text-2xl sm:text-3xl text-charcoal">
            {greeting()}, {state.currentUser?.name || 'Guest'}
          </h2>
          <p className="text-muted-foreground mt-1">Here&apos;s what&apos;s happening with your properties</p>
        </motion.div>

        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-10">
          {displayStats.map((stat, i) => (
            <motion.div
              key={stat.label}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.1 }}
              className="bg-white rounded-xl p-5 border border-border-subtle"
            >
              <div className={`w-10 h-10 rounded-lg ${stat.color} flex items-center justify-center mb-3`}>
                <stat.icon size={20} />
              </div>
              <div className="font-serif text-2xl text-charcoal">{stat.value}</div>
              <div className="text-xs text-muted-foreground">{stat.label}</div>
            </motion.div>
          ))}
        </div>

        <div className="flex flex-col lg:flex-row gap-8">
          <div className="flex-1">
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-serif text-xl text-charcoal">My Listings</h3>
              <button
                onClick={() => router.push('/post')}
                className="flex items-center gap-1.5 text-sm font-medium text-crimson hover:underline"
              >
                <Plus size={16} />
                Add new
              </button>
            </div>

            {loading ? (
              <div className="bg-white rounded-xl p-8 border border-border-subtle text-center">
                <div className="w-8 h-8 border-2 border-charcoal/20 border-t-charcoal rounded-full animate-spin mx-auto mb-3" />
                <p className="text-sm text-muted-foreground">Loading your listings...</p>
              </div>
            ) : myListings.length === 0 ? (
              <div className="bg-white rounded-xl p-8 border border-border-subtle text-center">
                <Building2 size={40} className="mx-auto text-charcoal/20 mb-3" />
                <p className="text-charcoal font-medium mb-1">No listings yet</p>
                <p className="text-sm text-muted-foreground mb-4">Post your first property to get started</p>
                <button
                  onClick={() => router.push('/post')}
                  className="bg-crimson text-white px-6 py-2.5 rounded-lg font-medium text-sm"
                >
                  Post Property
                </button>
              </div>
            ) : (
              <div className="space-y-3">
                {myListings.map((property) => (
                  <motion.div
                    key={property.id}
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    className="bg-white rounded-xl p-4 border border-border-subtle flex items-center gap-4"
                  >
                    <Link href={`/property/${property.id}`} className="block shrink-0">
                      <Image
                        src={property.images[0]}
                        alt={property.title}
                        width={56}
                        height={56}
                        className="w-14 h-14 rounded-lg object-cover"
                      />
                    </Link>
                    <div className="flex-1 min-w-0">
                      <Link href={`/property/${property.id}`}>
                        <h4 className="font-medium text-charcoal text-sm truncate hover:text-crimson transition-colors">
                          {property.title}
                        </h4>
                      </Link>
                      <p className="text-xs text-muted-foreground">
                        ${(property.price / 1000000).toFixed(1)}M &middot; {property.location}
                      </p>
                    </div>
                    <span className={`px-2.5 py-1 rounded-full text-xs font-medium shrink-0 ${
                      property.status === 'Active'
                        ? 'bg-green-50 text-green-600'
                        : property.status === 'Sold'
                          ? 'bg-charcoal/10 text-charcoal'
                          : 'bg-amber-50 text-amber-600'
                    }`}>
                      {property.status}
                    </span>
                    <div className="relative shrink-0">
                      <button
                        onClick={() => setShowMenu(showMenu === property.id ? null : property.id)}
                        className="w-8 h-8 rounded-full hover:bg-charcoal/5 flex items-center justify-center"
                      >
                        <MoreVertical size={16} />
                      </button>
                      {showMenu === property.id && (
                        <div className="absolute right-0 top-full mt-1 bg-white border border-border-subtle rounded-lg shadow-lg py-1 z-10 w-32">
                          <button
                            onClick={() => setShowMenu(null)}
                            className="w-full text-left px-3 py-2 text-sm text-charcoal hover:bg-charcoal/5 flex items-center gap-2"
                          >
                            <Eye size={14} />
                            View
                          </button>
                          <button
                            onClick={(e) => { e.stopPropagation(); setShowMenu(null); handleDelete(property.id); }}
                            className="w-full text-left px-3 py-2 text-sm text-red-600 hover:bg-red-50 flex items-center gap-2"
                          >
                            <Trash2 size={14} />
                            Delete
                          </button>
                        </div>
                      )}
                    </div>
                  </motion.div>
                ))}

                <button
                  onClick={() => router.push('/post')}
                  className="w-full py-4 border-2 border-dashed border-border-subtle rounded-xl flex items-center justify-center gap-2 text-muted-foreground hover:border-charcoal/30 hover:text-charcoal transition-colors"
                >
                  <Plus size={18} />
                  <span className="text-sm font-medium">Add new property</span>
                </button>
              </div>
            )}
          </div>

          <div className="lg:w-[400px] shrink-0">
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-serif text-xl text-charcoal">Saved Properties</h3>
              {savedProperties.length > 0 && (
                <Link href="/saved" className="text-sm text-crimson hover:underline">
                  View all
                </Link>
              )}
            </div>

            {savedProperties.length === 0 ? (
              <div className="bg-white rounded-xl p-8 border border-border-subtle text-center">
                <Heart size={40} className="mx-auto text-charcoal/20 mb-3" />
                <p className="text-charcoal font-medium mb-1">No saved properties</p>
                <p className="text-sm text-muted-foreground mb-4">
                  Properties you save will appear here
                </p>
                <button
                  onClick={() => router.push('/search')}
                  className="text-sm text-crimson hover:underline"
                >
                  Browse properties
                </button>
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-1 gap-4">
                {savedProperties.slice(0, 4).map((property, i) => (
                  <PropertyCard key={property.id} property={property} index={i} />
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </main>
  );
}
