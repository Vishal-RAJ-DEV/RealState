import { NextResponse } from "next/server";

export async function GET() {
  try {
    return NextResponse.json({
      message: "Properties listing endpoint placeholder.",
    });
  } catch (error) {
    return NextResponse.json(
      {
        error: "Failed to load properties.",
        details: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 },
    );
  }
}

export async function POST() {
  try {
    return NextResponse.json(
      {
        message: "Property creation endpoint placeholder.",
      },
      { status: 501 },
    );
  } catch (error) {
    return NextResponse.json(
      {
        error: "Failed to create property.",
        details: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 },
    );
  }
}
