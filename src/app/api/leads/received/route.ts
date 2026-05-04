import { NextResponse } from "next/server";

export async function GET() {
  try {
    return NextResponse.json({
      message: "Received leads endpoint placeholder.",
    });
  } catch (error) {
    return NextResponse.json(
      {
        error: "Failed to load received leads.",
        details: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 },
    );
  }
}
