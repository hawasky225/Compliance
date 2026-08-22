import { getSessionUserId } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function getApiAdmin() {
  const userId = await getSessionUserId();
  if (!userId) return null;
  const user = await prisma.user.findUnique({ where: { id: userId } });
  if (!user || user.role !== "PLATFORM_ADMIN") return null;
  return user;
}
