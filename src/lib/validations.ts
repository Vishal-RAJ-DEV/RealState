import { z } from "zod";

const roleEnum = z.enum(["BUYER", "SELLER"]);
const propertyTypeEnum = z.enum(["FLAT", "VILLA", "PLOT", "COMMERCIAL"]);
const listingForEnum = z.enum(["SALE", "RENT"]);
const furnishedEnum = z.enum(["UNFURNISHED", "SEMI", "FULLY"]);

export const registerSchema = z.object({
  name: z.string().min(2, "Name must be at least 2 characters."),
  email: z.email("Please enter a valid email address."),
  password: z.string().min(8, "Password must be at least 8 characters."),
  phone: z
    .string()
    .regex(/^[6-9]\d{9}$/, "Please enter a valid 10 digit Indian mobile number.")
    .optional()
    .or(z.literal("")),
  role: roleEnum,
});

export const loginSchema = z.object({
  email: z.email("Please enter a valid email address."),
  password: z.string().min(8, "Password must be at least 8 characters."),
});

export const propertySchema = z.object({
  title: z.string().min(2, "Title is required."),
  description: z.string().min(10, "Description is required."),
  price: z.number().positive("Price must be a positive number."),
  type: propertyTypeEnum,
  listingFor: listingForEnum,
  bhk: z.number().int().positive().optional(),
  area: z.number().int().positive().optional(),
  city: z.string().min(2, "City is required."),
  locality: z.string().min(2, "Locality is required."),
  furnished: furnishedEnum.optional(),
  floor: z.number().int().nonnegative().optional(),
  images: z.array(z.string()).default([]),
});

export const leadSchema = z.object({
  name: z.string().min(2, "Name is required."),
  phone: z.string().regex(/^[6-9]\d{9}$/, "Please enter a valid Indian mobile number."),
  email: z.email("Please enter a valid email address."),
  message: z.string().optional(),
});
