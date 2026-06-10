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

export const propertySchema = z.object({
  title: z.string().min(5, "Title must be at least 5 characters"),
  description: z.string().min(10, "Description required"),
  price: z.number().positive("Price must be positive"),
  type: z.enum(["FLAT", "VILLA", "PLOT", "COMMERCIAL"]),
  listingFor: z.enum(["SALE", "RENT"]),
  bhk: z.number().optional(),
  baths: z.number().optional(),
  area: z.number().optional(),
  city: z.string().min(1, "City is required"),
  locality: z.string().min(1, "Locality is required"),
  address: z.string().optional(),
  totalFloors: z.number().optional(),
  facing: z.string().optional(),
  age: z.number().optional(),
  furnished: z.enum(["UNFURNISHED", "SEMI", "FULLY"]).optional(),
  floor: z.number().optional(),
  images: z.array(z.string()).default([]),
  amenities: z.array(z.string()).default([]),
  status: z.enum(["ACTIVE", "SOLD", "RENTED"]).optional(),
});

export const leadSchema = z.object({
  name: z.string().min(1, "Name is required"),
  phone: z.string().min(10, "Valid phone number required"),
  email: z.string().email("Invalid email"),
  message: z.string().optional(),
});
