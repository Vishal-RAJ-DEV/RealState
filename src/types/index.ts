import type {
  Furnished,
  ListingFor,
  Prisma,
  PropertyType,
} from "@prisma/client";

export type PropertyWithSeller = Prisma.PropertyGetPayload<{
  include: {
    seller: true;
  };
}>;

export type SessionUser = {
  id: string;
  name: string;
  email: string;
  phone?: string;
  image?: string;
};

export type SearchFilters = {
  city?: string;
  type?: PropertyType;
  listingFor?: ListingFor;
  minPrice?: number;
  maxPrice?: number;
  bhk?: number;
  furnished?: Furnished;
  sort?: string;
};

// Legacy mock types (from src2 migration)
export interface Property {
  id: string;
  title: string;
  location: string;
  address: string;
  price: number;
  pricePerSqft: number;
  beds: number;
  baths: number;
  sqft: number;
  type: 'Villa' | 'Apartment' | 'Loft' | 'Penthouse' | 'House' | 'Commercial';
  listingType: 'Sale' | 'Rent';
  floor: string;
  furnished: string;
  facing: string;
  age: string;
  images: string[];
  description: string;
  amenities: string[];
  verified: boolean;
  owner: {
    name: string;
    phone: string;
    memberSince: string;
    avatar: string;
  };
  postedDate: string;
  status: 'Active' | 'Sold' | 'Rented';
  city: string;
}

export interface User {
  id: string;
  name: string;
  email: string;
  phone: string;
  avatar: string;
  memberSince: string;
}

export interface FilterState {
  city: string;
  listingType: 'Buy' | 'Rent' | 'Commercial';
  propertyType: string;
  minPrice: number;
  maxPrice: number;
  beds: number;
  searchQuery: string;
}

export interface PropertyFormData {
  title: string;
  listingType: 'Sale' | 'Rent';
  propertyType: string;
  beds: number;
  price: string;
  city: string;
  locality: string;
  images: string[];
  description: string;
  sqft: string;
  baths: number;
  amenities: string[];
}
