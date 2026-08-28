import type {
  Furnished,
  ListingFor,
  Prisma,
  PropertyType,
  PlotType,
  SharingType,
  GenderPreference,
  Status,
} from "@prisma/client";

export type PropertyWithDetails = Prisma.PropertyGetPayload<{
  include: {
    seller: { select: { id: true; name: true; phone: true; image: true; createdAt: true } };
    _count: { select: { leads: true } };
    plotDetails: true;
    flatDetails: true;
    pgDetails: true;
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
  furnished?: Furnished;
  sort?: string;
  bhk?: number;
  plotType?: PlotType;
  sharingType?: SharingType;
  genderPreference?: GenderPreference;
};

export interface PropertyDetailPlot {
  plotType: PlotType;
  area: number;
  areaUnit: string;
  length?: number | null;
  width?: number | null;
  facing?: string | null;
  roadWidth?: number | null;
  nearPlaces: string[];
  boundaryWall: boolean;
  waterAvailable: boolean;
  electricityAvailable: boolean;
}

export interface PropertyDetailFlat {
  bedrooms: number;
  bathrooms: number;
  carpetArea?: number | null;
  builtUpArea?: number | null;
  areaUnit?: string | null;
  floor?: number | null;
  totalFloors?: number | null;
  furnished?: Furnished | null;
  facing?: string | null;
  age?: number | null;
  balconies?: number | null;
  parking: boolean;
  roomSize?: unknown;
}

export interface PropertyDetailPG {
  roomSize?: number | null;
  areaUnit?: string | null;
  sharingType: SharingType;
  totalBeds?: number | null;
  availableBeds?: number | null;
  genderPreference: GenderPreference;
  attachedBathroom: boolean;
  balcony: boolean;
  furnished: boolean;
  foodAvailable: boolean;
  foodType?: string | null;
  monthlyRent: number;
  securityDeposit?: number | null;
  maintenanceCharge?: number | null;
}

export interface Property {
  id: string;
  title: string;
  description: string;
  type: PropertyType;
  listingType: 'Sale' | 'Rent';
  price: number;
  location: string;
  city: string;
  locality: string;
  address: string;
  latitude?: number | null;
  longitude?: number | null;
  images: string[];
  amenities: string[];
  status: Status;
  views: number;
  leads: number;
  beds: number;
  baths: number;
  sqft: number;
  pricePerSqft: number;
  owner: {
    id: string;
    name: string;
    phone: string;
    memberSince: string;
    avatar: string;
  };
  postedDate: string;
  details?: PropertyDetailPlot | PropertyDetailFlat | PropertyDetailPG | null;
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
  listingType: 'Buy' | 'Rent' | 'PG';
  propertyType: string;
  minPrice: number;
  maxPrice: number;
  beds: number;
  searchQuery: string;
}
