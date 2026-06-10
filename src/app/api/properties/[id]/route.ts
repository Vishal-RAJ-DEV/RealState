import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { db } from "@/lib/prisma";
import { propertySchema } from "@/lib/validations";
import { mapPropertyToFrontend } from "@/lib/property-mapper";

type PropertyRouteContext = {
  params: {
    id: string;
  };
};

export async function GET(
  _request: Request,
  { params }: PropertyRouteContext,
) {
  try {
    const property = await db.property.findUnique({
      where: { id: params.id },
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
    });

    if (!property) {
      return NextResponse.json(
        { error: "Property not found" },
        { status: 404 }
      );
    }

    // Fire and forget view count increment
    db.property.update({
      where: { id: params.id },
      data: { views: { increment: 1 } },
    }).catch(console.error);

    return NextResponse.json(mapPropertyToFrontend(property));
  } catch (error: any) {
    console.error("Error fetching property:", error);
    return NextResponse.json(
      {
        error: "Failed to load property.",
        details: error.message || "Unknown error",
      },
      { status: 500 },
    );
  }
}

export async function PATCH(
  request: Request,
  { params }: PropertyRouteContext,
) {
  try {
    const session = await auth();
    if (!session?.user) {
      return NextResponse.json(
        { error: "Authentication required" },
        { status: 401 }
      );
    }

    const property = await db.property.findUnique({
      where: { id: params.id },
    });

    if (!property) {
      return NextResponse.json(
        { error: "Property not found" },
        { status: 404 }
      );
    }

    if (property.sellerId !== session.user.id) {
      return NextResponse.json(
        { error: "Not authorized" },
        { status: 403 }
      );
    }

    const json = await request.json();
    const validated = propertySchema.partial().parse(json);

    // Build update data only from fields actually present in request body
    const allowedFields = [
      'title', 'description', 'price', 'type', 'listingFor',
      'bhk', 'baths', 'area', 'city', 'locality', 'address',
      'totalFloors', 'facing', 'age', 'furnished', 'floor',
      'status', 'images', 'amenities',
    ] as const;

    const updateData: Record<string, unknown> = {};
    for (const field of allowedFields) {
      if (field in json) {
        updateData[field] = (validated as any)[field] ?? null;
      }
    }

    const updatedProperty = await db.property.update({
      where: { id: params.id },
      data: updateData,
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

    return NextResponse.json(mapPropertyToFrontend(updatedProperty));
  } catch (error: any) {
    if (error.name === "ZodError") {
      return NextResponse.json(
        { error: "Invalid input data", details: error.errors },
        { status: 400 }
      );
    }
    console.error("Error updating property:", error);
    return NextResponse.json(
      {
        error: "Failed to update property.",
        details: error.message || "Unknown error",
      },
      { status: 500 },
    );
  }
}

export async function DELETE(
  _request: Request,
  { params }: PropertyRouteContext,
) {
  try {
    const session = await auth();
    if (!session?.user) {
      return NextResponse.json(
        { error: "Authentication required" },
        { status: 401 }
      );
    }

    const property = await db.property.findUnique({
      where: { id: params.id },
    });

    if (!property) {
      return NextResponse.json(
        { error: "Property not found" },
        { status: 404 }
      );
    }

    if (property.sellerId !== session.user.id) {
      return NextResponse.json(
        { error: "Not authorized" },
        { status: 403 }
      );
    }

    await db.property.delete({
      where: { id: params.id },
    });

    return NextResponse.json({ message: "Property deleted successfully" });
  } catch (error: any) {
    console.error("Error deleting property:", error);
    return NextResponse.json(
      {
        error: "Failed to delete property.",
        details: error.message || "Unknown error",
      },
      { status: 500 },
    );
  }
}
