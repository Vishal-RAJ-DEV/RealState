'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Image from 'next/image';
import { motion, AnimatePresence } from 'framer-motion';
import {
  ArrowLeft, Share2, Heart, MapPin, Phone, MessageSquare,
  ChevronLeft, ChevronRight, X, Send, Loader2,
  Bed, Bath, Maximize, Map, Ruler, Droplets, Zap, Wifi,
  Users, ShieldCheck, UtensilsCrossed, Wallet,
} from 'lucide-react';
import { useApp } from '@/store/PropertyContext';
import type { Property, PropertyDetailPlot, PropertyDetailFlat, PropertyDetailPG } from '@/types';
import { LoadingSpinner } from '@/components/shared/LoadingSpinner';

interface PropertyDetailPageProps {
  params: { id: string };
}

function formatPrice(price: number) {
  if (price >= 1000000) return `$${(price / 1000000).toFixed(2)}M`;
  if (price >= 1000) return `$${(price / 1000).toFixed(0)}K`;
  return `$${price}`;
}

function PlotDetailsSection({ details }: { details: PropertyDetailPlot }) {
  return (
    <div className="space-y-4">
      <h3 className="font-serif text-xl text-charcoal">Plot Details</h3>
      <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
        <SpecCard icon={Map} label="Plot Type" value={details.plotType} />
        <SpecCard icon={Maximize} label="Area" value={`${details.area} ${details.areaUnit}`} />
        {details.facing && <SpecCard icon={MapPin} label="Facing" value={details.facing} />}
        {details.length && details.width && (
          <SpecCard icon={Ruler} label="Dimensions" value={`${details.length} x ${details.width} ft`} />
        )}
        {details.roadWidth && (
          <SpecCard icon={Map} label="Road Width" value={`${details.roadWidth} ft`} />
        )}
      </div>
      <div className="grid grid-cols-3 gap-3">
        <InfoBadge icon={Droplets} label="Water" available={details.waterAvailable} />
        <InfoBadge icon={Zap} label="Electricity" available={details.electricityAvailable} />
        <InfoBadge icon={ShieldCheck} label="Boundary Wall" available={details.boundaryWall} />
      </div>
      {details.nearPlaces.length > 0 && (
        <div>
          <h4 className="text-sm font-medium text-charcoal mb-2">Nearby Places</h4>
          <div className="flex flex-wrap gap-2">
            {details.nearPlaces.map((place, i) => (
              <span key={i} className="px-3 py-1.5 bg-charcoal/5 text-charcoal text-xs rounded-full">{place}</span>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

function FlatDetailsSection({ details }: { details: PropertyDetailFlat }) {
  const furnishedLabel = details.furnished === 'FULLY' ? 'Fully Furnished'
    : details.furnished === 'SEMI' ? 'Semi-Furnished'
    : details.furnished === 'UNFURNISHED' ? 'Unfurnished' : 'N/A';

  return (
    <div className="space-y-4">
      <h3 className="font-serif text-xl text-charcoal">Flat Details</h3>
      <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
        <SpecCard icon={Bed} label="Bedrooms" value={`${details.bedrooms} BHK`} />
        <SpecCard icon={Bath} label="Bathrooms" value={`${details.bathrooms}`} />
        {details.carpetArea && (
          <SpecCard icon={Maximize} label="Carpet Area" value={`${details.carpetArea} sqft`} />
        )}
        {details.builtUpArea && (
          <SpecCard icon={Maximize} label="Built-up Area" value={`${details.builtUpArea} sqft`} />
        )}
        {details.floor != null && (
          <SpecCard icon={Map} label="Floor" value={`Floor ${details.floor}${details.totalFloors ? ` of ${details.totalFloors}` : ''}`} />
        )}
        <SpecCard icon={MapPin} label="Facing" value={details.facing || 'N/A'} />
        {details.age != null && (
          <SpecCard icon={ShieldCheck} label="Age" value={details.age === 0 ? 'New' : `${details.age} years`} />
        )}
        {details.balconies != null && (
          <SpecCard icon={Map} label="Balconies" value={`${details.balconies}`} />
        )}
        <SpecCard icon={ShieldCheck} label="Furnished" value={furnishedLabel} />
        <SpecCard icon={ShieldCheck} label="Parking" value={details.parking ? 'Available' : 'Not Available'} />
      </div>
    </div>
  );
}

function PGDetailsSection({ details }: { details: PropertyDetailPG }) {
  const sharingLabel: Record<string, string> = {
    SINGLE: 'Single Occupancy',
    DOUBLE: 'Double Sharing',
    TRIPLE: 'Triple Sharing',
    FOUR: '4-Four Sharing',
    FIVE_PLUS: '5+ Sharing',
  };

  return (
    <div className="space-y-4">
      <h3 className="font-serif text-xl text-charcoal">PG Room Details</h3>
      <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
        {details.roomSize && (
          <SpecCard icon={Maximize} label="Room Size" value={`${details.roomSize} ${details.areaUnit || 'sqft'}`} />
        )}
        <SpecCard icon={Users} label="Sharing" value={sharingLabel[details.sharingType] || details.sharingType} />
        {details.totalBeds && (
          <SpecCard icon={Bed} label="Total Beds" value={`${details.totalBeds}`} />
        )}
        {details.availableBeds != null && (
          <SpecCard icon={Bed} label="Available Beds" value={`${details.availableBeds}`} />
        )}
        <SpecCard icon={Users} label="Gender" value={details.genderPreference === 'ANY' ? 'Unisex' : details.genderPreference} />
        <SpecCard icon={Wallet} label="Monthly Rent" value={`$${details.monthlyRent.toLocaleString()}`} />
        {details.securityDeposit != null && (
          <SpecCard icon={Wallet} label="Security Deposit" value={`$${details.securityDeposit.toLocaleString()}`} />
        )}
        {details.maintenanceCharge != null && (
          <SpecCard icon={Wallet} label="Maintenance" value={`$${details.maintenanceCharge.toLocaleString()}/mo`} />
        )}
      </div>
      <div className="grid grid-cols-4 gap-3">
        <InfoBadge icon={ShieldCheck} label="Attached Bath" available={details.attachedBathroom} />
        <InfoBadge icon={Map} label="Balcony" available={details.balcony} />
        <InfoBadge icon={ShieldCheck} label="Furnished" available={details.furnished} />
        <InfoBadge icon={UtensilsCrossed} label="Food" available={details.foodAvailable} />
      </div>
      {details.foodAvailable && details.foodType && (
        <p className="text-sm text-muted-foreground">Food Type: {details.foodType.replace(/_/g, ' ')}</p>
      )}
    </div>
  );
}

function SpecCard({ icon: Icon, label, value }: { icon: any; label: string; value: string }) {
  return (
    <div className="bg-white rounded-xl p-4 border border-border-subtle">
      <Icon size={18} className="text-crimson mb-2" />
      <div className="font-semibold text-charcoal text-sm">{value}</div>
      <div className="text-xs text-muted-foreground">{label}</div>
    </div>
  );
}

function InfoBadge({ icon: Icon, label, available }: { icon: any; label: string; available: boolean }) {
  return (
    <div className={`flex items-center gap-2 px-3 py-2 rounded-lg text-sm ${available ? 'bg-green-50 text-green-700' : 'bg-red-50 text-red-600'}`}>
      <Icon size={14} />
      <span>{label}</span>
    </div>
  );
}

export default function PropertyDetailPage({ params }: PropertyDetailPageProps) {
  const router = useRouter();
  const { state, toggleSave, fetchPropertyById } = useApp();
  const [currentImage, setCurrentImage] = useState(0);
  const [showAllAmenities, setShowAllAmenities] = useState(false);
  const [property, setProperty] = useState<Property | null>(null);
  const [loading, setLoading] = useState(true);
  const [showContactForm, setShowContactForm] = useState(false);
  const [contactForm, setContactForm] = useState({ name: '', phone: '', email: '', message: '' });
  const [contactSubmitting, setContactSubmitting] = useState(false);
  const [contactSuccess, setContactSuccess] = useState('');
  const [contactError, setContactError] = useState('');

  useEffect(() => {
    window.scrollTo(0, 0);
  }, [params.id]);

  useEffect(() => {
    const load = async () => {
      setLoading(true);
      const data = await fetchPropertyById(params.id);
      setProperty(data);
      setCurrentImage(0);
      setLoading(false);
    };
    load();
  }, [params.id, fetchPropertyById]);

  const isSaved = property ? state.savedProperties.includes(property.id) : false;

  const handleContactSubmit = async () => {
    setContactSubmitting(true);
    setContactError('');
    setContactSuccess('');
    try {
      const res = await fetch(`/api/leads/${params.id}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(contactForm),
      });
      if (!res.ok) {
        const err = await res.json();
        throw new Error(err.error || 'Failed to send message');
      }
      setContactSuccess('Your message has been sent! The owner will contact you soon.');
      setContactForm({ name: '', phone: '', email: '', message: '' });
    } catch (error: any) {
      setContactError(error?.message || 'Failed to send message.');
    } finally {
      setContactSubmitting(false);
    }
  };

  if (loading) {
    return (
      <main className="min-h-screen bg-cream pt-20 flex items-center justify-center">
        <LoadingSpinner />
      </main>
    );
  }

  if (!property) {
    return (
      <main className="min-h-screen bg-cream pt-20 flex items-center justify-center">
        <div className="text-center">
          <h2 className="font-serif text-2xl text-charcoal mb-4">Property not found</h2>
          <button
            onClick={() => router.push('/search')}
            className="bg-crimson text-white px-6 py-2.5 rounded font-medium"
          >
            Browse Properties
          </button>
        </div>
      </main>
    );
  }

  const details = property.details as PropertyDetailPlot | PropertyDetailFlat | PropertyDetailPG | null;
  const displayedAmenities = showAllAmenities ? property.amenities : property.amenities.slice(0, 6);
  const priceLabel = property.type === 'PG_ROOM' ? '/month' : '';

  return (
    <main className="min-h-screen bg-cream">
      <div className="fixed top-0 left-0 right-0 z-50 bg-cream/95 backdrop-blur-md border-b border-border-subtle">
        <div className="w-full px-4 sm:px-6 lg:px-10">
          <div className="flex items-center justify-between h-16">
            <button
              onClick={() => router.back()}
              className="flex items-center gap-2 text-sm font-medium text-charcoal hover:text-crimson transition-colors"
            >
              <ArrowLeft size={18} />
              <span className="hidden sm:inline">Back</span>
            </button>
            <div className="flex items-center gap-3">
              <button className="w-9 h-9 rounded-full bg-charcoal/5 flex items-center justify-center hover:bg-charcoal/10 transition-colors">
                <Share2 size={16} />
              </button>
              <button
                onClick={() => toggleSave(property.id)}
                className={`w-9 h-9 rounded-full flex items-center justify-center transition-colors ${
                  isSaved ? 'bg-crimson text-white' : 'bg-charcoal/5 hover:bg-charcoal/10'
                }`}
              >
                <Heart size={16} className={isSaved ? 'fill-white' : ''} />
              </button>
            </div>
          </div>
        </div>
      </div>

      <div className="relative w-full h-[50vh] sm:h-[60vh] lg:h-[70vh] mt-16 overflow-hidden bg-charcoal">
        <motion.div
          key={currentImage}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.5 }}
          className="relative w-full h-full"
        >
          <Image
            src={property.images[currentImage] || '/images/placeholder.jpg'}
            alt={property.title}
            fill
            className="object-cover"
            priority
          />
        </motion.div>

        <div className="absolute top-4 left-4 flex gap-2">
          <span className={`px-3 py-1.5 text-xs font-semibold rounded ${
            property.listingType === 'Sale' ? 'bg-crimson text-white' : 'bg-charcoal text-white'
          }`}>
            FOR {property.listingType.toUpperCase()}
          </span>
          <span className="px-3 py-1.5 text-xs font-medium rounded bg-white/90 text-charcoal">
            {property.type.replace('_', ' ')}
          </span>
        </div>

        {property.images.length > 1 && (
          <>
            <button
              onClick={() => setCurrentImage((prev) => (prev === 0 ? property.images.length - 1 : prev - 1))}
              className="absolute left-4 top-1/2 -translate-y-1/2 w-10 h-10 rounded-full bg-white/80 flex items-center justify-center hover:bg-white transition-colors"
            >
              <ChevronLeft size={20} />
            </button>
            <button
              onClick={() => setCurrentImage((prev) => (prev === property.images.length - 1 ? 0 : prev + 1))}
              className="absolute right-4 top-1/2 -translate-y-1/2 w-10 h-10 rounded-full bg-white/80 flex items-center justify-center hover:bg-white transition-colors"
            >
              <ChevronRight size={20} />
            </button>
          </>
        )}

        {property.images.length > 1 && (
          <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex gap-2">
            {property.images.map((_, i) => (
              <button
                key={i}
                onClick={() => setCurrentImage(i)}
                className={`w-2 h-2 rounded-full transition-all ${
                  i === currentImage ? 'bg-white w-6' : 'bg-white/50'
                }`}
              />
            ))}
          </div>
        )}
      </div>

      <div className="w-full px-4 sm:px-6 lg:px-10 py-8">
        <div className="flex flex-col lg:flex-row gap-8 lg:gap-12">
          <div className="flex-1 lg:max-w-[60%]">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5 }}
            >
              <div className="flex items-baseline justify-between mb-2">
                <h1 className="font-serif text-3xl sm:text-4xl lg:text-5xl text-charcoal">
                  {formatPrice(property.price)}{priceLabel}
                </h1>
                {property.sqft > 0 && property.type !== 'PG_ROOM' && (
                  <span className="text-sm text-muted-foreground">
                    ${Math.round(property.price / property.sqft).toLocaleString()}/sqft
                  </span>
                )}
              </div>
              <h2 className="font-serif text-xl sm:text-2xl text-charcoal/90 mb-3">
                {property.title}
              </h2>
              <div className="flex items-center gap-2 text-muted-foreground mb-6">
                <MapPin size={16} />
                <span>{property.address}</span>
              </div>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.1 }}
              className="mb-8"
            >
              {property.type === 'PLOT' && details && 'plotType' in details && (
                <PlotDetailsSection details={details as PropertyDetailPlot} />
              )}
              {property.type === 'FLAT' && details && 'bedrooms' in details && (
                <FlatDetailsSection details={details as PropertyDetailFlat} />
              )}
              {property.type === 'PG_ROOM' && details && 'sharingType' in details && (
                <PGDetailsSection details={details as PropertyDetailPG} />
              )}
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.2 }}
              className="mb-8"
            >
              <h3 className="font-serif text-xl text-charcoal mb-3">Description</h3>
              <p className="text-muted-foreground leading-relaxed">{property.description}</p>
            </motion.div>

            {property.amenities.length > 0 && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: 0.3 }}
                className="mb-8"
              >
                <h3 className="font-serif text-xl text-charcoal mb-3">Amenities</h3>
                <div className="flex flex-wrap gap-2">
                  {displayedAmenities.map((amenity) => (
                    <span
                      key={amenity}
                      className="px-4 py-2 bg-white border border-border-subtle rounded-full text-sm text-charcoal"
                    >
                      {amenity}
                    </span>
                  ))}
                </div>
                {property.amenities.length > 6 && (
                  <button
                    onClick={() => setShowAllAmenities(!showAllAmenities)}
                    className="mt-3 text-sm text-crimson hover:underline"
                  >
                    {showAllAmenities ? 'Show less' : `Show all ${property.amenities.length} amenities`}
                  </button>
                )}
              </motion.div>
            )}

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.4 }}
              className="bg-white rounded-2xl p-6 border border-border-subtle"
            >
              <div className="flex items-center gap-4">
                <div className="w-14 h-14 rounded-full bg-charcoal/10 flex items-center justify-center text-lg font-semibold text-charcoal overflow-hidden">
                  {property.owner.avatar ? (
                    <Image src={property.owner.avatar} alt={property.owner.name} width={56} height={56} className="w-full h-full object-cover" />
                  ) : (
                    property.owner.name.charAt(0)
                  )}
                </div>
                <div className="flex-1">
                  <h4 className="font-semibold text-charcoal">{property.owner.name}</h4>
                  <p className="text-sm text-muted-foreground">
                    Owner &middot; Member since {property.owner.memberSince}
                  </p>
                </div>
                <a
                  href={`tel:${property.owner.phone}`}
                  className="w-12 h-12 rounded-full bg-crimson/10 flex items-center justify-center text-crimson hover:bg-crimson hover:text-white transition-colors"
                >
                  <Phone size={20} />
                </a>
              </div>
            </motion.div>
          </div>

          <div className="lg:w-[380px] shrink-0">
            <div className="lg:sticky lg:top-24">
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: 0.2 }}
                className="bg-white rounded-2xl p-6 border border-border-subtle shadow-subtle"
              >
                <div className="mb-6">
                  <p className="text-sm text-muted-foreground mb-1">Price</p>
                  <p className="font-serif text-3xl text-charcoal">{formatPrice(property.price)}{priceLabel}</p>
                </div>

                <div className="space-y-3 mb-6">
                  <a
                    href={`tel:${property.owner.phone}`}
                    className="flex items-center justify-center gap-2 w-full py-3.5 border-2 border-charcoal text-charcoal rounded-xl font-medium hover:bg-charcoal hover:text-cream transition-colors"
                  >
                    <Phone size={18} />
                    Call Now
                  </a>
                  <button
                    onClick={() => { setShowContactForm(true); setContactError(''); setContactSuccess(''); }}
                    className="flex items-center justify-center gap-2 w-full py-3.5 bg-crimson text-white rounded-xl font-medium hover:bg-crimson/90 transition-colors"
                  >
                    <MessageSquare size={18} />
                    Send Message
                  </button>
                </div>

                <div className="pt-4 border-t border-border-subtle">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full bg-charcoal/10 flex items-center justify-center text-sm font-semibold overflow-hidden">
                      {property.owner.avatar ? (
                        <Image src={property.owner.avatar} alt={property.owner.name} width={40} height={40} className="w-full h-full object-cover" />
                      ) : (
                        property.owner.name.charAt(0)
                      )}
                    </div>
                    <div>
                      <p className="text-sm font-medium text-charcoal">{property.owner.name}</p>
                      <p className="text-xs text-muted-foreground">Owner</p>
                    </div>
                  </div>
                </div>
              </motion.div>
            </div>
          </div>
        </div>
      </div>

      <div className="fixed bottom-0 left-0 right-0 z-40 bg-white border-t border-border-subtle p-4 lg:hidden pb-20">
        <div className="flex gap-3">
          <a
            href={`tel:${property.owner.phone}`}
            className="flex-1 flex items-center justify-center gap-2 py-3 border-2 border-charcoal text-charcoal rounded-xl font-medium"
          >
            <Phone size={18} />
            Call Now
          </a>
          <button
            onClick={() => { setShowContactForm(true); setContactError(''); setContactSuccess(''); }}
            className="flex-1 flex items-center justify-center gap-2 py-3 bg-crimson text-white rounded-xl font-medium"
          >
            <MessageSquare size={18} />
            Message
          </button>
        </div>
      </div>

      <AnimatePresence>
        {showContactForm && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 bg-black/40 flex items-end sm:items-center justify-center"
            onClick={() => setShowContactForm(false)}
          >
            <motion.div
              initial={{ opacity: 0, y: 100 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 100 }}
              onClick={(e) => e.stopPropagation()}
              className="bg-white rounded-t-2xl sm:rounded-2xl w-full sm:max-w-md p-6 shadow-xl"
            >
              <div className="flex items-center justify-between mb-4">
                <h3 className="font-serif text-xl text-charcoal">Send Message</h3>
                <button
                  onClick={() => setShowContactForm(false)}
                  className="w-8 h-8 rounded-full bg-charcoal/5 flex items-center justify-center"
                >
                  <X size={16} />
                </button>
              </div>

              {contactSuccess ? (
                <div className="p-4 bg-green-50 border border-green-200 rounded-lg text-sm text-green-700 mb-4">
                  {contactSuccess}
                </div>
              ) : (
                <div className="space-y-4">
                  <input
                    type="text"
                    placeholder="Your Name"
                    value={contactForm.name}
                    onChange={(e) => setContactForm(prev => ({ ...prev, name: e.target.value }))}
                    className="w-full h-12 px-4 bg-white border border-border-subtle rounded-lg text-charcoal placeholder:text-charcoal/40 outline-none focus:border-charcoal transition-colors"
                  />
                  <input
                    type="tel"
                    placeholder="Phone Number"
                    value={contactForm.phone}
                    onChange={(e) => setContactForm(prev => ({ ...prev, phone: e.target.value }))}
                    className="w-full h-12 px-4 bg-white border border-border-subtle rounded-lg text-charcoal placeholder:text-charcoal/40 outline-none focus:border-charcoal transition-colors"
                  />
                  <input
                    type="email"
                    placeholder="Email"
                    value={contactForm.email}
                    onChange={(e) => setContactForm(prev => ({ ...prev, email: e.target.value }))}
                    className="w-full h-12 px-4 bg-white border border-border-subtle rounded-lg text-charcoal placeholder:text-charcoal/40 outline-none focus:border-charcoal transition-colors"
                  />
                  <textarea
                    placeholder="Message (optional)"
                    value={contactForm.message}
                    onChange={(e) => setContactForm(prev => ({ ...prev, message: e.target.value }))}
                    rows={3}
                    className="w-full px-4 py-3 bg-white border border-border-subtle rounded-lg text-charcoal placeholder:text-charcoal/40 outline-none focus:border-charcoal transition-colors resize-none"
                  />
                  {contactError && (
                    <div className="p-3 bg-red-50 border border-red-200 rounded-lg text-sm text-red-700">
                      {contactError}
                    </div>
                  )}
                  <button
                    onClick={handleContactSubmit}
                    disabled={contactSubmitting || !contactForm.name || !contactForm.phone || !contactForm.email}
                    className="w-full py-3.5 bg-crimson text-white rounded-xl font-medium hover:bg-crimson/90 transition-colors disabled:opacity-40 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                  >
                    {contactSubmitting ? (
                      <Loader2 size={18} className="animate-spin" />
                    ) : (
                      <Send size={18} />
                    )}
                    {contactSubmitting ? 'Sending...' : 'Send Message'}
                  </button>
                </div>
              )}
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </main>
  );
}
