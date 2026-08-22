import { redirect } from "next/navigation";
import { getSessionUserId } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function requireAdmin() {
  const userId = await getSessionUserId();
  if (!userId) redirect('/connexion');
  const user = await prisma.user.findUnique({ where: { id: userId } });
  if (!user || user.role !== 'PLATFORM_ADMIN') redirect('/');
  return user;
}
