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

    const updatedProperty = await db.property.update({
      where: { id: params.id },
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
        // sellerId remains unchanged
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
