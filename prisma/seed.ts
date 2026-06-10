import bcrypt from "bcryptjs";
import { config } from "dotenv";
import {
  Furnished,
  ListingFor,
  PropertyType,
  Status,
} from "@prisma/client";
import { PrismaPg } from "@prisma/adapter-pg";
import { PrismaClient } from "@prisma/client";

// Load environment variables
config({ path: ".env.local" });

const connectionString = process.env.DIRECT_URL ?? "";
const adapter = new PrismaPg({ connectionString });
const db = new PrismaClient({ adapter });

export async function main() {
  try {
    console.log("Seeding database...");

    // Clean existing data
    await db.lead.deleteMany();
    await db.property.deleteMany();
    await db.user.deleteMany();

    // Create test users
    const hashedPassword = await bcrypt.hash("password123", 12);

    const seller1 = await db.user.create({
      data: {
        name: "Sarah Mitchell",
        email: "seller1@propfinder.com",
        password: hashedPassword,
        phone: "+1 (310) 555-0123",
      },
    });

    const seller2 = await db.user.create({
      data: {
        name: "James Chen",
        email: "seller2@propfinder.com",
        password: hashedPassword,
        phone: "+1 (212) 555-0456",
      },
    });

    const seller3 = await db.user.create({
      data: {
        name: "Elena Rodriguez",
        email: "seller3@propfinder.com",
        password: hashedPassword,
        phone: "+1 (424) 555-0789",
      },
    });

    const seller4 = await db.user.create({
      data: {
        name: "Marcus Webb",
        email: "seller4@propfinder.com",
        password: hashedPassword,
        phone: "+1 (917) 555-0321",
      },
    });

    const seller5 = await db.user.create({
      data: {
        name: "Isabella Ferrari",
        email: "seller5@propfinder.com",
        password: hashedPassword,
        phone: "+39 0578 555 012",
      },
    });

    const seller6 = await db.user.create({
      data: {
        name: "David Park",
        email: "seller6@propfinder.com",
        password: hashedPassword,
        phone: "+1 (503) 555-0654",
      },
    });

    const seller7 = await db.user.create({
      data: {
        name: "Amanda Foster",
        email: "seller7@propfinder.com",
        password: hashedPassword,
        phone: "+1 (312) 555-0987",
      },
    });

    const seller8 = await db.user.create({
      data: {
        name: "Robert Sterling",
        email: "seller8@propfinder.com",
        password: hashedPassword,
        phone: "+1 (305) 555-0145",
      },
    });

    const seller9 = await db.user.create({
      data: {
        name: "Catherine Moore",
        email: "seller9@propfinder.com",
        password: hashedPassword,
        phone: "+1 (805) 555-0276",
      },
    });

    const seller10 = await db.user.create({
      data: {
        name: "Nordic Living Co.",
        email: "seller10@propfinder.com",
        password: hashedPassword,
        phone: "+1 (206) 555-0532",
      },
    });

    const seller11 = await db.user.create({
      data: {
        name: "Desert Homes LLC",
        email: "seller11@propfinder.com",
        password: hashedPassword,
        phone: "+1 (480) 555-0812",
      },
    });

    const seller12 = await db.user.create({
      data: {
        name: "Heritage Estates",
        email: "seller12@propfinder.com",
        password: hashedPassword,
        phone: "+1 (203) 555-0698",
      },
    });

    const buyer = await db.user.create({
      data: {
        name: "Test Buyer",
        email: "buyer@propfinder.com",
        password: hashedPassword,
        phone: "+1 (206) 555-0532",
      },
    });

    // Map mock data to Prisma schema
    const propertiesData = [
      {
        title: "Modern Tropical Villa with Infinity Pool",
        description: "Experience luxury living in this stunning modern villa featuring floor-to-ceiling glass windows, an infinity pool overlooking the city, and meticulously landscaped tropical gardens. The open-concept design seamlessly blends indoor and outdoor living with premium finishes throughout.",
        price: 4500000,
        type: PropertyType.VILLA,
        listingFor: ListingFor.SALE,
        bhk: 5,
        baths: 4,
        area: 3750,
        city: "Beverly Hills",
        locality: "California",
        address: "1271 Tower Grove Drive, Beverly Hills, CA 90210",
        images: ["/images/prop_1.jpg"],
        amenities: ["Swimming Pool", "Garden", "Security", "Parking", "Power Backup"],
        furnished: Furnished.SEMI,
        floor: 0, // Ground floor
        totalFloors: 1,
        facing: "South",
        age: 3,
        status: Status.ACTIVE,
        views: Math.floor(Math.random() * 500),
        sellerId: seller1.id,
      },
      {
        title: "Skyline Penthouse with Panoramic Views",
        description: "Perched high above the city, this exquisite penthouse offers breathtaking panoramic views of the Manhattan skyline. Features include marble floors, custom lighting, and world-class amenities. A rare opportunity to own a piece of the sky.",
        price: 8500000,
        type: PropertyType.VILLA, // Penthouse mapped to VILLA type
        listingFor: ListingFor.SALE,
        bhk: 4,
        baths: 4,
        area: 4050,
        city: "Manhattan",
        locality: "New York",
        address: "432 Park Avenue, Penthouse, New York, NY 10022",
        images: ["/images/prop_2.jpg"],
        amenities: ["Lift", "Gym", "Security", "Parking", "Swimming Pool"],
        furnished: Furnished.FULLY,
        floor: 85,
        totalFloors: 90,
        facing: "East",
        age: 2,
        status: Status.ACTIVE,
        views: Math.floor(Math.random() * 500),
        sellerId: seller2.id,
      },
      {
        title: "Beachfront Paradise Villa",
        description: "A masterpiece of coastal architecture, this beachfront villa offers direct ocean access, a private deck, and seamless indoor-outdoor living. Every room captures the stunning Pacific views.",
        price: 12000000,
        type: PropertyType.VILLA,
        listingFor: ListingFor.SALE,
        bhk: 6,
        baths: 5,
        area: 8000,
        city: "Malibu",
        locality: "California",
        address: "28080 Pacific Coast Highway, Malibu, CA 90265",
        images: ["/images/prop_3.jpg"],
        amenities: ["Swimming Pool", "Garden", "Security", "Parking", "Beach Access"],
        furnished: Furnished.FULLY,
        floor: 0, // Ground floor
        totalFloors: 1,
        facing: "West",
        age: 1,
        status: Status.ACTIVE,
        views: Math.floor(Math.random() * 500),
        sellerId: seller3.id,
      },
      {
        title: "Industrial-Chic Downtown Loft",
        description: "This stunning loft conversion preserves the building's industrial heritage with exposed brick walls, steel beams, and massive arched windows. A perfect canvas for creative urban living.",
        price: 3200000,
        type: PropertyType.FLAT, // Loft mapped to FLAT
        listingFor: ListingFor.SALE,
        bhk: 2,
        baths: 2,
        area: 3600,
        city: "New York",
        locality: "SoHo",
        address: "118 Greene Street, Loft 4B, New York, NY 10012",
        images: ["/images/prop_4.jpg"],
        amenities: ["Lift", "Security", "Parking", "Gym"],
        furnished: Furnished.UNFURNISHED,
        floor: 4,
        totalFloors: 10,
        facing: "North",
        age: 5,
        status: Status.ACTIVE,
        views: Math.floor(Math.random() * 500),
        sellerId: seller4.id,
      },
      {
        title: "Mediterranean Hillside Estate",
        description: "A breathtaking Mediterranean estate perched on a sun-drenched hillside. Features include an infinity pool, olive groves, and panoramic valley views. Authentic stone construction meets modern luxury.",
        price: 2800000,
        type: PropertyType.VILLA,
        listingFor: ListingFor.SALE,
        bhk: 7,
        baths: 5,
        area: 4500,
        city: "Montepulciano",
        locality: "Tuscany, Italy",
        address: "Via delle Vigne 45, 53045 Montepulciano SI",
        images: ["/images/prop_5.jpg"],
        amenities: ["Swimming Pool", "Garden", "Security", "Parking", "Wine Cellar"],
        furnished: Furnished.SEMI,
        floor: 0, // Multi-level
        totalFloors: 2,
        facing: "South",
        age: 0, // Renovated
        status: Status.ACTIVE,
        views: Math.floor(Math.random() * 500),
        sellerId: seller5.id,
      },
      {
        title: "Glass House in the Forest",
        description: "An architectural marvel nestled among towering pines. This glass-walled sanctuary features cantilevered design, reflecting pools, and seamless integration with the surrounding forest.",
        price: 3800000,
        type: PropertyType.FLAT, // Mapped to FLAT as it's a residential house
        listingFor: ListingFor.SALE,
        bhk: 4,
        baths: 3,
        area: 4000,
        city: "Portland",
        locality: "Oregon",
        address: "4241 SW View Point Terrace, Portland, OR 97239",
        images: ["/images/prop_6.jpg"],
        amenities: ["Garden", "Security", "Parking", "Power Backup"],
        furnished: Furnished.UNFURNISHED,
        floor: 0, // Multi-level
        totalFloors: 2,
        facing: "East",
        age: 1,
        status: Status.ACTIVE,
        views: Math.floor(Math.random() * 500),
        sellerId: seller6.id,
      },
      {
        title: "Luxury Downtown Tower Apartment",
        description: "Experience elevated urban living in this luxury high-rise apartment. Floor-to-ceiling windows offer stunning city views, while premium finishes and amenities ensure comfort and style.",
        price: 1850000,
        type: PropertyType.FLAT,
        listingFor: ListingFor.RENT,
        bhk: 3,
        baths: 2,
        area: 2500,
        city: "Chicago",
        locality: "Illinois",
        address: "363 W Erie Street, Unit 4502, Chicago, IL 60654",
        images: ["/images/prop_7.jpg"],
        amenities: ["Lift", "Gym", "Security", "Parking", "Swimming Pool", "Concierge"],
        furnished: Furnished.FULLY,
        floor: 45,
        totalFloors: 50,
        facing: "South",
        age: 0, // New
        status: Status.ACTIVE,
        views: Math.floor(Math.random() * 500),
        sellerId: seller7.id,
      },
      {
        title: "Waterfront Mansion with Private Dock",
        description: "The epitome of waterfront luxury, this estate features a private dock, classical modern architecture, and pristine manicured grounds leading to the calm waters of Biscayne Bay.",
        price: 15000000,
        type: PropertyType.VILLA,
        listingFor: ListingFor.SALE,
        bhk: 8,
        baths: 7,
        area: 8000,
        city: "Miami Beach",
        locality: "Florida",
        address: "46 Star Island Drive, Miami Beach, FL 33139",
        images: ["/images/prop_8.jpg"],
        amenities: ["Swimming Pool", "Garden", "Security", "Parking", "Private Dock", "Home Theater"],
        furnished: Furnished.FULLY,
        floor: 0, // Multi-level
        totalFloors: 2,
        facing: "East",
        age: 2,
        status: Status.ACTIVE,
        views: Math.floor(Math.random() * 500),
        sellerId: seller8.id,
      },
      {
        title: "Spanish Colonial Revival Villa",
        description: "A stunning Spanish Colonial Revival estate featuring warm interior lighting, lush tropical landscaping, a resort-style pool, and outdoor dining areas perfect for entertaining.",
        price: 9500000,
        type: PropertyType.VILLA,
        listingFor: ListingFor.SALE,
        bhk: 5,
        baths: 4,
        area: 8000,
        city: "Santa Barbara",
        locality: "California",
        address: "1801 East Mountain Drive, Montecito, CA 93108",
        images: ["/images/prop_9.jpg"],
        amenities: ["Swimming Pool", "Garden", "Security", "Parking", "Outdoor Kitchen"],
        furnished: Furnished.SEMI,
        floor: 0, // Multi-level
        totalFloors: 2,
        facing: "South",
        age: 0, // Renovated
        status: Status.ACTIVE,
        views: Math.floor(Math.random() * 500),
        sellerId: seller9.id,
      },
      {
        title: "Scandinavian Urban Retreat",
        description: "A serene Scandinavian-inspired apartment featuring light wood floors, neutral tones, indoor plants, and cozy fireplace. Floor-to-ceiling windows frame the stunning Puget Sound views.",
        price: 1250000,
        type: PropertyType.FLAT,
        listingFor: ListingFor.RENT,
        bhk: 2,
        baths: 2,
        area: 2000,
        city: "Seattle",
        locality: "Washington",
        address: "99 Union Street, Unit 2801, Seattle, WA 98101",
        images: ["/images/prop_10.jpg"],
        amenities: ["Lift", "Gym", "Security", "Parking", "Fireplace"],
        furnished: Furnished.FULLY,
        floor: 28,
        totalFloors: 30,
        facing: "West",
        age: 0, // New
        status: Status.ACTIVE,
        views: Math.floor(Math.random() * 500),
        sellerId: seller10.id,
      },
      {
        title: "Desert Oasis Modern Retreat",
        description: "A modern desert sanctuary featuring clean lines, warm earth tones, a stunning pool, and native cactus gardens. Sustainable luxury design with breathtaking mountain views.",
        price: 4200000,
        type: PropertyType.VILLA, // Mapped to VILLA as it's a desert sanctuary
        listingFor: ListingFor.SALE,
        bhk: 4,
        baths: 4,
        area: 4000,
        city: "Scottsdale",
        locality: "Arizona",
        address: "10500 E Lost Canyon Drive, Scottsdale, AZ 85255",
        images: ["/images/prop_11.jpg"],
        amenities: ["Swimming Pool", "Garden", "Security", "Parking", "Solar Power"],
        furnished: Furnished.SEMI,
        floor: 0, // Single
        totalFloors: 1,
        facing: "South",
        age: 2,
        status: Status.ACTIVE,
        views: Math.floor(Math.random() * 500),
        sellerId: seller11.id,
      },
      {
        title: "Grand Colonial Estate",
        description: "A magnificent Colonial Revival estate on meticulously manicured grounds. Features include a wraparound porch, mature oak trees, white columns, and elegant symmetrical facade.",
        price: 6500000,
        type: PropertyType.VILLA, // Mapped to VILLA as it's a colonial estate
        listingFor: ListingFor.SALE,
        bhk: 8,
        baths: 6,
        area: 7000,
        city: "Greenwich",
        locality: "Connecticut",
        address: "123 North Street, Greenwich, CT 06830",
        images: ["/images/prop_12.jpg"],
        amenities: ["Garden", "Security", "Parking", "Tennis Court", "Guest House"],
        furnished: Furnished.UNFURNISHED,
        floor: 0, // Multi-level
        totalFloors: 2,
        facing: "South",
        age: 0, // Restored
        status: Status.ACTIVE,
        views: Math.floor(Math.random() * 500),
        sellerId: seller12.id,
      },
    ];

    // Create properties and capture their IDs
    const createdProperties = [];
    for (const propertyData of propertiesData) {
      const property = await db.property.create({
        data: propertyData,
      });
      createdProperties.push(property);
    }

    // Create sample leads using actual property IDs
    await db.lead.create({
      data: {
        propertyId: createdProperties[0].id, // First property
        buyerId: buyer.id,
        name: "Test Buyer",
        phone: "+1 (206) 555-0532",
        email: "buyer@propfinder.com",
        message: "I'm interested in this property. Can we schedule a visit?",
      },
    });

    await db.lead.create({
      data: {
        propertyId: createdProperties[1].id, // Second property
        buyerId: buyer.id,
        name: "Test Buyer",
        phone: "+1 (206) 555-0532",
        email: "buyer@propfinder.com",
        message: "The penthouse looks amazing! What's the HOA fee?",
      },
    });

    console.log("Database seeded successfully!");
    console.log(`Created ${propertiesData.length} properties`);
    console.log("Test accounts:");
    console.log("  Seller 1: seller1@propfinder.com / password123");
    console.log("  Seller 2: seller2@propfinder.com / password123");
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