'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Image from 'next/image';
import { motion } from 'framer-motion';
import {
  ArrowLeft, Upload, X, Home, Building2, Castle, Store,
  Check, Loader2, Save,
} from 'lucide-react';
import { useApp } from '@/store/PropertyContext';
import { amenitiesList } from '@/data/properties';
import type { Property } from '@/types';

const typeReverseMap: Record<string, string> = {
  'Villa': 'Villa',
  'Apartment': 'Flat',
  'House': 'Plot',
  'Commercial': 'Commercial',
};

const furnishedReverseMap: Record<string, string> = {
  'Unfurnished': 'UNFURNISHED',
  'Semi-Furnished': 'SEMI',
  'Fully Furnished': 'FULLY',
};

type EditPropertyPageProps = {
  params: { id: string };
};

export default function EditPropertyPage({ params }: EditPropertyPageProps) {
  const router = useRouter();
  const { updateProperty, fetchPropertyById } = useApp();
  const [loading, setLoading] = useState(true);
  const [notFound, setNotFound] = useState(false);
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
    address: '',
    sqft: '',
    description: '',
    selectedAmenities: [] as string[],
    furnished: '',
    floor: 0,
    totalFloors: 0,
    facing: '',
    age: 0,
    images: [] as string[],
    status: 'Active' as 'Active' | 'Sold' | 'Rented',
  });

  useEffect(() => {
    const load = async () => {
      setLoading(true);
      const property = await fetchPropertyById(params.id) as Property | null;
      if (!property) {
        setNotFound(true);
        setLoading(false);
        return;
      }
      const typeLabel = Object.entries(typeReverseMap).find(
        ([k]) => k === property.type
      )?.[1] || 'Flat';

      setFormData({
        title: property.title,
        listingType: property.listingType,
        propertyType: typeLabel,
        beds: property.beds,
        baths: property.baths,
        price: String(property.price),
        city: property.city,
        locality: property.location.split(', ').slice(1).join(', ') || property.city,
        address: property.address,
        sqft: String(property.sqft),
        description: property.description,
        selectedAmenities: property.amenities || [],
        furnished: property.furnished,
        floor: parseInt(property.floor) || 0,
        totalFloors: 0,
        facing: property.facing,
        age: parseInt(property.age) || 0,
        images: property.images,
        status: property.status,
      });
      setLoading(false);
    };
    load();
  }, [params.id, fetchPropertyById]);

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
        const err = await res.json().catch(() => ({}));
        throw new Error(err.error || 'Upload failed');
      });
      try {
        const urls = await Promise.all(uploadPromises);
        const validUrls = urls.filter(Boolean) as string[];
        setFormData((prev) => ({
          ...prev,
          images: [...prev.images, ...validUrls].slice(0, 8),
        }));
        setSubmitError('');
      } catch (error: any) {
        setSubmitError(error?.message || 'Image upload failed.');
      }
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
      const typeMap: Record<string, string> = {
        Flat: 'FLAT', Villa: 'VILLA', Plot: 'PLOT', Commercial: 'COMMERCIAL',
      };
      const listingMap: Record<string, string> = {
        Sale: 'SALE', Rent: 'RENT',
      };
      await updateProperty(params.id, {
        title: formData.title,
        description: formData.description,
        price: Number(formData.price),
        type: typeMap[formData.propertyType] || 'FLAT',
        listingFor: listingMap[formData.listingType] || 'SALE',
        bhk: formData.beds,
        baths: formData.baths || undefined,
        area: Number(formData.sqft) || undefined,
        city: formData.city,
        locality: formData.locality,
        address: formData.address || undefined,
        totalFloors: formData.totalFloors || undefined,
        facing: formData.facing || undefined,
        age: formData.age || undefined,
        floor: formData.floor || undefined,
        furnished: furnishedReverseMap[formData.furnished] || undefined,
        images: formData.images,
        amenities: formData.selectedAmenities,
        status: formData.status.toUpperCase() as 'ACTIVE' | 'SOLD' | 'RENTED',
      });
      router.push('/dashboard');
    } catch (error: any) {
      setSubmitError(error?.message || 'Failed to update property.');
    } finally {
      setIsSubmitting(false);
    }
  };

  if (loading) {
    return (
      <main className="min-h-screen bg-cream flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-charcoal/40" />
      </main>
    );
  }

  if (notFound) {
    return (
      <main className="min-h-screen bg-cream flex items-center justify-center">
        <div className="text-center">
          <h2 className="font-serif text-2xl text-charcoal mb-4">Property not found</h2>
          <button onClick={() => router.push('/dashboard')} className="bg-crimson text-white px-6 py-2.5 rounded font-medium">
            Go to Dashboard
          </button>
        </div>
      </main>
    );
  }

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
            <h1 className="font-serif text-lg sm:text-xl text-charcoal">Edit Property</h1>
            <div className="w-20" />
          </div>
        </div>
      </div>

      <div className="pt-20 pb-32 px-4 sm:px-6 lg:px-10">
        <div className="max-w-2xl mx-auto space-y-6">
          <div>
            <label className="block text-sm font-medium text-charcoal mb-2">Property Title</label>
            <input
              type="text"
              value={formData.title}
              onChange={(e) => updateField('title', e.target.value)}
              className="w-full h-12 px-4 bg-white border border-border-subtle rounded-lg text-charcoal outline-none focus:border-charcoal transition-colors"
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
                    formData.listingType === type ? 'bg-charcoal text-cream' : 'text-charcoal hover:bg-charcoal/5'
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
              {[
                { label: 'Flat', icon: Building2 },
                { label: 'Villa', icon: Castle },
                { label: 'Plot', icon: Home },
                { label: 'Commercial', icon: Store },
              ].map((type) => (
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

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-charcoal mb-2">Bedrooms</label>
              <div className="flex gap-2 flex-wrap">
                {[1, 2, 3, 4, 5].map((num) => (
                  <button
                    key={num}
                    onClick={() => updateField('beds', num)}
                    className={`px-5 py-2.5 rounded-full text-sm font-medium transition-all ${
                      formData.beds === num ? 'bg-charcoal text-cream' : 'bg-white border border-border-subtle text-charcoal hover:border-charcoal/30'
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
                      formData.baths === num ? 'bg-charcoal text-cream' : 'bg-white border border-border-subtle text-charcoal hover:border-charcoal/30'
                    }`}
                  >
                    {num} {num === 5 ? '+' : ''}
                  </button>
                ))}
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-charcoal mb-2">Price (USD)</label>
              <input
                type="number"
                value={formData.price}
                onChange={(e) => updateField('price', e.target.value)}
                className="w-full h-12 px-4 bg-white border border-border-subtle rounded-lg text-charcoal outline-none focus:border-charcoal transition-colors"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-charcoal mb-2">Area (sqft)</label>
              <input
                type="number"
                value={formData.sqft}
                onChange={(e) => updateField('sqft', e.target.value)}
                className="w-full h-12 px-4 bg-white border border-border-subtle rounded-lg text-charcoal outline-none focus:border-charcoal transition-colors"
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
                className="w-full h-12 px-4 bg-white border border-border-subtle rounded-lg text-charcoal outline-none focus:border-charcoal transition-colors"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-charcoal mb-2">Locality</label>
              <input
                type="text"
                value={formData.locality}
                onChange={(e) => updateField('locality', e.target.value)}
                className="w-full h-12 px-4 bg-white border border-border-subtle rounded-lg text-charcoal outline-none focus:border-charcoal transition-colors"
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-charcoal mb-2">Full Address</label>
            <input
              type="text"
              value={formData.address}
              onChange={(e) => updateField('address', e.target.value)}
              className="w-full h-12 px-4 bg-white border border-border-subtle rounded-lg text-charcoal outline-none focus:border-charcoal transition-colors"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-charcoal mb-2">Description</label>
            <textarea
              value={formData.description}
              onChange={(e) => updateField('description', e.target.value)}
              rows={5}
              className="w-full px-4 py-3 bg-white border border-border-subtle rounded-lg text-charcoal outline-none focus:border-charcoal transition-colors resize-none"
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-charcoal mb-2">Furnished</label>
              <select
                value={formData.furnished}
                onChange={(e) => updateField('furnished', e.target.value)}
                className="w-full h-12 px-4 bg-white border border-border-subtle rounded-lg text-charcoal outline-none focus:border-charcoal transition-colors"
              >
                <option value="">Select...</option>
                <option value="Unfurnished">Unfurnished</option>
                <option value="Semi-Furnished">Semi-Furnished</option>
                <option value="Fully Furnished">Fully Furnished</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-charcoal mb-2">Facing</label>
              <select
                value={formData.facing}
                onChange={(e) => updateField('facing', e.target.value)}
                className="w-full h-12 px-4 bg-white border border-border-subtle rounded-lg text-charcoal outline-none focus:border-charcoal transition-colors"
              >
                <option value="">Select...</option>
                <option value="North">North</option>
                <option value="South">South</option>
                <option value="East">East</option>
                <option value="West">West</option>
                <option value="North-East">North-East</option>
                <option value="North-West">North-West</option>
                <option value="South-East">South-East</option>
                <option value="South-West">South-West</option>
              </select>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div>
              <label className="block text-sm font-medium text-charcoal mb-2">Floor</label>
              <input
                type="number"
                value={formData.floor || ''}
                onChange={(e) => updateField('floor', Number(e.target.value) || 0)}
                className="w-full h-12 px-4 bg-white border border-border-subtle rounded-lg text-charcoal outline-none focus:border-charcoal transition-colors"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-charcoal mb-2">Total Floors</label>
              <input
                type="number"
                value={formData.totalFloors || ''}
                onChange={(e) => updateField('totalFloors', Number(e.target.value) || 0)}
                className="w-full h-12 px-4 bg-white border border-border-subtle rounded-lg text-charcoal outline-none focus:border-charcoal transition-colors"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-charcoal mb-2">Age (years)</label>
              <input
                type="number"
                value={formData.age || ''}
                onChange={(e) => updateField('age', Number(e.target.value) || 0)}
                className="w-full h-12 px-4 bg-white border border-border-subtle rounded-lg text-charcoal outline-none focus:border-charcoal transition-colors"
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-charcoal mb-2">Status</label>
            <div className="flex bg-white border border-border-subtle rounded-lg overflow-hidden">
              {(['Active', 'Sold', 'Rented'] as const).map((s) => (
                <button
                  key={s}
                  onClick={() => updateField('status', s)}
                  className={`flex-1 py-3 text-sm font-medium transition-colors ${
                    formData.status === s ? 'bg-charcoal text-cream' : 'text-charcoal hover:bg-charcoal/5'
                  }`}
                >
                  {s}
                </button>
              ))}
            </div>
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

          <div>
            <label className="block text-sm font-medium text-charcoal mb-2">Photos</label>
            {formData.images.length < 8 && (
              <button
                onClick={handleImageUpload}
                className="w-full py-8 border-2 border-dashed border-border-subtle rounded-xl flex flex-col items-center gap-2 hover:border-charcoal/30 transition-colors bg-white mb-3"
              >
                <Upload size={24} className="text-charcoal/30" />
                <span className="text-sm text-muted-foreground">{formData.images.length}/8 photos</span>
              </button>
            )}
            {formData.images.length > 0 && (
              <div className="flex gap-3 overflow-x-auto pb-2">
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
          </div>

          {submitError && (
            <div className="p-3 bg-red-50 border border-red-200 rounded-lg text-sm text-red-700">
              {submitError}
            </div>
          )}
        </div>
      </div>

      <div className="fixed bottom-0 left-0 right-0 z-40 bg-white border-t border-border-subtle p-4">
        <div className="max-w-2xl mx-auto flex gap-3">
          <button
            onClick={() => router.back()}
            className="flex-1 py-3.5 border-2 border-charcoal text-charcoal rounded-xl font-medium hover:bg-charcoal/5 transition-colors"
          >
            Cancel
          </button>
          <button
            onClick={handleSubmit}
            disabled={isSubmitting || !formData.title}
            className="flex-1 py-3.5 bg-crimson text-white rounded-xl font-medium hover:bg-crimson/90 transition-colors disabled:opacity-40 disabled:cursor-not-allowed flex items-center justify-center gap-2"
          >
            {isSubmitting ? (
              <Loader2 size={18} className="animate-spin" />
            ) : (
              <Save size={18} />
            )}
            {isSubmitting ? 'Saving...' : 'Save Changes'}
          </button>
        </div>
      </div>
    </main>
  );
}
