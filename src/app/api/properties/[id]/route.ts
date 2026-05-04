import { NextResponse } from "next/server";

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
    return NextResponse.json({
      message: "Single property endpoint placeholder.",
      propertyId: params.id,
    });
  } catch (error) {
    return NextResponse.json(
      {
        error: "Failed to load property.",
        details: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 },
    );
  }
}

export async function PATCH(
  _request: Request,
  { params }: PropertyRouteContext,
) {
  try {
    return NextResponse.json(
      {
        message: "Property update endpoint placeholder.",
        propertyId: params.id,
      },
      { status: 501 },
    );
  } catch (error) {
    return NextResponse.json(
      {
        error: "Failed to update property.",
        details: error instanceof Error ? error.message : "Unknown error",
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
    return NextResponse.json(
      {
        message: "Property delete endpoint placeholder.",
        propertyId: params.id,
      },
      { status: 501 },
    );
  } catch (error) {
    return NextResponse.json(
      {
        error: "Failed to delete property.",
        details: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 },
    );
  }
}
