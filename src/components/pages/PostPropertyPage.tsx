'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Image from 'next/image';
import { motion, AnimatePresence } from 'framer-motion';
import { ArrowLeft, Upload, X, Home, Building2, Castle, Store, ChevronRight, Check, Loader2 } from 'lucide-react';
import { useApp } from '@/store/PropertyContext';
import { amenitiesList } from '@/data/properties';

const typeMap: Record<string, string> = {
  Flat: 'FLAT',
  Villa: 'VILLA',
  Plot: 'PLOT',
  Commercial: 'COMMERCIAL',
};

const listingMap: Record<string, string> = {
  Sale: 'SALE',
  Rent: 'RENT',
};

const propertyTypes = [
  { label: 'Flat', icon: Building2 },
  { label: 'Villa', icon: Castle },
  { label: 'Plot', icon: Home },
  { label: 'Commercial', icon: Store },
];

export default function PostPropertyPage() {
  const router = useRouter();
  const { createProperty } = useApp();
  const [step, setStep] = useState(1);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState('');
  const [formData, setFormData] = useState({
    title: '',
    listingType: 'Sale' as 'Sale' | 'Rent',
    propertyType: '',
    beds: 0,
    baths: 0,
    price: '',
    city: '',
    locality: '',
    sqft: '',
    description: '',
    selectedAmenities: [] as string[],
    images: [] as string[],
  });

  const updateField = (field: string, value: unknown) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  const toggleAmenity = (amenity: string) => {
    setFormData((prev) => ({
      ...prev,
      selectedAmenities: prev.selectedAmenities.includes(amenity)
        ? prev.selectedAmenities.filter((a) => a !== amenity)
        : [...prev.selectedAmenities, amenity],
    }));
  };

  const handleImageUpload = async () => {
    const input = document.createElement('input');
    input.type = 'file';
    input.accept = 'image/*';
    input.multiple = true;
    input.onchange = async () => {
      const files = Array.from(input.files || []);
      const uploadPromises = files.map(async (file) => {
        const body = new FormData();
        body.append('file', file);
        const res = await fetch('/api/upload', { method: 'POST', body });
        if (res.ok) {
          const data = await res.json();
          return data.url;
        }
        return null;
      });
      const urls = (await Promise.all(uploadPromises)).filter(Boolean) as string[];
      setFormData((prev) => ({
        ...prev,
        images: [...prev.images, ...urls].slice(0, 8),
      }));
    };
    input.click();
  };

  const removeImage = (index: number) => {
    setFormData((prev) => ({
      ...prev,
      images: prev.images.filter((_, i) => i !== index),
    }));
  };

  const handleSubmit = async () => {
    setIsSubmitting(true);
    setSubmitError('');
    try {
      await createProperty({
        title: formData.title,
        description: formData.description,
        price: Number(formData.price),
        type: typeMap[formData.propertyType] || 'FLAT',
        listingFor: listingMap[formData.listingType] || 'SALE',
        bhk: formData.beds,
        area: Number(formData.sqft) || undefined,
        city: formData.city,
        locality: formData.locality,
        images: formData.images.length > 0 ? formData.images : undefined,
      });
      router.push('/dashboard');
    } catch (error: any) {
      setSubmitError(error?.message || 'Failed to create property. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const isStep1Valid = formData.title && formData.propertyType && formData.beds > 0 && formData.price && formData.city && formData.locality;
  const isStep2Valid = formData.sqft && formData.description;
  const isStep3Valid = formData.images.length > 0;

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
            <h1 className="font-serif text-lg sm:text-xl text-charcoal absolute left-1/2 -translate-x-1/2">
              Post your property
            </h1>
            <span className="text-xs text-muted-foreground">
              Step {step} of 3
            </span>
          </div>
        </div>
        <div className="h-1 bg-charcoal/10">
          <motion.div
            className="h-full bg-crimson"
            initial={{ width: '33%' }}
            animate={{ width: `${(step / 3) * 100}%` }}
            transition={{ duration: 0.3 }}
          />
        </div>
      </div>

      <div className="pt-24 pb-32 px-4 sm:px-6 lg:px-10">
        <div className="max-w-2xl mx-auto">
          <AnimatePresence mode="wait">
            {step === 1 && (
              <motion.div
                key="step1"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                className="space-y-6"
              >
                <h2 className="font-serif text-2xl text-charcoal">Property basics</h2>

                <div>
                  <label className="block text-sm font-medium text-charcoal mb-2">Property Title</label>
                  <input
                    type="text"
                    value={formData.title}
                    onChange={(e) => updateField('title', e.target.value)}
                    placeholder="e.g., Modern 3BHK Apartment in Downtown"
                    className="w-full h-12 px-4 bg-white border border-border-subtle rounded-lg text-charcoal placeholder:text-charcoal/40 outline-none focus:border-charcoal transition-colors"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-charcoal mb-2">Listed for</label>
                  <div className="flex bg-white border border-border-subtle rounded-lg overflow-hidden">
                    {(['Sale', 'Rent'] as const).map((type) => (
                      <button
                        key={type}
                        onClick={() => updateField('listingType', type)}
                        className={`flex-1 py-3 text-sm font-medium transition-colors ${
                          formData.listingType === type
                            ? 'bg-charcoal text-cream'
                            : 'text-charcoal hover:bg-charcoal/5'
                        }`}
                      >
                        {type}
                      </button>
                    ))}
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-charcoal mb-2">Property Type</label>
                  <div className="grid grid-cols-4 gap-3">
                    {propertyTypes.map((type) => (
                      <button
                        key={type.label}
                        onClick={() => updateField('propertyType', type.label)}
                        className={`flex flex-col items-center gap-2 py-4 rounded-xl border transition-all ${
                          formData.propertyType === type.label
                            ? 'border-crimson bg-crimson/5 text-crimson'
                            : 'border-border-subtle bg-white text-charcoal hover:border-charcoal/30'
                        }`}
                      >
                        <type.icon size={24} />
                        <span className="text-xs font-medium">{type.label}</span>
                      </button>
                    ))}
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-charcoal mb-2">Bedrooms</label>
                  <div className="flex gap-2 flex-wrap">
                    {[1, 2, 3, 4, 5].map((num) => (
                      <button
                        key={num}
                        onClick={() => updateField('beds', num)}
                        className={`px-5 py-2.5 rounded-full text-sm font-medium transition-all ${
                          formData.beds === num
                            ? 'bg-charcoal text-cream'
                            : 'bg-white border border-border-subtle text-charcoal hover:border-charcoal/30'
                        }`}
                      >
                        {num} {num === 5 ? '+' : ''} BHK
                      </button>
                    ))}
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-charcoal mb-2">Bathrooms</label>
                  <div className="flex gap-2 flex-wrap">
                    {[1, 2, 3, 4, 5].map((num) => (
                      <button
                        key={num}
                        onClick={() => updateField('baths', num)}
                        className={`px-5 py-2.5 rounded-full text-sm font-medium transition-all ${
                          formData.baths === num
                            ? 'bg-charcoal text-cream'
                            : 'bg-white border border-border-subtle text-charcoal hover:border-charcoal/30'
                        }`}
                      >
                        {num} {num === 5 ? '+' : ''}
                      </button>
                    ))}
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-charcoal mb-2">Price (USD)</label>
                  <div className="relative">
                    <span className="absolute left-4 top-1/2 -translate-y-1/2 text-charcoal/50">$</span>
                    <input
                      type="number"
                      value={formData.price}
                      onChange={(e) => updateField('price', e.target.value)}
                      placeholder="Enter price"
                      className="w-full h-12 pl-8 pr-4 bg-white border border-border-subtle rounded-lg text-charcoal placeholder:text-charcoal/40 outline-none focus:border-charcoal transition-colors"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-charcoal mb-2">City</label>
                    <input
                      type="text"
                      value={formData.city}
                      onChange={(e) => updateField('city', e.target.value)}
                      placeholder="e.g., New York"
                      className="w-full h-12 px-4 bg-white border border-border-subtle rounded-lg text-charcoal placeholder:text-charcoal/40 outline-none focus:border-charcoal transition-colors"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-charcoal mb-2">Locality / Area</label>
                    <input
                      type="text"
                      value={formData.locality}
                      onChange={(e) => updateField('locality', e.target.value)}
                      placeholder="e.g., Manhattan"
                      className="w-full h-12 px-4 bg-white border border-border-subtle rounded-lg text-charcoal placeholder:text-charcoal/40 outline-none focus:border-charcoal transition-colors"
                    />
                  </div>
                </div>
              </motion.div>
            )}

            {step === 2 && (
              <motion.div
                key="step2"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                className="space-y-6"
              >
                <h2 className="font-serif text-2xl text-charcoal">Property details</h2>

                <div>
                  <label className="block text-sm font-medium text-charcoal mb-2">Area (sqft)</label>
                  <input
                    type="number"
                    value={formData.sqft}
                    onChange={(e) => updateField('sqft', e.target.value)}
                    placeholder="e.g., 2500"
                    className="w-full h-12 px-4 bg-white border border-border-subtle rounded-lg text-charcoal placeholder:text-charcoal/40 outline-none focus:border-charcoal transition-colors"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-charcoal mb-2">Description</label>
                  <textarea
                    value={formData.description}
                    onChange={(e) => updateField('description', e.target.value)}
                    placeholder="Describe your property..."
                    rows={5}
                    className="w-full px-4 py-3 bg-white border border-border-subtle rounded-lg text-charcoal placeholder:text-charcoal/40 outline-none focus:border-charcoal transition-colors resize-none"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-charcoal mb-2">Amenities</label>
                  <div className="flex flex-wrap gap-2">
                    {amenitiesList.map((amenity) => (
                      <button
                        key={amenity}
                        onClick={() => toggleAmenity(amenity)}
                        className={`px-4 py-2 rounded-full text-sm transition-all ${
                          formData.selectedAmenities.includes(amenity)
                            ? 'bg-charcoal text-cream'
                            : 'bg-white border border-border-subtle text-charcoal hover:border-charcoal/30'
                        }`}
                      >
                        {formData.selectedAmenities.includes(amenity) && <Check size={12} className="inline mr-1" />}
                        {amenity}
                      </button>
                    ))}
                  </div>
                </div>
              </motion.div>
            )}

            {step === 3 && (
              <motion.div
                key="step3"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                className="space-y-6"
              >
                <h2 className="font-serif text-2xl text-charcoal">Add photos</h2>
                <p className="text-sm text-muted-foreground">
                  Add up to 8 photos of your property. Properties with photos get 5x more views.
                </p>

                {formData.images.length < 8 && (
                  <button
                    onClick={handleImageUpload}
                    className="w-full py-12 border-2 border-dashed border-border-subtle rounded-xl flex flex-col items-center gap-3 hover:border-charcoal/30 transition-colors bg-white"
                  >
                    <Upload size={32} className="text-charcoal/30" />
                    <span className="text-sm font-medium text-charcoal">Tap to upload photos</span>
                    <span className="text-xs text-muted-foreground">{formData.images.length}/8 photos</span>
                  </button>
                )}

                {formData.images.length > 0 && (
                  <div className="flex gap-3 overflow-x-auto pb-2 scrollbar-hide">
                    {formData.images.map((img, i) => (
                      <div key={i} className="relative shrink-0 w-20 h-20 rounded-lg overflow-hidden">
                        <Image src={img} alt={`Upload ${i + 1}`} fill className="object-cover" sizes="80px" />
                        <button
                          onClick={() => removeImage(i)}
                          className="absolute top-1 right-1 w-5 h-5 bg-charcoal/70 rounded-full flex items-center justify-center text-white"
                        >
                          <X size={10} />
                        </button>
                      </div>
                    ))}
                  </div>
                )}
              </motion.div>
            )}
          </AnimatePresence>

          {submitError && (
            <div className="mt-4 p-3 bg-red-50 border border-red-200 rounded-lg text-sm text-red-700">
              {submitError}
            </div>
          )}
        </div>
      </div>

      <div className="fixed bottom-0 left-0 right-0 z-40 bg-white border-t border-border-subtle p-4 lg:pb-4 pb-20">
        <div className="max-w-2xl mx-auto flex gap-3">
          {step > 1 && (
            <button
              onClick={() => setStep(step - 1)}
              className="flex-1 py-3.5 border-2 border-charcoal text-charcoal rounded-xl font-medium hover:bg-charcoal/5 transition-colors"
            >
              Back
            </button>
          )}
          {step < 3 ? (
            <button
              onClick={() => setStep(step + 1)}
              disabled={step === 1 ? !isStep1Valid : !isStep2Valid}
              className="flex-1 py-3.5 bg-charcoal text-cream rounded-xl font-medium hover:bg-charcoal/90 transition-colors disabled:opacity-40 disabled:cursor-not-allowed flex items-center justify-center gap-2"
            >
              Continue
              <ChevronRight size={18} />
            </button>
          ) : (
            <button
              onClick={handleSubmit}
              disabled={!isStep3Valid || isSubmitting}
              className="flex-1 py-3.5 bg-crimson text-white rounded-xl font-medium hover:bg-crimson/90 transition-colors disabled:opacity-40 disabled:cursor-not-allowed flex items-center justify-center gap-2"
            >
              {isSubmitting ? (
                <Loader2 size={18} className="animate-spin" />
              ) : (
                <Check size={18} />
              )}
              {isSubmitting ? 'Posting...' : 'Post Property'}
            </button>
          )}
        </div>
      </div>
    </main>
  );
}
