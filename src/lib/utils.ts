import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function formatPrice(amount: number) {
  if (amount >= 10000000) {
    const crores = amount / 10000000;
    return `₹${Number.isInteger(crores) ? crores : crores.toFixed(1)} Cr`;
  }

  if (amount >= 100000) {
    const lakhs = amount / 100000;
    const value = Number.isInteger(lakhs) ? lakhs.toString() : lakhs.toFixed(1);
    return `₹${value} Lakh${lakhs >= 2 ? "s" : ""}`;
  }

  return new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    maximumFractionDigits: 0,
  }).format(amount);
}
