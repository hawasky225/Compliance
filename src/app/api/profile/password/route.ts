import { NextResponse } from "next/server";
import { getSessionUserId, hashPassword, setSession, verifyPassword } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { rateLimit, requireSameOrigin } from "@/lib/security";

export async function POST(request: Request) {
  const originError = requireSameOrigin(request);
  if (originError) return originError;
  const limited = rateLimit(request, "profile:password", 6, 30 * 60_000);
  if (limited) return limited;

  const userId = await getSessionUserId();
  if (!userId) return NextResponse.json({ error: "Non authentifié" }, { status: 401 });

  const body = await request.json().catch(() => ({}));
  const currentPassword = String(body.currentPassword ?? "");
  const newPassword = String(body.newPassword ?? "");
  const confirmPassword = String(body.confirmPassword ?? "");

  if (newPassword.length < 12) return NextResponse.json({ error: "Le nouveau mot de passe doit contenir au moins 12 caractères." }, { status: 400 });
  if (newPassword !== confirmPassword) return NextResponse.json({ error: "Les nouveaux mots de passe ne correspondent pas." }, { status: 400 });
  if (currentPassword === newPassword) return NextResponse.json({ error: "Choisissez un mot de passe différent de l’ancien." }, { status: 400 });

  const user = await prisma.user.findUnique({ where: { id: userId } });
  if (!user) return NextResponse.json({ error: "Utilisateur introuvable." }, { status: 404 });
  if (!verifyPassword(currentPassword, user.passwordHash)) {
    return NextResponse.json({ error: "Mot de passe actuel incorrect." }, { status: 400 });
  }

  const passwordHash = hashPassword(newPassword);
  await prisma.user.update({ where: { id: userId }, data: { passwordHash } });
  // Password-bound sessions invalidate every older session automatically. Keep
  // only this browser authenticated with a newly signed session.
  await setSession(userId, passwordHash);
  return NextResponse.json({ ok: true });
}
