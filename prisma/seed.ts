import bcrypt from "bcryptjs";
import { config } from "dotenv";
import {
  Furnished,
  ListingFor,
  PropertyType,
  Status,
  PlotType,
  SharingType,
  GenderPreference,
} from "@prisma/client";
import { PrismaPg } from "@prisma/adapter-pg";
import { PrismaClient } from "@prisma/client";

config({ path: ".env.local" });

const connectionString = process.env.DIRECT_URL ?? "";
const adapter = new PrismaPg({ connectionString });
const db = new PrismaClient({ adapter });

export async function main() {
  try {
    console.log("Seeding database...");

    await db.lead.deleteMany();
    await db.savedProperty.deleteMany();
    await db.pGDetails.deleteMany();
    await db.flatDetails.deleteMany();
    await db.plotDetails.deleteMany();
    await db.property.deleteMany();
    await db.user.deleteMany();

    const hashedPassword = await bcrypt.hash("password123", 12);

    const seller1 = await db.user.create({
      data: {
        name: "Rajesh Kumar",
        email: "seller1@propfinder.com",
        password: hashedPassword,
        phone: "+91 98765 43210",
      },
    });

    const seller2 = await db.user.create({
      data: {
        name: "Priya Sharma",
        email: "seller2@propfinder.com",
        password: hashedPassword,
        phone: "+91 98765 43211",
      },
    });

    const seller3 = await db.user.create({
      data: {
        name: "Amit Patel",
        email: "seller3@propfinder.com",
        password: hashedPassword,
        phone: "+91 98765 43212",
      },
    });

    const buyer = await db.user.create({
      data: {
        name: "Test Buyer",
        email: "buyer@propfinder.com",
        password: hashedPassword,
        phone: "+91 98765 43213",
      },
    });

    // Create Plot
    const plot = await db.property.create({
      data: {
        title: "Residential Plot in Sector 150",
        description: "Prime residential plot in a developing area with all basic amenities nearby. Good connectivity to metro and highway.",
        type: PropertyType.PLOT,
        listingFor: ListingFor.SALE,
        price: 4500000,
        city: "Noida",
        locality: "Sector 150",
        address: "Plot No. 42, Sector 150, Noida, UP 201301",
        images: ["/images/prop_1.jpg"],
        amenities: ["Boundary Wall", "Water", "Electricity", "Road Access"],
        status: Status.ACTIVE,
        views: Math.floor(Math.random() * 500),
        sellerId: seller1.id,
        plotDetails: {
          create: {
            plotType: PlotType.RESIDENTIAL,
            area: 200,
            areaUnit: "SQ_YARD",
            facing: "North",
            roadWidth: 12,
            nearPlaces: ["Metro Station - 1.2 km", "School - 500 m", "Hospital - 2 km"],
            boundaryWall: false,
            waterAvailable: true,
            electricityAvailable: true,
          },
        },
      },
      include: { plotDetails: true },
    });

    // Create Flat for Sale
    const flatSale = await db.property.create({
      data: {
        title: "3 BHK Flat in Sector 62",
        description: "Spacious 3 BHK flat with modern amenities. Ready to move in. Close to metro and market.",
        type: PropertyType.FLAT,
        listingFor: ListingFor.SALE,
        price: 7500000,
        city: "Noida",
        locality: "Sector 62",
        address: "Flat No. 501, Tower B, Sector 62, Noida, UP 201301",
        images: ["/images/prop_2.jpg"],
        amenities: ["Parking", "Lift", "Security", "Gym", "Swimming Pool"],
        status: Status.ACTIVE,
        views: Math.floor(Math.random() * 500),
        sellerId: seller1.id,
        flatDetails: {
          create: {
            bedrooms: 3,
            bathrooms: 2,
            carpetArea: 1400,
            builtUpArea: 1600,
            areaUnit: "SQ_FT",
            floor: 5,
            totalFloors: 15,
            furnished: Furnished.SEMI,
            facing: "South",
            age: 2,
            balconies: 2,
            parking: true,
          },
        },
      },
      include: { flatDetails: true },
    });

    // Create Flat for Rent
    const flatRent = await db.property.create({
      data: {
        title: "2 BHK Fully Furnished Flat",
        description: "Beautifully furnished 2 BHK apartment with all modern appliances. Perfect for working professionals.",
        type: PropertyType.FLAT,
        listingFor: ListingFor.RENT,
        price: 35000,
        city: "Noida",
        locality: "Sector 137",
        address: "Flat No. 302, Tower A, Sector 137, Noida, UP 201301",
        images: ["/images/prop_3.jpg"],
        amenities: ["Parking", "Lift", "Security", "Power Backup", "CCTV"],
        status: Status.ACTIVE,
        views: Math.floor(Math.random() * 500),
        sellerId: seller2.id,
        flatDetails: {
          create: {
            bedrooms: 2,
            bathrooms: 2,
            carpetArea: 950,
            builtUpArea: 1100,
            areaUnit: "SQ_FT",
            floor: 8,
            totalFloors: 20,
            furnished: Furnished.FULLY,
            facing: "East",
            age: 1,
            balconies: 1,
            parking: true,
          },
        },
      },
      include: { flatDetails: true },
    });

    // Create PG Room
    const pgRoom = await db.property.create({
      data: {
        title: "PG for Boys near Sector 62",
        description: "Well-maintained PG accommodation with all modern facilities. Homely food and 24/7 water supply.",
        type: PropertyType.PG_ROOM,
        listingFor: ListingFor.RENT,
        price: 9000,
        city: "Noida",
        locality: "Sector 62",
        address: "H.No. 15, Block C, Sector 62, Noida, UP 201301",
        images: ["/images/prop_4.jpg"],
        amenities: ["WiFi", "AC", "Food", "Washing Machine", "Security", "CCTV"],
        status: Status.ACTIVE,
        views: Math.floor(Math.random() * 500),
        sellerId: seller3.id,
        pgDetails: {
          create: {
            roomSize: 250,
            areaUnit: "SQ_FT",
            sharingType: SharingType.DOUBLE,
            totalBeds: 2,
            availableBeds: 1,
            genderPreference: GenderPreference.MALE,
            attachedBathroom: true,
            balcony: false,
            furnished: true,
            foodAvailable: true,
            foodType: "VEG_AND_NON_VEG",
            monthlyRent: 9000,
            securityDeposit: 9000,
            maintenanceCharge: 500,
          },
        },
      },
      include: { pgDetails: true },
    });

    await db.lead.create({
      data: {
        propertyId: plot.id,
        buyerId: buyer.id,
        name: "Test Buyer",
        phone: "+91 98765 43213",
        email: "buyer@propfinder.com",
        message: "Is this plot still available? Can we schedule a visit?",
      },
    });

    await db.lead.create({
      data: {
        propertyId: flatSale.id,
        buyerId: buyer.id,
        name: "Test Buyer",
        phone: "+91 98765 43213",
        email: "buyer@propfinder.com",
        message: " interested in this flat. What's the maintenance charge?",
      },
    });

    console.log("Database seeded successfully!");
    console.log("Created: 1 Plot, 2 Flats (1 Sale, 1 Rent), 1 PG Room");
    console.log("Test accounts:");
    console.log("  Seller 1: seller1@propfinder.com / password123");
    console.log("  Seller 2: seller2@propfinder.com / password123");
    console.log("  Seller 3: seller3@propfinder.com / password123");
    console.log("  Buyer:    buyer@propfinder.com / password123");
  } catch (error) {
    console.error("Error seeding database:", error);
    throw error;
  } finally {
    await db.$disconnect();
  }
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
