'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Image from 'next/image';
import { motion } from 'framer-motion';
import {
  ArrowLeft, Upload, X, Home, Building2, Users,
  Check, Loader2, Save,
} from 'lucide-react';
import { useApp } from '@/store/PropertyContext';
import { plotAmenitiesList, flatAmenitiesList, pgAmenitiesList, areaUnits } from '@/data/properties';
import type { Property, PropertyDetailPlot, PropertyDetailFlat, PropertyDetailPG } from '@/types';

function getAmenityList(type: string) {
  switch (type) {
    case 'PLOT': return plotAmenitiesList;
    case 'FLAT': return flatAmenitiesList;
    case 'PG_ROOM': return pgAmenitiesList;
    default: return [];
  }
}

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

  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [price, setPrice] = useState('');
  const [city, setCity] = useState('');
  const [locality, setLocality] = useState('');
  const [address, setAddress] = useState('');
  const [images, setImages] = useState<string[]>([]);
  const [selectedAmenities, setSelectedAmenities] = useState<string[]>([]);
  const [status, setStatus] = useState<'Active' | 'Sold' | 'Rented'>('Active');
  const [propertyType, setPropertyType] = useState('');
  const [listingFor, setListingFor] = useState('');

  const [plotForm, setPlotForm] = useState({
    plotType: 'RESIDENTIAL',
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
    furnished: '',
    facing: '',
    age: '',
    balconies: 0,
    parking: false,
  });

  const [pgForm, setPgForm] = useState({
    roomSize: '',
    areaUnit: 'SQ_FT',
    sharingType: 'SINGLE',
    totalBeds: '',
    availableBeds: '',
    genderPreference: 'ANY',
    attachedBathroom: false,
    balcony: false,
    furnished: false,
    foodAvailable: false,
    foodType: '',
    monthlyRent: '',
    securityDeposit: '',
    maintenanceCharge: '',
  });

  useEffect(() => {
    const load = async () => {
      setLoading(true);
      const property = await fetchPropertyById(params.id) as any;
      if (!property) {
        setNotFound(true);
        setLoading(false);
        return;
      }

      setTitle(property.title);
      setDescription(property.description);
      setPrice(String(property.price));
      setCity(property.city);
      setLocality(property.locality);
      setAddress(property.address || '');
      setImages(property.images || []);
      setSelectedAmenities(property.amenities || []);
      setStatus(property.status);
      setPropertyType(property.type);
      setListingFor(property.listingType === 'Sale' ? 'SALE' : 'RENT');

      if (property.type === 'PLOT' && property.details && 'plotType' in property.details) {
        const d = property.details;
        setPlotForm({
          plotType: d.plotType,
          area: String(d.area),
          areaUnit: d.areaUnit,
          length: d.length ? String(d.length) : '',
          width: d.width ? String(d.width) : '',
          facing: d.facing || '',
          roadWidth: d.roadWidth ? String(d.roadWidth) : '',
          nearPlaces: d.nearPlaces || [],
          nearPlaceInput: '',
          boundaryWall: d.boundaryWall,
          waterAvailable: d.waterAvailable,
          electricityAvailable: d.electricityAvailable,
        });
      }

      if (property.type === 'FLAT' && property.details && 'bedrooms' in property.details) {
        const d = property.details;
        setFlatForm({
          bedrooms: d.bedrooms,
          bathrooms: d.bathrooms,
          carpetArea: d.carpetArea ? String(d.carpetArea) : '',
          builtUpArea: d.builtUpArea ? String(d.builtUpArea) : '',
          areaUnit: d.areaUnit || 'SQ_FT',
          floor: d.floor != null ? String(d.floor) : '',
          totalFloors: d.totalFloors ? String(d.totalFloors) : '',
          furnished: d.furnished || '',
          facing: d.facing || '',
          age: d.age != null ? String(d.age) : '',
          balconies: d.balconies || 0,
          parking: d.parking || false,
        });
      }

      if (property.type === 'PG_ROOM' && property.details && 'sharingType' in property.details) {
        const d = property.details;
        setPgForm({
          roomSize: d.roomSize ? String(d.roomSize) : '',
          areaUnit: d.areaUnit || 'SQ_FT',
          sharingType: d.sharingType,
          totalBeds: d.totalBeds ? String(d.totalBeds) : '',
          availableBeds: d.availableBeds != null ? String(d.availableBeds) : '',
          genderPreference: d.genderPreference,
          attachedBathroom: d.attachedBathroom,
          balcony: d.balcony,
          furnished: d.furnished,
          foodAvailable: d.foodAvailable,
          foodType: d.foodType || '',
          monthlyRent: String(d.monthlyRent),
          securityDeposit: d.securityDeposit != null ? String(d.securityDeposit) : '',
          maintenanceCharge: d.maintenanceCharge != null ? String(d.maintenanceCharge) : '',
        });
      }

      setLoading(false);
    };
    load();
  }, [params.id, fetchPropertyById]);

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

  const buildPayload = () => {
    const base: any = {
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
      status: status.toUpperCase(),
    };

    if (propertyType === 'PLOT') {
      base.details = {
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
      };
    }

    if (propertyType === 'FLAT') {
      base.details = {
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
      };
    }

    if (propertyType === 'PG_ROOM') {
      base.details = {
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
      };
    }

    return base;
  };

  const handleSubmit = async () => {
    setIsSubmitting(true);
    setSubmitError('');
    try {
      await updateProperty(params.id, buildPayload());
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
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="w-full h-12 px-4 bg-white border border-border-subtle rounded-lg text-charcoal outline-none focus:border-charcoal transition-colors"
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-charcoal mb-2">Price</label>
              <input
                type="number"
                value={price}
                onChange={(e) => setPrice(e.target.value)}
                className="w-full h-12 px-4 bg-white border border-border-subtle rounded-lg text-charcoal outline-none focus:border-charcoal transition-colors"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-charcoal mb-2">Status</label>
              <div className="flex bg-white border border-border-subtle rounded-lg overflow-hidden">
                {(['Active', 'Sold', 'Rented'] as const).map((s) => (
                  <button
                    key={s}
                    onClick={() => setStatus(s)}
                    className={`flex-1 py-3 text-sm font-medium transition-colors ${
                      status === s ? 'bg-charcoal text-cream' : 'text-charcoal hover:bg-charcoal/5'
                    }`}
                  >
                    {s}
                  </button>
                ))}
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-charcoal mb-2">City</label>
              <input
                type="text"
                value={city}
                onChange={(e) => setCity(e.target.value)}
                className="w-full h-12 px-4 bg-white border border-border-subtle rounded-lg text-charcoal outline-none focus:border-charcoal transition-colors"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-charcoal mb-2">Locality</label>
              <input
                type="text"
                value={locality}
                onChange={(e) => setLocality(e.target.value)}
                className="w-full h-12 px-4 bg-white border border-border-subtle rounded-lg text-charcoal outline-none focus:border-charcoal transition-colors"
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-charcoal mb-2">Full Address</label>
            <input
              type="text"
              value={address}
              onChange={(e) => setAddress(e.target.value)}
              className="w-full h-12 px-4 bg-white border border-border-subtle rounded-lg text-charcoal outline-none focus:border-charcoal transition-colors"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-charcoal mb-2">Description</label>
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              rows={5}
              className="w-full px-4 py-3 bg-white border border-border-subtle rounded-lg text-charcoal outline-none focus:border-charcoal transition-colors resize-none"
            />
          </div>

          {propertyType === 'PLOT' && (
            <div className="space-y-4">
              <h3 className="font-serif text-lg text-charcoal">Plot Details</h3>
              <div className="grid grid-cols-2 gap-4">
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
                <div>
                  <label className="block text-sm font-medium text-charcoal mb-2">Area</label>
                  <input
                    type="number"
                    value={plotForm.area}
                    onChange={(e) => setPlotForm(prev => ({ ...prev, area: e.target.value }))}
                    className="w-full h-12 px-4 bg-white border border-border-subtle rounded-lg text-charcoal outline-none focus:border-charcoal transition-colors"
                  />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-charcoal mb-2">Length</label>
                  <input
                    type="number"
                    value={plotForm.length}
                    onChange={(e) => setPlotForm(prev => ({ ...prev, length: e.target.value }))}
                    className="w-full h-12 px-4 bg-white border border-border-subtle rounded-lg text-charcoal outline-none focus:border-charcoal transition-colors"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-charcoal mb-2">Width</label>
                  <input
                    type="number"
                    value={plotForm.width}
                    onChange={(e) => setPlotForm(prev => ({ ...prev, width: e.target.value }))}
                    className="w-full h-12 px-4 bg-white border border-border-subtle rounded-lg text-charcoal outline-none focus:border-charcoal transition-colors"
                  />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <label className="flex items-center gap-3 bg-white border border-border-subtle rounded-lg p-4 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={plotForm.boundaryWall}
                    onChange={(e) => setPlotForm(prev => ({ ...prev, boundaryWall: e.target.checked }))}
                    className="w-4 h-4 rounded border-border-subtle text-crimson focus:ring-crimson"
                  />
                  <span className="text-sm text-charcoal">Boundary Wall</span>
                </label>
                <label className="flex items-center gap-3 bg-white border border-border-subtle rounded-lg p-4 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={plotForm.waterAvailable}
                    onChange={(e) => setPlotForm(prev => ({ ...prev, waterAvailable: e.target.checked }))}
                    className="w-4 h-4 rounded border-border-subtle text-crimson focus:ring-crimson"
                  />
                  <span className="text-sm text-charcoal">Water Available</span>
                </label>
              </div>
            </div>
          )}

          {propertyType === 'FLAT' && (
            <div className="space-y-4">
              <h3 className="font-serif text-lg text-charcoal">Flat Details</h3>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-charcoal mb-2">Bedrooms</label>
                  <div className="flex gap-2 flex-wrap">
                    {[1, 2, 3, 4, 5].map((num) => (
                      <button
                        key={num}
                        onClick={() => setFlatForm(prev => ({ ...prev, bedrooms: num }))}
                        className={`px-4 py-2 rounded-full text-sm font-medium transition-all ${
                          flatForm.bedrooms === num ? 'bg-charcoal text-cream' : 'bg-white border border-border-subtle text-charcoal'
                        }`}
                      >
                        {num}
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
                        onClick={() => setFlatForm(prev => ({ ...prev, bathrooms: num }))}
                        className={`px-4 py-2 rounded-full text-sm font-medium transition-all ${
                          flatForm.bathrooms === num ? 'bg-charcoal text-cream' : 'bg-white border border-border-subtle text-charcoal'
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
                    className="w-full h-12 px-4 bg-white border border-border-subtle rounded-lg text-charcoal outline-none focus:border-charcoal transition-colors"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-charcoal mb-2">Built-up Area</label>
                  <input
                    type="number"
                    value={flatForm.builtUpArea}
                    onChange={(e) => setFlatForm(prev => ({ ...prev, builtUpArea: e.target.value }))}
                    className="w-full h-12 px-4 bg-white border border-border-subtle rounded-lg text-charcoal outline-none focus:border-charcoal transition-colors"
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
                    className="w-full h-12 px-4 bg-white border border-border-subtle rounded-lg text-charcoal outline-none focus:border-charcoal transition-colors"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-charcoal mb-2">Total Floors</label>
                  <input
                    type="number"
                    value={flatForm.totalFloors}
                    onChange={(e) => setFlatForm(prev => ({ ...prev, totalFloors: e.target.value }))}
                    className="w-full h-12 px-4 bg-white border border-border-subtle rounded-lg text-charcoal outline-none focus:border-charcoal transition-colors"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-charcoal mb-2">Age</label>
                  <input
                    type="number"
                    value={flatForm.age}
                    onChange={(e) => setFlatForm(prev => ({ ...prev, age: e.target.value }))}
                    className="w-full h-12 px-4 bg-white border border-border-subtle rounded-lg text-charcoal outline-none focus:border-charcoal transition-colors"
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
                  </select>
                </div>
              </div>
            </div>
          )}

          {propertyType === 'PG_ROOM' && (
            <div className="space-y-4">
              <h3 className="font-serif text-lg text-charcoal">PG Details</h3>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-charcoal mb-2">Monthly Rent</label>
                  <input
                    type="number"
                    value={pgForm.monthlyRent}
                    onChange={(e) => setPgForm(prev => ({ ...prev, monthlyRent: e.target.value }))}
                    className="w-full h-12 px-4 bg-white border border-border-subtle rounded-lg text-charcoal outline-none focus:border-charcoal transition-colors"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-charcoal mb-2">Sharing Type</label>
                  <select
                    value={pgForm.sharingType}
                    onChange={(e) => setPgForm(prev => ({ ...prev, sharingType: e.target.value }))}
                    className="w-full h-12 px-4 bg-white border border-border-subtle rounded-lg text-charcoal outline-none focus:border-charcoal transition-colors"
                  >
                    <option value="SINGLE">Single</option>
                    <option value="DOUBLE">Double</option>
                    <option value="TRIPLE">Triple</option>
                    <option value="FOUR">Four</option>
                    <option value="FIVE_PLUS">5+</option>
                  </select>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-charcoal mb-2">Gender Preference</label>
                  <select
                    value={pgForm.genderPreference}
                    onChange={(e) => setPgForm(prev => ({ ...prev, genderPreference: e.target.value }))}
                    className="w-full h-12 px-4 bg-white border border-border-subtle rounded-lg text-charcoal outline-none focus:border-charcoal transition-colors"
                  >
                    <option value="MALE">Male</option>
                    <option value="FEMALE">Female</option>
                    <option value="ANY">Any</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-charcoal mb-2">Security Deposit</label>
                  <input
                    type="number"
                    value={pgForm.securityDeposit}
                    onChange={(e) => setPgForm(prev => ({ ...prev, securityDeposit: e.target.value }))}
                    className="w-full h-12 px-4 bg-white border border-border-subtle rounded-lg text-charcoal outline-none focus:border-charcoal transition-colors"
                  />
                </div>
              </div>
            </div>
          )}

          <div>
            <label className="block text-sm font-medium text-charcoal mb-2">Amenities</label>
            <div className="flex flex-wrap gap-2">
              {getAmenityList(propertyType).map((amenity) => (
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

          <div>
            <label className="block text-sm font-medium text-charcoal mb-2">Photos</label>
            {images.length < 8 && (
              <button
                onClick={handleImageUpload}
                className="w-full py-8 border-2 border-dashed border-border-subtle rounded-xl flex flex-col items-center gap-2 hover:border-charcoal/30 transition-colors bg-white mb-3"
              >
                <Upload size={24} className="text-charcoal/30" />
                <span className="text-sm text-muted-foreground">{images.length}/8 photos</span>
              </button>
            )}
            {images.length > 0 && (
              <div className="flex gap-3 overflow-x-auto pb-2">
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
            disabled={isSubmitting || !title}
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
