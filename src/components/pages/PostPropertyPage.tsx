'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Image from 'next/image';
import { motion, AnimatePresence } from 'framer-motion';
import {
  ArrowLeft, Upload, X, Home, Building2, Users,
  ChevronRight, Check, Loader2,
} from 'lucide-react';
import { useApp } from '@/store/PropertyContext';
import { plotAmenitiesList, flatAmenitiesList, pgAmenitiesList, areaUnits } from '@/data/properties';

type PropertyType = 'PLOT' | 'FLAT' | 'PG_ROOM';

const propertyTypes = [
  { value: 'PLOT' as PropertyType, label: 'Plot', icon: Home },
  { value: 'FLAT' as PropertyType, label: 'Flat', icon: Building2 },
  { value: 'PG_ROOM' as PropertyType, label: 'PG Room', icon: Users },
];

function getAmenityList(type: PropertyType) {
  switch (type) {
    case 'PLOT': return plotAmenitiesList;
    case 'FLAT': return flatAmenitiesList;
    case 'PG_ROOM': return pgAmenitiesList;
  }
}

export default function PostPropertyPage() {
  const router = useRouter();
  const { createProperty } = useApp();
  const [step, setStep] = useState(1);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState('');

  const [propertyType, setPropertyType] = useState<PropertyType | ''>('');
  const [listingFor, setListingFor] = useState<'SALE' | 'RENT' | ''>('');
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [price, setPrice] = useState('');
  const [city, setCity] = useState('');
  const [locality, setLocality] = useState('');
  const [address, setAddress] = useState('');
  const [images, setImages] = useState<string[]>([]);
  const [selectedAmenities, setSelectedAmenities] = useState<string[]>([]);

  const [plotForm, setPlotForm] = useState({
    plotType: 'RESIDENTIAL' as string,
    area: '',
    areaUnit: 'SQ_YARD',
    length: '',
    width: '',
    facing: '',
    roadWidth: '',
    nearPlaces: [] as string[],
    nearPlaceInput: '',
    boundaryWall: false,
    waterAvailable: false,
    electricityAvailable: false,
  });

  const [flatForm, setFlatForm] = useState({
    bedrooms: 1,
    bathrooms: 1,
    carpetArea: '',
    builtUpArea: '',
    areaUnit: 'SQ_FT',
    floor: '',
    totalFloors: '',
    furnished: '' as string,
    facing: '',
    age: '',
    balconies: 0,
    parking: false,
    roomSize: '' as string,
  });

  const [pgForm, setPgForm] = useState({
    roomSize: '',
    areaUnit: 'SQ_FT',
    sharingType: 'SINGLE' as string,
    totalBeds: '',
    availableBeds: '',
    genderPreference: 'ANY' as string,
    attachedBathroom: false,
    balcony: false,
    furnished: false,
    foodAvailable: false,
    foodType: '',
    monthlyRent: '',
    securityDeposit: '',
    maintenanceCharge: '',
  });

  const toggleAmenity = (amenity: string) => {
    setSelectedAmenities(prev =>
      prev.includes(amenity) ? prev.filter(a => a !== amenity) : [...prev, amenity]
    );
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
        if (validUrls.length < files.length) {
          setSubmitError(`${files.length - validUrls.length} image(s) failed to upload.`);
        }
        setImages(prev => [...prev, ...validUrls].slice(0, 8));
        setSubmitError('');
      } catch (error: any) {
        setSubmitError(error?.message || 'Image upload failed.');
      }
    };
    input.click();
  };

  const removeImage = (index: number) => {
    setImages(prev => prev.filter((_, i) => i !== index));
  };

  const addNearPlace = () => {
    if (plotForm.nearPlaceInput.trim()) {
      setPlotForm(prev => ({
        ...prev,
        nearPlaces: [...prev.nearPlaces, prev.nearPlaceInput.trim()],
        nearPlaceInput: '',
      }));
    }
  };

  const removeNearPlace = (index: number) => {
    setPlotForm(prev => ({
      ...prev,
      nearPlaces: prev.nearPlaces.filter((_, i) => i !== index),
    }));
  };

  const buildPayload = () => {
    const base = {
      title,
      description,
      price: Number(price),
      type: propertyType,
      listingFor,
      city,
      locality,
      address: address || undefined,
      images,
      amenities: selectedAmenities,
    };

    if (propertyType === 'PLOT') {
      return {
        ...base,
        details: {
          plotType: plotForm.plotType,
          area: Number(plotForm.area),
          areaUnit: plotForm.areaUnit,
          length: plotForm.length ? Number(plotForm.length) : undefined,
          width: plotForm.width ? Number(plotForm.width) : undefined,
          facing: plotForm.facing || undefined,
          roadWidth: plotForm.roadWidth ? Number(plotForm.roadWidth) : undefined,
          nearPlaces: plotForm.nearPlaces,
          boundaryWall: plotForm.boundaryWall,
          waterAvailable: plotForm.waterAvailable,
          electricityAvailable: plotForm.electricityAvailable,
        },
      };
    }

    if (propertyType === 'FLAT') {
      return {
        ...base,
        details: {
          bedrooms: flatForm.bedrooms,
          bathrooms: flatForm.bathrooms,
          carpetArea: flatForm.carpetArea ? Number(flatForm.carpetArea) : undefined,
          builtUpArea: flatForm.builtUpArea ? Number(flatForm.builtUpArea) : undefined,
          areaUnit: flatForm.areaUnit || undefined,
          floor: flatForm.floor ? Number(flatForm.floor) : undefined,
          totalFloors: flatForm.totalFloors ? Number(flatForm.totalFloors) : undefined,
          furnished: flatForm.furnished || undefined,
          facing: flatForm.facing || undefined,
          age: flatForm.age ? Number(flatForm.age) : undefined,
          balconies: flatForm.balconies,
          parking: flatForm.parking,
          roomSize: flatForm.roomSize ? JSON.parse(flatForm.roomSize) : undefined,
        },
      };
    }

    if (propertyType === 'PG_ROOM') {
      return {
        ...base,
        price: Number(pgForm.monthlyRent),
        details: {
          roomSize: pgForm.roomSize ? Number(pgForm.roomSize) : undefined,
          areaUnit: pgForm.areaUnit || undefined,
          sharingType: pgForm.sharingType,
          totalBeds: pgForm.totalBeds ? Number(pgForm.totalBeds) : undefined,
          availableBeds: pgForm.availableBeds ? Number(pgForm.availableBeds) : undefined,
          genderPreference: pgForm.genderPreference,
          attachedBathroom: pgForm.attachedBathroom,
          balcony: pgForm.balcony,
          furnished: pgForm.furnished,
          foodAvailable: pgForm.foodAvailable,
          foodType: pgForm.foodType || undefined,
          monthlyRent: Number(pgForm.monthlyRent),
          securityDeposit: pgForm.securityDeposit ? Number(pgForm.securityDeposit) : undefined,
          maintenanceCharge: pgForm.maintenanceCharge ? Number(pgForm.maintenanceCharge) : undefined,
        },
      };
    }

    return base;
  };

  const handleSubmit = async () => {
    setIsSubmitting(true);
    setSubmitError('');
    try {
      await createProperty(buildPayload());
      router.push('/dashboard');
    } catch (error: any) {
      setSubmitError(error?.message || 'Failed to create property. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const canProceedStep1 = propertyType && listingFor && title && price && city && locality;
  const canProceedStep2 = propertyType === 'PLOT'
    ? plotForm.area
    : propertyType === 'FLAT'
      ? flatForm.bedrooms > 0 && flatForm.bathrooms > 0
      : pgForm.sharingType && pgForm.monthlyRent;
  const canSubmit = images.length > 0;

  const totalSteps = 3;

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
              Step {step} of {totalSteps}
            </span>
          </div>
        </div>
        <div className="h-1 bg-charcoal/10">
          <motion.div
            className="h-full bg-crimson"
            initial={{ width: '33%' }}
            animate={{ width: `${(step / totalSteps) * 100}%` }}
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
                  <label className="block text-sm font-medium text-charcoal mb-2">Property Type</label>
                  <div className="grid grid-cols-3 gap-3">
                    {propertyTypes.map((type) => (
                      <button
                        key={type.value}
                        onClick={() => {
                          setPropertyType(type.value);
                          if (type.value === 'PLOT') setListingFor('SALE');
                          if (type.value === 'PG_ROOM') setListingFor('RENT');
                        }}
                        className={`flex flex-col items-center gap-2 py-4 rounded-xl border transition-all ${
                          propertyType === type.value
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

                {propertyType && (
                  <div>
                    <label className="block text-sm font-medium text-charcoal mb-2">Listed for</label>
                    <div className="flex bg-white border border-border-subtle rounded-lg overflow-hidden">
                      {(propertyType === 'PLOT' ? ['SALE'] : propertyType === 'PG_ROOM' ? ['RENT'] : ['SALE', 'RENT']).map((opt) => (
                        <button
                          key={opt}
                          onClick={() => setListingFor(opt as 'SALE' | 'RENT')}
                          className={`flex-1 py-3 text-sm font-medium transition-colors ${
                            listingFor === opt
                              ? 'bg-charcoal text-cream'
                              : 'text-charcoal hover:bg-charcoal/5'
                          }`}
                        >
                          {opt === 'SALE' ? 'Sale' : 'Rent'}
                        </button>
                      ))}
                    </div>
                  </div>
                )}

                <div>
                  <label className="block text-sm font-medium text-charcoal mb-2">Property Title</label>
                  <input
                    type="text"
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                    placeholder={
                      propertyType === 'PLOT'
                        ? 'e.g., Residential Plot in Sector 150'
                        : propertyType === 'PG_ROOM'
                          ? 'e.g., PG for Boys near Sector 62'
                          : 'e.g., Modern 3BHK Flat in Downtown'
                    }
                    className="w-full h-12 px-4 bg-white border border-border-subtle rounded-lg text-charcoal placeholder:text-charcoal/40 outline-none focus:border-charcoal transition-colors"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-charcoal mb-2">Description</label>
                  <textarea
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                    placeholder="Describe your property..."
                    rows={4}
                    className="w-full px-4 py-3 bg-white border border-border-subtle rounded-lg text-charcoal placeholder:text-charcoal/40 outline-none focus:border-charcoal transition-colors resize-none"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-charcoal mb-2">
                    Price {propertyType === 'PG_ROOM' ? '(Monthly Rent)' : '(Total Price)'}
                  </label>
                  <input
                    type="number"
                    value={price}
                    onChange={(e) => setPrice(e.target.value)}
                    placeholder="Enter price"
                    className="w-full h-12 px-4 bg-white border border-border-subtle rounded-lg text-charcoal placeholder:text-charcoal/40 outline-none focus:border-charcoal transition-colors"
                  />
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-charcoal mb-2">City</label>
                    <input
                      type="text"
                      value={city}
                      onChange={(e) => setCity(e.target.value)}
                      placeholder="e.g., Noida"
                      className="w-full h-12 px-4 bg-white border border-border-subtle rounded-lg text-charcoal placeholder:text-charcoal/40 outline-none focus:border-charcoal transition-colors"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-charcoal mb-2">Locality / Area</label>
                    <input
                      type="text"
                      value={locality}
                      onChange={(e) => setLocality(e.target.value)}
                      placeholder="e.g., Sector 150"
                      className="w-full h-12 px-4 bg-white border border-border-subtle rounded-lg text-charcoal placeholder:text-charcoal/40 outline-none focus:border-charcoal transition-colors"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-charcoal mb-2">Full Address (optional)</label>
                  <input
                    type="text"
                    value={address}
                    onChange={(e) => setAddress(e.target.value)}
                    placeholder="e.g., 123 Main Street"
                    className="w-full h-12 px-4 bg-white border border-border-subtle rounded-lg text-charcoal placeholder:text-charcoal/40 outline-none focus:border-charcoal transition-colors"
                  />
                </div>
              </motion.div>
            )}

            {step === 2 && propertyType === 'PLOT' && (
              <motion.div
                key="step2-plot"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                className="space-y-6"
              >
                <h2 className="font-serif text-2xl text-charcoal">Plot Details</h2>

                <div>
                  <label className="block text-sm font-medium text-charcoal mb-2">Plot Type</label>
                  <select
                    value={plotForm.plotType}
                    onChange={(e) => setPlotForm(prev => ({ ...prev, plotType: e.target.value }))}
                    className="w-full h-12 px-4 bg-white border border-border-subtle rounded-lg text-charcoal outline-none focus:border-charcoal transition-colors"
                  >
                    <option value="RESIDENTIAL">Residential</option>
                    <option value="COMMERCIAL">Commercial</option>
                    <option value="AGRICULTURAL">Agricultural</option>
                    <option value="INDUSTRIAL">Industrial</option>
                  </select>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-charcoal mb-2">Area *</label>
                    <input
                      type="number"
                      value={plotForm.area}
                      onChange={(e) => setPlotForm(prev => ({ ...prev, area: e.target.value }))}
                      placeholder="e.g., 200"
                      className="w-full h-12 px-4 bg-white border border-border-subtle rounded-lg text-charcoal placeholder:text-charcoal/40 outline-none focus:border-charcoal transition-colors"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-charcoal mb-2">Area Unit</label>
                    <select
                      value={plotForm.areaUnit}
                      onChange={(e) => setPlotForm(prev => ({ ...prev, areaUnit: e.target.value }))}
                      className="w-full h-12 px-4 bg-white border border-border-subtle rounded-lg text-charcoal outline-none focus:border-charcoal transition-colors"
                    >
                      {areaUnits.map(u => (
                        <option key={u.value} value={u.value}>{u.label}</option>
                      ))}
                    </select>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-charcoal mb-2">Length (optional)</label>
                    <input
                      type="number"
                      value={plotForm.length}
                      onChange={(e) => setPlotForm(prev => ({ ...prev, length: e.target.value }))}
                      placeholder="ft"
                      className="w-full h-12 px-4 bg-white border border-border-subtle rounded-lg text-charcoal placeholder:text-charcoal/40 outline-none focus:border-charcoal transition-colors"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-charcoal mb-2">Width (optional)</label>
                    <input
                      type="number"
                      value={plotForm.width}
                      onChange={(e) => setPlotForm(prev => ({ ...prev, width: e.target.value }))}
                      placeholder="ft"
                      className="w-full h-12 px-4 bg-white border border-border-subtle rounded-lg text-charcoal placeholder:text-charcoal/40 outline-none focus:border-charcoal transition-colors"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-charcoal mb-2">Facing</label>
                    <select
                      value={plotForm.facing}
                      onChange={(e) => setPlotForm(prev => ({ ...prev, facing: e.target.value }))}
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
                  <div>
                    <label className="block text-sm font-medium text-charcoal mb-2">Road Width (ft)</label>
                    <input
                      type="number"
                      value={plotForm.roadWidth}
                      onChange={(e) => setPlotForm(prev => ({ ...prev, roadWidth: e.target.value }))}
                      placeholder="ft"
                      className="w-full h-12 px-4 bg-white border border-border-subtle rounded-lg text-charcoal placeholder:text-charcoal/40 outline-none focus:border-charcoal transition-colors"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-charcoal mb-2">Nearby Places</label>
                  <div className="flex gap-2 mb-2">
                    <input
                      type="text"
                      value={plotForm.nearPlaceInput}
                      onChange={(e) => setPlotForm(prev => ({ ...prev, nearPlaceInput: e.target.value }))}
                      onKeyDown={(e) => e.key === 'Enter' && (e.preventDefault(), addNearPlace())}
                      placeholder="e.g., Metro Station - 1.2 km"
                      className="flex-1 h-12 px-4 bg-white border border-border-subtle rounded-lg text-charcoal placeholder:text-charcoal/40 outline-none focus:border-charcoal transition-colors"
                    />
                    <button
                      onClick={addNearPlace}
                      className="px-4 h-12 bg-charcoal text-cream rounded-lg text-sm font-medium"
                    >
                      Add
                    </button>
                  </div>
                  {plotForm.nearPlaces.length > 0 && (
                    <div className="flex flex-wrap gap-2">
                      {plotForm.nearPlaces.map((place, i) => (
                        <span key={i} className="inline-flex items-center gap-1 bg-charcoal/5 text-charcoal text-xs px-3 py-1.5 rounded-full">
                          {place}
                          <button onClick={() => removeNearPlace(i)}><X size={12} /></button>
                        </span>
                      ))}
                    </div>
                  )}
                </div>

                <div className="space-y-3">
                  {[
                    { label: 'Boundary Wall', key: 'boundaryWall' },
                    { label: 'Water Available', key: 'waterAvailable' },
                    { label: 'Electricity Available', key: 'electricityAvailable' },
                  ].map((item) => (
                    <label key={item.key} className="flex items-center gap-3 bg-white border border-border-subtle rounded-lg p-4 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={(plotForm as any)[item.key]}
                        onChange={(e) => setPlotForm(prev => ({ ...prev, [item.key]: e.target.checked }))}
                        className="w-4 h-4 rounded border-border-subtle text-crimson focus:ring-crimson"
                      />
                      <span className="text-sm text-charcoal">{item.label}</span>
                    </label>
                  ))}
                </div>
              </motion.div>
            )}

            {step === 2 && propertyType === 'FLAT' && (
              <motion.div
                key="step2-flat"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                className="space-y-6"
              >
                <h2 className="font-serif text-2xl text-charcoal">Flat Details</h2>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-charcoal mb-2">Bedrooms / BHK *</label>
                    <div className="flex gap-2 flex-wrap">
                      {[1, 2, 3, 4, 5].map((num) => (
                        <button
                          key={num}
                          onClick={() => setFlatForm(prev => ({ ...prev, bedrooms: num }))}
                          className={`px-4 py-2 rounded-full text-sm font-medium transition-all ${
                            flatForm.bedrooms === num
                              ? 'bg-charcoal text-cream'
                              : 'bg-white border border-border-subtle text-charcoal hover:border-charcoal/30'
                          }`}
                        >
                          {num}
                        </button>
                      ))}
                    </div>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-charcoal mb-2">Bathrooms *</label>
                    <div className="flex gap-2 flex-wrap">
                      {[1, 2, 3, 4, 5].map((num) => (
                        <button
                          key={num}
                          onClick={() => setFlatForm(prev => ({ ...prev, bathrooms: num }))}
                          className={`px-4 py-2 rounded-full text-sm font-medium transition-all ${
                            flatForm.bathrooms === num
                              ? 'bg-charcoal text-cream'
                              : 'bg-white border border-border-subtle text-charcoal hover:border-charcoal/30'
                          }`}
                        >
                          {num}
                        </button>
                      ))}
                    </div>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-charcoal mb-2">Carpet Area</label>
                    <input
                      type="number"
                      value={flatForm.carpetArea}
                      onChange={(e) => setFlatForm(prev => ({ ...prev, carpetArea: e.target.value }))}
                      placeholder="sqft"
                      className="w-full h-12 px-4 bg-white border border-border-subtle rounded-lg text-charcoal placeholder:text-charcoal/40 outline-none focus:border-charcoal transition-colors"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-charcoal mb-2">Built-up Area</label>
                    <input
                      type="number"
                      value={flatForm.builtUpArea}
                      onChange={(e) => setFlatForm(prev => ({ ...prev, builtUpArea: e.target.value }))}
                      placeholder="sqft"
                      className="w-full h-12 px-4 bg-white border border-border-subtle rounded-lg text-charcoal placeholder:text-charcoal/40 outline-none focus:border-charcoal transition-colors"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-3 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-charcoal mb-2">Floor</label>
                    <input
                      type="number"
                      value={flatForm.floor}
                      onChange={(e) => setFlatForm(prev => ({ ...prev, floor: e.target.value }))}
                      placeholder="e.g., 5"
                      className="w-full h-12 px-4 bg-white border border-border-subtle rounded-lg text-charcoal placeholder:text-charcoal/40 outline-none focus:border-charcoal transition-colors"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-charcoal mb-2">Total Floors</label>
                    <input
                      type="number"
                      value={flatForm.totalFloors}
                      onChange={(e) => setFlatForm(prev => ({ ...prev, totalFloors: e.target.value }))}
                      placeholder="e.g., 15"
                      className="w-full h-12 px-4 bg-white border border-border-subtle rounded-lg text-charcoal placeholder:text-charcoal/40 outline-none focus:border-charcoal transition-colors"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-charcoal mb-2">Age (years)</label>
                    <input
                      type="number"
                      value={flatForm.age}
                      onChange={(e) => setFlatForm(prev => ({ ...prev, age: e.target.value }))}
                      placeholder="e.g., 3"
                      className="w-full h-12 px-4 bg-white border border-border-subtle rounded-lg text-charcoal placeholder:text-charcoal/40 outline-none focus:border-charcoal transition-colors"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-charcoal mb-2">Furnishing</label>
                    <select
                      value={flatForm.furnished}
                      onChange={(e) => setFlatForm(prev => ({ ...prev, furnished: e.target.value }))}
                      className="w-full h-12 px-4 bg-white border border-border-subtle rounded-lg text-charcoal outline-none focus:border-charcoal transition-colors"
                    >
                      <option value="">Select...</option>
                      <option value="UNFURNISHED">Unfurnished</option>
                      <option value="SEMI">Semi-Furnished</option>
                      <option value="FULLY">Fully Furnished</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-charcoal mb-2">Facing</label>
                    <select
                      value={flatForm.facing}
                      onChange={(e) => setFlatForm(prev => ({ ...prev, facing: e.target.value }))}
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

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-charcoal mb-2">Balconies</label>
                    <div className="flex gap-2 flex-wrap">
                      {[0, 1, 2, 3].map((num) => (
                        <button
                          key={num}
                          onClick={() => setFlatForm(prev => ({ ...prev, balconies: num }))}
                          className={`px-4 py-2 rounded-full text-sm font-medium transition-all ${
                            flatForm.balconies === num
                              ? 'bg-charcoal text-cream'
                              : 'bg-white border border-border-subtle text-charcoal hover:border-charcoal/30'
                          }`}
                        >
                          {num}
                        </button>
                      ))}
                    </div>
                  </div>
                  <label className="flex items-center gap-3 bg-white border border-border-subtle rounded-lg p-4 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={flatForm.parking}
                      onChange={(e) => setFlatForm(prev => ({ ...prev, parking: e.target.checked }))}
                      className="w-4 h-4 rounded border-border-subtle text-crimson focus:ring-crimson"
                    />
                    <span className="text-sm text-charcoal">Parking Available</span>
                  </label>
                </div>
              </motion.div>
            )}

            {step === 2 && propertyType === 'PG_ROOM' && (
              <motion.div
                key="step2-pg"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                className="space-y-6"
              >
                <h2 className="font-serif text-2xl text-charcoal">PG Room Details</h2>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-charcoal mb-2">Room Size</label>
                    <input
                      type="number"
                      value={pgForm.roomSize}
                      onChange={(e) => setPgForm(prev => ({ ...prev, roomSize: e.target.value }))}
                      placeholder="sqft"
                      className="w-full h-12 px-4 bg-white border border-border-subtle rounded-lg text-charcoal placeholder:text-charcoal/40 outline-none focus:border-charcoal transition-colors"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-charcoal mb-2">Area Unit</label>
                    <select
                      value={pgForm.areaUnit}
                      onChange={(e) => setPgForm(prev => ({ ...prev, areaUnit: e.target.value }))}
                      className="w-full h-12 px-4 bg-white border border-border-subtle rounded-lg text-charcoal outline-none focus:border-charcoal transition-colors"
                    >
                      {areaUnits.map(u => (
                        <option key={u.value} value={u.value}>{u.label}</option>
                      ))}
                    </select>
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-charcoal mb-2">Sharing Type *</label>
                  <div className="flex gap-2 flex-wrap">
                    {[
                      { value: 'SINGLE', label: 'Single' },
                      { value: 'DOUBLE', label: 'Double' },
                      { value: 'TRIPLE', label: 'Triple' },
                      { value: 'FOUR', label: '4-Four' },
                      { value: 'FIVE_PLUS', label: '5+' },
                    ].map((opt) => (
                      <button
                        key={opt.value}
                        onClick={() => setPgForm(prev => ({ ...prev, sharingType: opt.value }))}
                        className={`px-4 py-2 rounded-full text-sm font-medium transition-all ${
                          pgForm.sharingType === opt.value
                            ? 'bg-charcoal text-cream'
                            : 'bg-white border border-border-subtle text-charcoal hover:border-charcoal/30'
                        }`}
                      >
                        {opt.label}
                      </button>
                    ))}
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-charcoal mb-2">Total Beds</label>
                    <input
                      type="number"
                      value={pgForm.totalBeds}
                      onChange={(e) => setPgForm(prev => ({ ...prev, totalBeds: e.target.value }))}
                      placeholder="e.g., 2"
                      className="w-full h-12 px-4 bg-white border border-border-subtle rounded-lg text-charcoal placeholder:text-charcoal/40 outline-none focus:border-charcoal transition-colors"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-charcoal mb-2">Available Beds</label>
                    <input
                      type="number"
                      value={pgForm.availableBeds}
                      onChange={(e) => setPgForm(prev => ({ ...prev, availableBeds: e.target.value }))}
                      placeholder="e.g., 1"
                      className="w-full h-12 px-4 bg-white border border-border-subtle rounded-lg text-charcoal placeholder:text-charcoal/40 outline-none focus:border-charcoal transition-colors"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-charcoal mb-2">Gender Preference</label>
                  <div className="flex gap-2 flex-wrap">
                    {[
                      { value: 'MALE', label: 'Male' },
                      { value: 'FEMALE', label: 'Female' },
                      { value: 'ANY', label: 'Any' },
                    ].map((opt) => (
                      <button
                        key={opt.value}
                        onClick={() => setPgForm(prev => ({ ...prev, genderPreference: opt.value }))}
                        className={`px-5 py-2.5 rounded-full text-sm font-medium transition-all ${
                          pgForm.genderPreference === opt.value
                            ? 'bg-charcoal text-cream'
                            : 'bg-white border border-border-subtle text-charcoal hover:border-charcoal/30'
                        }`}
                      >
                        {opt.label}
                      </button>
                    ))}
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-charcoal mb-2">Monthly Rent *</label>
                    <input
                      type="number"
                      value={pgForm.monthlyRent}
                      onChange={(e) => setPgForm(prev => ({ ...prev, monthlyRent: e.target.value }))}
                      placeholder="e.g., 9000"
                      className="w-full h-12 px-4 bg-white border border-border-subtle rounded-lg text-charcoal placeholder:text-charcoal/40 outline-none focus:border-charcoal transition-colors"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-charcoal mb-2">Security Deposit</label>
                    <input
                      type="number"
                      value={pgForm.securityDeposit}
                      onChange={(e) => setPgForm(prev => ({ ...prev, securityDeposit: e.target.value }))}
                      placeholder="e.g., 9000"
                      className="w-full h-12 px-4 bg-white border border-border-subtle rounded-lg text-charcoal placeholder:text-charcoal/40 outline-none focus:border-charcoal transition-colors"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-charcoal mb-2">Maintenance Charge</label>
                  <input
                    type="number"
                    value={pgForm.maintenanceCharge}
                    onChange={(e) => setPgForm(prev => ({ ...prev, maintenanceCharge: e.target.value }))}
                    placeholder="e.g., 500"
                    className="w-full h-12 px-4 bg-white border border-border-subtle rounded-lg text-charcoal placeholder:text-charcoal/40 outline-none focus:border-charcoal transition-colors"
                  />
                </div>

                <div className="space-y-3">
                  {[
                    { label: 'Attached Bathroom', key: 'attachedBathroom' },
                    { label: 'Balcony', key: 'balcony' },
                    { label: 'Furnished', key: 'furnished' },
                    { label: 'Food Available', key: 'foodAvailable' },
                  ].map((item) => (
                    <label key={item.key} className="flex items-center gap-3 bg-white border border-border-subtle rounded-lg p-4 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={(pgForm as any)[item.key]}
                        onChange={(e) => setPgForm(prev => ({ ...prev, [item.key]: e.target.checked }))}
                        className="w-4 h-4 rounded border-border-subtle text-crimson focus:ring-crimson"
                      />
                      <span className="text-sm text-charcoal">{item.label}</span>
                    </label>
                  ))}
                </div>

                {pgForm.foodAvailable && (
                  <div>
                    <label className="block text-sm font-medium text-charcoal mb-2">Food Type</label>
                    <select
                      value={pgForm.foodType}
                      onChange={(e) => setPgForm(prev => ({ ...prev, foodType: e.target.value }))}
                      className="w-full h-12 px-4 bg-white border border-border-subtle rounded-lg text-charcoal outline-none focus:border-charcoal transition-colors"
                    >
                      <option value="">Select...</option>
                      <option value="VEG">Veg Only</option>
                      <option value="NON_VEG">Non-Veg Only</option>
                      <option value="VEG_AND_NON_VEG">Veg & Non-Veg</option>
                    </select>
                  </div>
                )}
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
                <h2 className="font-serif text-2xl text-charcoal">Photos & Amenities</h2>

                <div>
                  <h3 className="text-sm font-medium text-charcoal mb-2">Photos</h3>
                  <p className="text-xs text-muted-foreground mb-3">
                    Add up to 8 photos. Properties with photos get 5x more views.
                  </p>
                  {images.length < 8 && (
                    <button
                      onClick={handleImageUpload}
                      className="w-full py-12 border-2 border-dashed border-border-subtle rounded-xl flex flex-col items-center gap-3 hover:border-charcoal/30 transition-colors bg-white"
                    >
                      <Upload size={32} className="text-charcoal/30" />
                      <span className="text-sm font-medium text-charcoal">Tap to upload photos</span>
                      <span className="text-xs text-muted-foreground">{images.length}/8 photos</span>
                    </button>
                  )}
                  {images.length > 0 && (
                    <div className="flex gap-3 overflow-x-auto pb-2 scrollbar-hide mt-3">
                      {images.map((img, i) => (
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

                <div>
                  <h3 className="text-sm font-medium text-charcoal mb-2">Amenities</h3>
                  <div className="flex flex-wrap gap-2">
                    {getAmenityList(propertyType as PropertyType).map((amenity) => (
                      <button
                        key={amenity}
                        onClick={() => toggleAmenity(amenity)}
                        className={`px-4 py-2 rounded-full text-sm transition-all ${
                          selectedAmenities.includes(amenity)
                            ? 'bg-charcoal text-cream'
                            : 'bg-white border border-border-subtle text-charcoal hover:border-charcoal/30'
                        }`}
                      >
                        {selectedAmenities.includes(amenity) && <Check size={12} className="inline mr-1" />}
                        {amenity}
                      </button>
                    ))}
                  </div>
                </div>
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
          {step < totalSteps ? (
            <button
              onClick={() => setStep(step + 1)}
              disabled={step === 1 ? !canProceedStep1 : !canProceedStep2}
              className="flex-1 py-3.5 bg-charcoal text-cream rounded-xl font-medium hover:bg-charcoal/90 transition-colors disabled:opacity-40 disabled:cursor-not-allowed flex items-center justify-center gap-2"
            >
              Continue
              <ChevronRight size={18} />
            </button>
          ) : (
            <button
              onClick={handleSubmit}
              disabled={!canSubmit || isSubmitting}
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
