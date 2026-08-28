import { z } from "zod";

export const registerSchema = z.object({
  name: z.string().min(2, "Name must be at least 2 characters"),
  email: z.string().email("Invalid email address"),
  phone: z.string().optional(),
  password: z.string().min(6, "Password must be at least 6 characters"),
});

export const loginSchema = z.object({
  email: z.string().email("Invalid email address"),
  password: z.string().min(1, "Password is required"),
});

const basePropertySchema = z.object({
  title: z.string().min(5, "Title must be at least 5 characters"),
  description: z.string().min(10, "Description required"),
  price: z.number().positive("Price must be positive"),
  city: z.string().min(1, "City is required"),
  locality: z.string().min(1, "Locality is required"),
  address: z.string().optional(),
  latitude: z.number().optional(),
  longitude: z.number().optional(),
  images: z.array(z.string()).default([]),
  amenities: z.array(z.string()).default([]),
  status: z.enum(["ACTIVE", "SOLD", "RENTED"]).optional(),
});

const plotDetailsSchema = z.object({
  plotType: z.enum(["RESIDENTIAL", "COMMERCIAL", "AGRICULTURAL", "INDUSTRIAL"]),
  area: z.number().positive("Area must be positive"),
  areaUnit: z.string().min(1, "Area unit is required"),
  length: z.number().positive().optional(),
  width: z.number().positive().optional(),
  facing: z.string().optional(),
  roadWidth: z.number().positive().optional(),
  nearPlaces: z.array(z.string()).default([]),
  boundaryWall: z.boolean().default(false),
  waterAvailable: z.boolean().default(false),
  electricityAvailable: z.boolean().default(false),
});

const flatDetailsSchema = z.object({
  bedrooms: z.number().int().min(1, "At least 1 bedroom required"),
  bathrooms: z.number().int().min(1, "At least 1 bathroom required"),
  carpetArea: z.number().positive().optional(),
  builtUpArea: z.number().positive().optional(),
  areaUnit: z.string().optional(),
  floor: z.number().int().min(0).optional(),
  totalFloors: z.number().int().min(1).optional(),
  furnished: z.enum(["UNFURNISHED", "SEMI", "FULLY"]).optional(),
  facing: z.string().optional(),
  age: z.number().int().min(0).optional(),
  balconies: z.number().int().min(0).optional(),
  parking: z.boolean().default(false),
  roomSize: z.any().optional(),
});

const pgDetailsSchema = z.object({
  roomSize: z.number().positive().optional(),
  areaUnit: z.string().optional(),
  sharingType: z.enum(["SINGLE", "DOUBLE", "TRIPLE", "FOUR", "FIVE_PLUS"]),
  totalBeds: z.number().int().positive().optional(),
  availableBeds: z.number().int().min(0).optional(),
  genderPreference: z.enum(["MALE", "FEMALE", "ANY"]),
  attachedBathroom: z.boolean().default(false),
  balcony: z.boolean().default(false),
  furnished: z.boolean().default(false),
  foodAvailable: z.boolean().default(false),
  foodType: z.string().optional(),
  monthlyRent: z.number().positive("Monthly rent must be positive"),
  securityDeposit: z.number().min(0).optional(),
  maintenanceCharge: z.number().min(0).optional(),
});

export const plotPropertySchema = basePropertySchema.extend({
  type: z.literal("PLOT"),
  listingFor: z.literal("SALE"),
  details: plotDetailsSchema,
});

export const flatPropertySchema = basePropertySchema.extend({
  type: z.literal("FLAT"),
  listingFor: z.enum(["SALE", "RENT"]),
  details: flatDetailsSchema,
});

export const pgPropertySchema = basePropertySchema.extend({
  type: z.literal("PG_ROOM"),
  listingFor: z.literal("RENT"),
  details: pgDetailsSchema,
});

export const propertySchema = z.discriminatedUnion("type", [
  plotPropertySchema,
  flatPropertySchema,
  pgPropertySchema,
]);

export type PropertySchemaInput = z.infer<typeof propertySchema>;
export type PlotDetailsInput = z.infer<typeof plotDetailsSchema>;
export type FlatDetailsInput = z.infer<typeof flatDetailsSchema>;
export type PGDetailsInput = z.infer<typeof pgDetailsSchema>;

export const leadSchema = z.object({
  name: z.string().min(1, "Name is required"),
  phone: z.string().min(10, "Valid phone number required"),
  email: z.string().email("Invalid email"),
  message: z.string().optional(),
});
