import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { db } from "@/lib/prisma";
import { leadSchema } from "@/lib/validations";

type LeadRouteContext = {
  params: {
    propertyId: string;
  };
};

export async function POST(
  request: Request,
  { params }: LeadRouteContext,
) {
  try {
    const session = await auth();
    
    // Optional authentication - leads can be submitted without login
    const buyerId = session?.user?.id ?? null;

    const json = await request.json();
    const validated = leadSchema.parse(json);

    // Verify property exists
    const property = await db.property.findUnique({
      where: { id: params.propertyId },
    });

    if (!property) {
      return NextResponse.json(
        { error: "Property not found" },
        { status: 404 }
      );
    }

    const lead = await db.lead.create({
      data: {
        propertyId: params.propertyId,
        buyerId,
        name: validated.name,
        phone: validated.phone,
        email: validated.email,
        message: validated.message ?? null,
      },
    });

    return NextResponse.json(
      { 
        message: "Your inquiry has been sent", 
        lead: {
          id: lead.id,
          createdAt: lead.createdAt,
        }
      },
      { status: 201 }
    );
  } catch (error: any) {
    if (error.name === "ZodError") {
      return NextResponse.json(
        { error: "Invalid input data", details: error.errors },
        { status: 400 }
      );
    }
    console.error("Error creating lead:", error);
    return NextResponse.json(
      {
        error: "Failed to create lead.",
        details: error.message || "Unknown error",
      },
      { status: 500 },
    );
  }
}
