import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { db } from "@/lib/prisma";
import { propertySchema } from "@/lib/validations";
import { mapPropertyToFrontend } from "@/lib/property-mapper";

const propertyInclude = {
  seller: {
    select: {
      id: true,
      name: true,
      phone: true,
      image: true,
      createdAt: true,
    },
  },
  _count: { select: { leads: true } },
  plotDetails: true,
  flatDetails: true,
  pgDetails: true,
};

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);

    const city = searchParams.get("city") || undefined;
    const locality = searchParams.get("locality") || undefined;
    const type = searchParams.get("type") as
      | "FLAT" | "PLOT" | "PG_ROOM" || undefined;
    const listingFor = searchParams.get("listingFor") as
      | "SALE" | "RENT" || undefined;
    const minPrice = searchParams.get("minPrice")
      ? parseFloat(searchParams.get("minPrice")!)
      : undefined;
    const maxPrice = searchParams.get("maxPrice")
      ? parseFloat(searchParams.get("maxPrice")!)
      : undefined;
    const furnished = searchParams.get("furnished") as
      | "UNFURNISHED" | "SEMI" | "FULLY" || undefined;
    const status = searchParams.get("status") as
      | "ACTIVE" | "SOLD" | "RENTED" || undefined;
    const bhk = searchParams.get("bhk")
      ? parseInt(searchParams.get("bhk")!)
      : undefined;
    const plotType = searchParams.get("plotType") as
      | "RESIDENTIAL" | "COMMERCIAL" | "AGRICULTURAL" | "INDUSTRIAL" || undefined;
    const sharingType = searchParams.get("sharingType") as
      | "SINGLE" | "DOUBLE" | "TRIPLE" | "FOUR" | "FIVE_PLUS" || undefined;
    const genderPreference = searchParams.get("genderPreference") as
      | "MALE" | "FEMALE" | "ANY" || undefined;
    const sort = searchParams.get("sort") || "newest";
    const page = parseInt(searchParams.get("page") || "1");
    const limit = Math.min(parseInt(searchParams.get("limit") || "12"), 48);
    const search = searchParams.get("search") || undefined;

    const where: any = {
      status: status || "ACTIVE",
    };

    if (city) {
      where.city = { contains: city, mode: "insensitive" };
    }
    if (locality) {
      where.locality = { contains: locality, mode: "insensitive" };
    }
    if (type) {
      where.type = type;
    }
    if (listingFor) {
      where.listingFor = listingFor;
    }
    if (furnished) {
      where.flatDetails = { furnished };
    }
    if (minPrice !== undefined || maxPrice !== undefined) {
      where.price = {};
      if (minPrice !== undefined) where.price.gte = minPrice;
      if (maxPrice !== undefined) where.price.lte = maxPrice;
    }
    if (bhk !== undefined && bhk !== null) {
      where.flatDetails = { ...where.flatDetails, bedrooms: bhk };
    }
    if (plotType) {
      where.plotDetails = { plotType };
    }
    if (sharingType) {
      where.pgDetails = { sharingType };
    }
    if (genderPreference) {
      where.pgDetails = { ...where.pgDetails, genderPreference };
    }
    if (search) {
      where.OR = [
        { title: { contains: search, mode: "insensitive" } },
        { city: { contains: search, mode: "insensitive" } },
        { locality: { contains: search, mode: "insensitive" } },
        { description: { contains: search, mode: "insensitive" } },
      ];
    }

    let orderBy: any = { createdAt: "desc" };
    if (sort === "price_asc") orderBy = { price: "asc" };
    if (sort === "price_desc") orderBy = { price: "desc" };
    if (sort === "oldest") orderBy = { createdAt: "asc" };

    const [properties, total] = await Promise.all([
      db.property.findMany({
        where,
        orderBy,
        skip: (page - 1) * limit,
        take: limit,
        include: propertyInclude,
      }),
      db.property.count({ where }),
    ]);

    // Fire and forget view count increment
    db.property.updateMany({
      where: { id: { in: properties.map(p => p.id) } },
      data: { views: { increment: 1 } },
    }).catch(console.error);

    return NextResponse.json({
      properties: properties.map(mapPropertyToFrontend),
      pagination: {
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit),
        hasMore: page * limit < total,
      },
    });
  } catch (error: any) {
    console.error("Error fetching properties:", error);
    return NextResponse.json(
      {
        error: "Failed to load properties.",
        details: error.message || "Unknown error",
      },
      { status: 500 },
    );
  }
}

export async function POST(request: Request) {
  try {
    const session = await auth();
    if (!session?.user) {
      return NextResponse.json(
        { error: "Authentication required" },
        { status: 401 }
      );
    }

    const json = await request.json();
    const validated = propertySchema.parse(json);

    if (validated.type === "PG_ROOM") {
      validated.price = validated.details.monthlyRent;
    }

    const property = await db.$transaction(async (tx) => {
      const created = await tx.property.create({
        data: {
          title: validated.title,
          description: validated.description,
          type: validated.type,
          listingFor: validated.listingFor,
          price: validated.price,
          city: validated.city,
          locality: validated.locality,
          address: validated.address ?? null,
          latitude: validated.latitude ?? null,
          longitude: validated.longitude ?? null,
          images: validated.images ?? [],
          amenities: validated.amenities ?? [],
          sellerId: session.user.id,
          status: "ACTIVE",
        },
      });

      if (validated.type === "PLOT") {
        await tx.plotDetails.create({
          data: {
            propertyId: created.id,
            plotType: validated.details.plotType,
            area: validated.details.area,
            areaUnit: validated.details.areaUnit,
            length: validated.details.length ?? null,
            width: validated.details.width ?? null,
            facing: validated.details.facing ?? null,
            roadWidth: validated.details.roadWidth ?? null,
            nearPlaces: validated.details.nearPlaces ?? [],
            boundaryWall: validated.details.boundaryWall ?? false,
            waterAvailable: validated.details.waterAvailable ?? false,
            electricityAvailable: validated.details.electricityAvailable ?? false,
          },
        });
      } else if (validated.type === "FLAT") {
        await tx.flatDetails.create({
          data: {
            propertyId: created.id,
            bedrooms: validated.details.bedrooms,
            bathrooms: validated.details.bathrooms,
            carpetArea: validated.details.carpetArea ?? null,
            builtUpArea: validated.details.builtUpArea ?? null,
            areaUnit: validated.details.areaUnit ?? null,
            floor: validated.details.floor ?? null,
            totalFloors: validated.details.totalFloors ?? null,
            furnished: validated.details.furnished ?? null,
            facing: validated.details.facing ?? null,
            age: validated.details.age ?? null,
            balconies: validated.details.balconies ?? null,
            parking: validated.details.parking ?? false,
            roomSize: validated.details.roomSize ?? null,
          },
        });
      } else if (validated.type === "PG_ROOM") {
        await tx.pGDetails.create({
          data: {
            propertyId: created.id,
            roomSize: validated.details.roomSize ?? null,
            areaUnit: validated.details.areaUnit ?? null,
            sharingType: validated.details.sharingType,
            totalBeds: validated.details.totalBeds ?? null,
            availableBeds: validated.details.availableBeds ?? null,
            genderPreference: validated.details.genderPreference,
            attachedBathroom: validated.details.attachedBathroom ?? false,
            balcony: validated.details.balcony ?? false,
            furnished: validated.details.furnished ?? false,
            foodAvailable: validated.details.foodAvailable ?? false,
            foodType: validated.details.foodType ?? null,
            monthlyRent: validated.details.monthlyRent,
            securityDeposit: validated.details.securityDeposit ?? null,
            maintenanceCharge: validated.details.maintenanceCharge ?? null,
          },
        });
      }

      return tx.property.findUnique({
        where: { id: created.id },
        include: propertyInclude,
      });
    });

    return NextResponse.json(mapPropertyToFrontend(property!), { status: 201 });
  } catch (error: any) {
    if (error.name === "ZodError") {
      return NextResponse.json(
        { error: "Invalid input data", details: error.flatten().fieldErrors },
        { status: 400 }
      );
    }
    console.error("Error creating property:", error);
    return NextResponse.json(
      {
        error: "Failed to create property.",
        details: error.message || "Unknown error",
      },
      { status: 500 },
    );
  }
}
