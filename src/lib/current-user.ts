import { auth } from "@/lib/auth";
import { db } from "@/lib/prisma";
import type { User } from "@prisma/client";

export async function getCurrentDbUser(): Promise<User | null> {
  const session = await auth();

  if (!session?.user?.id) {
    return null;
  }

  const user = await db.user.findUnique({
    where: { id: session.user.id },
  });

  return user;
}
