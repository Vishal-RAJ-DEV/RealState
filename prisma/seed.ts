import bcrypt from "bcryptjs";
import {
  Furnished,
  ListingFor,
  PropertyType,
  Role,
  Status,
} from "@prisma/client";

import { db } from "@/lib/prisma";

export async function main() {
  try {
    const passwordHash = await bcrypt.hash("Password@123", 10);

    const buyer = await db.user.upsert({
      where: { email: "buyer@propfinder.in" },
      update: {},
      create: {
        name: "Test Buyer",
        email: "buyer@propfinder.in",
        password: passwordHash,
        phone: "9876543210",
        role: Role.BUYER,
      },
    });

    const seller = await db.user.upsert({
      where: { email: "seller@propfinder.in" },
      update: {},
      create: {
        name: "Test Seller",
        email: "seller@propfinder.in",
        password: passwordHash,
        phone: "9876543211",
        role: Role.SELLER,
      },
    });

    const sampleProperties = [
      {
        title: "Modern 2 BHK in Whitefield",
        description: "Bright apartment close to tech parks and metro access.",
        price: 4500000,
        type: PropertyType.FLAT,
        listingFor: ListingFor.SALE,
        bhk: 2,
        area: 1180,
        city: "Bengaluru",
        locality: "Whitefield",
        address: "Whitefield Main Road",
        images: ["https://images.unsplash.com/photo-1568605114967-8130f3a36994"],
        furnished: Furnished.SEMI,
        floor: 5,
        totalFloors: 12,
        facing: "East",
        age: 4,
        status: Status.ACTIVE,
      },
      {
        title: "Luxury Villa in Gurgaon",
        description: "Spacious villa in a gated community with landscaped lawns.",
        price: 22000000,
        type: PropertyType.VILLA,
        listingFor: ListingFor.SALE,
        bhk: 4,
        area: 3200,
        city: "Gurugram",
        locality: "Golf Course Extension",
        address: "Sector 65",
        images: ["https://images.unsplash.com/photo-1600607687939-ce8a6c25118c"],
        furnished: Furnished.FULLY,
        floor: 2,
        totalFloors: 2,
        facing: "North",
        age: 2,
        status: Status.ACTIVE,
      },
      {
        title: "Affordable Plot in Jaipur",
        description: "Residential plot ideal for a custom home build.",
        price: 1800000,
        type: PropertyType.PLOT,
        listingFor: ListingFor.SALE,
        bhk: null,
        area: 1500,
        city: "Jaipur",
        locality: "Ajmer Road",
        address: "Near Ring Road",
        images: ["https://images.unsplash.com/photo-1505693416388-ac5ce068fe85"],
        furnished: null,
        floor: null,
        totalFloors: null,
        facing: "West",
        age: null,
        status: Status.ACTIVE,
      },
      {
        title: "Commercial Space in Navi Mumbai",
        description: "Well-connected office unit suitable for startups or clinics.",
        price: 95000,
        type: PropertyType.COMMERCIAL,
        listingFor: ListingFor.RENT,
        bhk: null,
        area: 980,
        city: "Mumbai",
        locality: "Nerul",
        address: "Palm Beach Road",
        images: ["https://images.unsplash.com/photo-1494526585095-c41746248156"],
        furnished: Furnished.SEMI,
        floor: 8,
        totalFloors: 14,
        facing: "South",
        age: 6,
        status: Status.ACTIVE,
      },
      {
        title: "3 BHK Rental in Hyderabad",
        description: "Family-friendly apartment with clubhouse and parking.",
        price: 42000,
        type: PropertyType.FLAT,
        listingFor: ListingFor.RENT,
        bhk: 3,
        area: 1650,
        city: "Hyderabad",
        locality: "Gachibowli",
        address: "Financial District",
        images: ["https://images.unsplash.com/photo-1484154218962-a197022b5858"],
        furnished: Furnished.FULLY,
        floor: 11,
        totalFloors: 20,
        facing: "East",
        age: 3,
        status: Status.ACTIVE,
      },
    ];

    await db.property.deleteMany({
      where: { sellerId: seller.id },
    });

    for (const property of sampleProperties) {
      await db.property.create({
        data: {
          ...property,
          sellerId: seller.id,
        },
      });
    }

    return {
      buyerId: buyer.id,
      sellerId: seller.id,
      seeded: sampleProperties.length,
    };
  } catch (error) {
    console.error("Failed to seed database:", error);
    throw error;
  } finally {
    await db.$disconnect();
  }
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
