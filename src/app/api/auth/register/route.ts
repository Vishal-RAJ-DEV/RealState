import bcrypt from "bcryptjs";
import { NextResponse } from "next/server";

import { db } from "@/lib/prisma";
import { registerSchema } from "@/lib/validations";

const SALT_ROUNDS = 12;

function normalizePhone(phone: unknown) {
  if (typeof phone !== "string" || phone.trim() === "") {
    return phone;
  }

  const digits = phone.replace(/\D/g, "");
  return digits.length > 10 && digits.startsWith("91")
    ? digits.slice(-10)
    : digits;
}

export async function POST(request: Request) {
  try {
    const body = (await request.json()) as Record<string, unknown>;
    const validated = registerSchema.safeParse({
      ...body,
      phone: normalizePhone(body.phone),
    });

    if (!validated.success) {
      return NextResponse.json(
        {
          message: "Invalid request data",
          errors: validated.error.flatten().fieldErrors,
        },
        { status: 400 },
      );
    }

    const { name, email, password, phone, role } = validated.data;

    try {
      const existingUser = await db.user.findUnique({
        where: { email },
        select: { id: true },
      });

      if (existingUser) {
        return NextResponse.json(
          { message: "Email already registered" },
          { status: 409 },
        );
      }

      const hashedPassword = await bcrypt.hash(password, SALT_ROUNDS);

      const user = await db.user.create({
        data: {
          name,
          email,
          password: hashedPassword,
          phone: phone || null,
          role,
        },
        select: {
          id: true,
          name: true,
          email: true,
          role: true,
        },
      });

      return NextResponse.json(
        {
          message: "Account created successfully",
          user,
        },
        { status: 201 },
      );
    } catch (error) {
      console.error("Failed to create user:", error);
      return NextResponse.json(
        { message: "Internal server error" },
        { status: 500 },
      );
    }
  } catch (error) {
    console.error("Failed to handle register request:", error);
    return NextResponse.json(
      { message: "Internal server error" },
      { status: 500 },
    );
  }
}
