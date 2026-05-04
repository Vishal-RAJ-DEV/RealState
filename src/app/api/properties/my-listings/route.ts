import { NextResponse } from "next/server";

export async function GET() {
  try {
    return NextResponse.json({
      message: "My listings endpoint placeholder.",
    });
  } catch (error) {
    return NextResponse.json(
      {
        error: "Failed to load my listings.",
        details: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 },
    );
  }
}
