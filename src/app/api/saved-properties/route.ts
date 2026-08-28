import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { db } from "@/lib/prisma";
import { getCurrentDbUser } from "@/lib/current-user";

export async function GET() {
  try {
    const user = await getCurrentDbUser();
    if (!user) {
      return NextResponse.json({ savedIds: [] });
    }

    const saved = await db.savedProperty.findMany({
      where: { userId: user.id },
      select: { propertyId: true },
    });

    return NextResponse.json({ savedIds: saved.map(s => s.propertyId) });
  } catch (error: any) {
    console.error("Error fetching saved properties:", error);
    return NextResponse.json(
      { error: "Failed to load saved properties." },
      { status: 500 }
    );
  }
}

export async function POST(request: Request) {
  try {
    const user = await getCurrentDbUser();
    if (!user) {
      return NextResponse.json(
        { error: "Authentication required to save properties" },
        { status: 401 }
      );
    }

    const { propertyId } = await request.json();
    if (!propertyId || typeof propertyId !== "string") {
      return NextResponse.json(
        { error: "Property ID is required" },
        { status: 400 }
      );
    }

    const property = await db.property.findUnique({
      where: { id: propertyId },
      select: { id: true },
    });
    if (!property) {
      return NextResponse.json(
        { error: "Property not found" },
        { status: 404 }
      );
    }

    const existing = await db.savedProperty.findUnique({
      where: { userId_propertyId: { userId: user.id, propertyId } },
    });

    if (existing) {
      await db.savedProperty.delete({
        where: { id: existing.id },
      });
      return NextResponse.json({ saved: false });
    }

    await db.savedProperty.create({
      data: { userId: user.id, propertyId },
    });

    return NextResponse.json({ saved: true }, { status: 201 });
  } catch (error: any) {
    console.error("Error toggling saved property:", error);
    return NextResponse.json(
      { error: "Failed to save property." },
      { status: 500 }
    );
  }
}
