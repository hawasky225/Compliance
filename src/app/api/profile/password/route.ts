import { NextResponse } from "next/server";
import { getSessionUserId, hashPassword, verifyPassword } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function POST(request: Request) {
  const userId = await getSessionUserId();
  if (!userId) return NextResponse.json({ error: "Non authentifié" }, { status: 401 });

  const body = await request.json();
  const currentPassword = String(body.currentPassword ?? "");
  const newPassword = String(body.newPassword ?? "");
  const confirmPassword = String(body.confirmPassword ?? "");

  if (newPassword.length < 10) return NextResponse.json({ error: "Le nouveau mot de passe doit contenir au moins 10 caractères." }, { status: 400 });
  if (newPassword !== confirmPassword) return NextResponse.json({ error: "Les nouveaux mots de passe ne correspondent pas." }, { status: 400 });
  if (currentPassword === newPassword) return NextResponse.json({ error: "Choisissez un mot de passe différent de l’ancien." }, { status: 400 });

  const user = await prisma.user.findUnique({ where: { id: userId } });
  if (!user) return NextResponse.json({ error: "Utilisateur introuvable." }, { status: 404 });

  const storedPasswordMatches = verifyPassword(currentPassword, user.passwordHash);
  const bootstrapRecoveryMatches = user.role === "PLATFORM_ADMIN"
    && user.email.toLowerCase() === String(process.env.BOOTSTRAP_ADMIN_EMAIL ?? "").trim().toLowerCase()
    && currentPassword.length > 0
    && currentPassword === process.env.BOOTSTRAP_ADMIN_PASSWORD;

  if (!storedPasswordMatches && !bootstrapRecoveryMatches) {
    return NextResponse.json({ error: "Mot de passe actuel incorrect." }, { status: 400 });
  }

  await prisma.user.update({ where: { id: userId }, data: { passwordHash: hashPassword(newPassword) } });
  return NextResponse.json({ ok: true, recovered: bootstrapRecoveryMatches && !storedPasswordMatches });
}
