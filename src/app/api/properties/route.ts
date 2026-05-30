import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { db } from "@/lib/prisma";
import { propertySchema } from "@/lib/validations";
import { mapPropertyToFrontend } from "@/lib/property-mapper";

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    
    // Parse query parameters
    const city = searchParams.get("city") || undefined;
    const locality = searchParams.get("locality") || undefined;
    const type = searchParams.get("type") as 
      | "FLAT" | "VILLA" | "PLOT" | "COMMERCIAL" || undefined;
    const listingFor = searchParams.get("listingFor") as 
      | "SALE" | "RENT" || undefined;
    const minPrice = searchParams.get("minPrice") 
      ? parseFloat(searchParams.get("minPrice")!) 
      : undefined;
    const maxPrice = searchParams.get("maxPrice") 
      ? parseFloat(searchParams.get("maxPrice")!) 
      : undefined;
    const bhk = searchParams.get("bhk") 
      ? parseInt(searchParams.get("bhk")!) 
      : undefined;
    const furnished = searchParams.get("furnished") as 
      | "UNFURNISHED" | "SEMI" | "FULLY" || undefined;
    const status = searchParams.get("status") as 
      | "ACTIVE" | "SOLD" | "RENTED" || undefined;
    const sort = searchParams.get("sort") || "newest";
    const page = parseInt(searchParams.get("page") || "1");
    const limit = Math.min(parseInt(searchParams.get("limit") || "12"), 48);
    const search = searchParams.get("search") || undefined;

    // Build where clause
    const where: any = {
      status: status || "ACTIVE", // default to ACTIVE if not specified
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
    if (bhk !== undefined && bhk !== null) {
      where.bhk = bhk;
    }
    if (furnished) {
      where.furnished = furnished;
    }
    if (minPrice !== undefined || maxPrice !== undefined) {
      where.price = {};
      if (minPrice !== undefined) where.price.gte = minPrice;
      if (maxPrice !== undefined) where.price.lte = maxPrice;
    }
    if (search) {
      where.OR = [
        { title: { contains: search, mode: "insensitive" } },
        { city: { contains: search, mode: "insensitive" } },
        { locality: { contains: search, mode: "insensitive" } },
        { description: { contains: search, mode: "insensitive" } },
      ];
    }

    // Build orderBy clause
    let orderBy: any = { createdAt: "desc" };
    if (sort === "price_asc") orderBy = { price: "asc" };
    if (sort === "price_desc") orderBy = { price: "desc" };
    if (sort === "oldest") orderBy = { createdAt: "asc" };

    // Execute query with pagination
    const [properties, total] = await Promise.all([
      db.property.findMany({
        where,
        orderBy,
        skip: (page - 1) * limit,
        take: limit,
        include: {
          seller: {
            select: {
              id: true,
              name: true,
              phone: true,
              image: true,
              createdAt: true,
            },
          },
          _count: {
            select: { leads: true },
          },
        },
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

    const property = await db.property.create({
      data: {
        title: validated.title,
        description: validated.description,
        price: validated.price,
        type: validated.type,
        listingFor: validated.listingFor,
        bhk: validated.bhk ?? null,
        area: validated.area ?? null,
        city: validated.city,
        locality: validated.locality,
        images: validated.images ?? [],
        furnished: validated.furnished ?? null,
        floor: validated.floor ?? null,
        sellerId: session.user.id,
        status: "ACTIVE",
      },
      include: {
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
      },
    });

    return NextResponse.json(mapPropertyToFrontend(property), { status: 201 });
  } catch (error: any) {
    if (error.name === "ZodError") {
      return NextResponse.json(
        { error: "Invalid input data", details: error.errors },
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
