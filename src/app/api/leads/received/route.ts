import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { db } from "@/lib/prisma";

export async function GET(request: Request) {
  try {
    const session = await auth();
    if (!session?.user) {
      return NextResponse.json(
        { error: "Authentication required" },
        { status: 401 }
      );
    }

    const leads = await db.lead.findMany({
      where: {
        property: {
          sellerId: session.user.id,
        },
      },
      include: {
        property: {
          select: {
            id: true,
            title: true,
            city: true,
            price: true,
            images: true,
          },
        },
      },
      orderBy: { createdAt: "desc" },
    });

    // Transform leads for frontend consumption
    const transformedLeads = leads.map(lead => ({
      id: lead.id,
      property: {
        id: lead.property.id,
        title: lead.property.title,
        city: lead.property.city,
        price: lead.property.price,
        image: lead.property.images[0] || null,
      },
      buyer: {
        id: lead.buyerId,
        name: lead.name, // Using the name from lead since buyer might be null
        email: lead.email,
        phone: lead.phone,
      },
      message: lead.message,
      createdAt: lead.createdAt,
    }));

    return NextResponse.json(transformedLeads);
  } catch (error: any) {
    console.error("Error fetching received leads:", error);
    return NextResponse.json(
      {
        error: "Failed to load received leads.",
        details: error.message || "Unknown error",
      },
      { status: 500 },
    );
  }
}
