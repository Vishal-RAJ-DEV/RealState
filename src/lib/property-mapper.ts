import { PropertyType, ListingFor, Furnished, Status } from "@prisma/client";

// The shape of property data as returned by our API routes (with seller select)
export type ApiProperty = {
  id: string;
  title: string;
  description: string;
  price: number;
  type: string;
  listingFor: string;
  bhk: number | null;
  area: number | null;
  city: string;
  locality: string;
  address: string | null;
  images: string[];
  furnished: string | null;
  floor: number | null;
  totalFloors: number | null;
  facing: string | null;
  age: number | null;
  status: string;
  views: number;
  sellerId: string;
  createdAt: Date;
  updatedAt: Date;
  seller: {
    id: string;
    name: string;
    phone: string | null;
    image: string | null;
    createdAt: Date;
  };
  _count: {
    leads: number;
  };
};

export function mapPropertyToFrontend(property: ApiProperty) {
  return {
    id: property.id,
    title: property.title,
    location: `${property.city}, ${property.locality}`.trim().replace(/^, /, '').replace(/,$/, ''),
    address: property.address || '',
    price: property.price,
    pricePerSqft: property.area ? Math.round(property.price / property.area) : 0,
    beds: property.bhk ?? 0,
    baths: 0,
    sqft: property.area ?? 0,
    type: mapPropertyType(property.type),
    listingType: property.listingFor === 'SALE' ? 'Sale' : 'Rent',
    floor: property.floor ? property.floor.toString() : 'Ground',
    furnished: mapFurnished(property.furnished),
    facing: property.facing || 'North',
    age: property.age ? `${property.age} years` : 'New',
    images: property.images,
    description: property.description,
    amenities: [],
    verified: true,
    owner: {
      name: property.seller.name,
      phone: property.seller.phone || '',
      memberSince: property.seller.createdAt.getFullYear().toString(),
      avatar: property.seller.image || '/images/agent_avatar.jpg',
    },
    postedDate: property.createdAt.toISOString().split('T')[0],
    status: mapStatus(property.status),
    city: property.city,
    views: property.views,
    leads: property._count.leads,
  };
}

export const toApiProperty = mapPropertyToFrontend;
export const toApiPropertyList = (properties: ApiProperty[]) =>
  properties.map(mapPropertyToFrontend);

function mapPropertyType(type: string): 'Villa' | 'Apartment' | 'Loft' | 'Penthouse' | 'House' | 'Commercial' {
  switch (type) {
    case PropertyType.VILLA: return 'Villa';
    case PropertyType.FLAT: return 'Apartment';
    case PropertyType.PLOT: return 'House';
    case PropertyType.COMMERCIAL: return 'Commercial';
    default: return 'Villa';
  }
}

function mapFurnished(furnished: string | null | undefined): string {
  switch (furnished) {
    case Furnished.UNFURNISHED: return 'Unfurnished';
    case Furnished.SEMI: return 'Semi-Furnished';
    case Furnished.FULLY: return 'Fully Furnished';
    default: return 'Unfurnished';
  }
}

function mapStatus(status: string): 'Active' | 'Sold' | 'Rented' {
  switch (status) {
    case Status.ACTIVE: return 'Active';
    case Status.SOLD: return 'Sold';
    case Status.RENTED: return 'Rented';
    default: return 'Active';
  }
}