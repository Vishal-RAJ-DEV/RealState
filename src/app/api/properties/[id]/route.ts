import { NextResponse } from "next/server";
import { z } from "zod";
import { auth } from "@/lib/auth";
import { db } from "@/lib/prisma";
import { mapPropertyToFrontend } from "@/lib/property-mapper";

const patchSchema = z.object({
  title: z.string().min(5).optional(),
  description: z.string().min(10).optional(),
  price: z.number().positive().optional(),
  type: z.enum(["FLAT", "PLOT", "PG_ROOM"]).optional(),
  listingFor: z.enum(["SALE", "RENT"]).optional(),
  city: z.string().min(1).optional(),
  locality: z.string().min(1).optional(),
  address: z.string().optional(),
  latitude: z.number().optional(),
  longitude: z.number().optional(),
  images: z.array(z.string()).optional(),
  amenities: z.array(z.string()).optional(),
  status: z.enum(["ACTIVE", "SOLD", "RENTED"]).optional(),
  details: z.any().optional(),
});

type PropertyRouteContext = {
  params: {
    id: string;
  };
};

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

export async function GET(
  _request: Request,
  { params }: PropertyRouteContext,
) {
  try {
    const property = await db.property.findUnique({
      where: { id: params.id },
      include: propertyInclude,
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

    const existing = await db.property.findUnique({
      where: { id: params.id },
      include: { plotDetails: true, flatDetails: true, pgDetails: true },
    });

    if (!existing) {
      return NextResponse.json(
        { error: "Property not found" },
        { status: 404 }
      );
    }

    if (existing.sellerId !== session.user.id) {
      return NextResponse.json(
        { error: "Not authorized" },
        { status: 403 }
      );
    }

    const json = await request.json();
    const validated = patchSchema.parse(json);

    const property = await db.$transaction(async (tx) => {
      // Update common fields
      const commonFields: Record<string, unknown> = {};
      if (validated.title !== undefined) commonFields.title = validated.title;
      if (validated.description !== undefined) commonFields.description = validated.description;
      if (validated.price !== undefined) commonFields.price = validated.price;
      if (validated.city !== undefined) commonFields.city = validated.city;
      if (validated.locality !== undefined) commonFields.locality = validated.locality;
      if (validated.address !== undefined) commonFields.address = validated.address;
      if (validated.latitude !== undefined) commonFields.latitude = validated.latitude;
      if (validated.longitude !== undefined) commonFields.longitude = validated.longitude;
      if (validated.images !== undefined) commonFields.images = validated.images;
      if (validated.amenities !== undefined) commonFields.amenities = validated.amenities;
      if (validated.status !== undefined) commonFields.status = validated.status;

      if (Object.keys(commonFields).length > 0) {
        await tx.property.update({
          where: { id: params.id },
          data: commonFields,
        });
      }

      // Update details if provided
      if (validated.type === "PLOT" && validated.details && 'plotType' in validated.details) {
        const d = validated.details;
        if (existing.plotDetails) {
          await tx.plotDetails.update({
            where: { propertyId: params.id },
            data: {
              plotType: d.plotType,
              area: d.area,
              areaUnit: d.areaUnit,
              length: d.length ?? null,
              width: d.width ?? null,
              facing: d.facing ?? null,
              roadWidth: d.roadWidth ?? null,
              nearPlaces: d.nearPlaces ?? [],
              boundaryWall: d.boundaryWall ?? false,
              waterAvailable: d.waterAvailable ?? false,
              electricityAvailable: d.electricityAvailable ?? false,
            },
          });
        }
      }

      if (validated.type === "FLAT" && validated.details && 'bedrooms' in validated.details) {
        const d = validated.details;
        if (existing.flatDetails) {
          await tx.flatDetails.update({
            where: { propertyId: params.id },
            data: {
              bedrooms: d.bedrooms,
              bathrooms: d.bathrooms,
              carpetArea: d.carpetArea ?? null,
              builtUpArea: d.builtUpArea ?? null,
              areaUnit: d.areaUnit ?? null,
              floor: d.floor ?? null,
              totalFloors: d.totalFloors ?? null,
              furnished: d.furnished ?? null,
              facing: d.facing ?? null,
              age: d.age ?? null,
              balconies: d.balconies ?? null,
              parking: d.parking ?? false,
              roomSize: d.roomSize ?? null,
            },
          });
        }
      }

      if (validated.type === "PG_ROOM" && validated.details && 'sharingType' in validated.details) {
        const d = validated.details;
        if (existing.pgDetails) {
          await tx.pGDetails.update({
            where: { propertyId: params.id },
            data: {
              roomSize: d.roomSize ?? null,
              areaUnit: d.areaUnit ?? null,
              sharingType: d.sharingType,
              totalBeds: d.totalBeds ?? null,
              availableBeds: d.availableBeds ?? null,
              genderPreference: d.genderPreference,
              attachedBathroom: d.attachedBathroom ?? false,
              balcony: d.balcony ?? false,
              furnished: d.furnished ?? false,
              foodAvailable: d.foodAvailable ?? false,
              foodType: d.foodType ?? null,
              monthlyRent: d.monthlyRent,
              securityDeposit: d.securityDeposit ?? null,
              maintenanceCharge: d.maintenanceCharge ?? null,
            },
          });
        }
      }

      return tx.property.findUnique({
        where: { id: params.id },
        include: propertyInclude,
      });
    });

    return NextResponse.json(mapPropertyToFrontend(property!));
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
