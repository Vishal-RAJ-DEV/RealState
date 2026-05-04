import { NextResponse } from "next/server";

type LeadRouteContext = {
  params: {
    propertyId: string;
  };
};

export async function POST(
  _request: Request,
  { params }: LeadRouteContext,
) {
  try {
    return NextResponse.json(
      {
        message: "Lead creation endpoint placeholder.",
        propertyId: params.propertyId,
      },
      { status: 501 },
    );
  } catch (error) {
    return NextResponse.json(
      {
        error: "Failed to create lead.",
        details: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 },
    );
  }
}
