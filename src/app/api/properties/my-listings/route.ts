import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { db } from "@/lib/prisma";
import { mapPropertyToFrontend } from "@/lib/property-mapper";

export async function GET(request: Request) {
  try {
    const session = await auth();
    if (!session?.user) {
      return NextResponse.json(
        { error: "Authentication required" },
        { status: 401 }
      );
    }

    const properties = await db.property.findMany({
      where: { sellerId: session.user.id },
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
      orderBy: { createdAt: "desc" },
    });

    // Calculate stats
    const stats = {
      total: properties.length,
      active: properties.filter(p => p.status === "ACTIVE").length,
      sold: properties.filter(p => p.status === "SOLD").length,
      rented: properties.filter(p => p.status === "RENTED").length,
      totalLeads: properties.reduce((sum, p) => sum + p._count.leads, 0),
      totalViews: properties.reduce((sum, p) => sum + p.views, 0),
    };

    return NextResponse.json({
      properties: properties.map(mapPropertyToFrontend),
      stats,
    });
  } catch (error: any) {
    console.error("Error fetching my listings:", error);
    return NextResponse.json(
      {
        error: "Failed to load your listings.",
        details: error.message || "Unknown error",
      },
      { status: 500 },
    );
  }
}