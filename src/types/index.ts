import type {
  Furnished,
  ListingFor,
  Prisma,
  PropertyType,
  Role,
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
  role: Role;
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
