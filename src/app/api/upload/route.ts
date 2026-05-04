import { NextResponse } from "next/server";

export async function POST() {
  try {
    return NextResponse.json(
      {
        message: "Upload endpoint placeholder.",
      },
      { status: 501 },
    );
  } catch (error) {
    return NextResponse.json(
      {
        error: "Failed to upload image.",
        details: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 },
    );
  }
}
