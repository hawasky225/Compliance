import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { hashPassword, secureEqualText, verifyPasswordResetToken } from "@/lib/auth";

export async function POST(request: Request) {
  const body = await request.json().catch(() => ({}));
  const password = String(body.password ?? "");
  const confirmPassword = String(body.confirmPassword ?? "");
  if (password.length < 12) return NextResponse.json({ error: "Le mot de passe doit contenir au moins 12 caractères." }, { status: 400 });
  if (password !== confirmPassword) return NextResponse.json({ error: "Les mots de passe ne correspondent pas." }, { status: 400 });

  const token = String(body.token ?? "").trim();
  if (token) {
    const decoded = token.split(".")[0];
    let userId = "";
    try { userId = Buffer.from(decoded, "base64url").toString("utf8").split(".")[0] ?? ""; } catch { /* invalid */ }
    const user = userId ? await prisma.user.findUnique({ where: { id: userId } }) : null;
    if (!user || verifyPasswordResetToken(token, user.passwordHash) !== user.id) {
      return NextResponse.json({ error: "Ce lien de réinitialisation est invalide ou a expiré." }, { status: 400 });
    }
    await prisma.user.update({ where: { id: user.id }, data: { passwordHash: hashPassword(password) } });
    return NextResponse.json({ ok: true });
  }

  const email = String(body.email ?? "").trim().toLowerCase();
  const recoveryCode = String(body.recoveryCode ?? "").trim();
  const bootstrapEmail = process.env.BOOTSTRAP_ADMIN_EMAIL?.trim().toLowerCase();
  const configuredCode = process.env.ADMIN_RECOVERY_CODE ?? "";
  if (!email || !recoveryCode || !bootstrapEmail || email !== bootstrapEmail || !configuredCode || !secureEqualText(recoveryCode, configuredCode)) {
    return NextResponse.json({ error: "Code de récupération invalide." }, { status: 400 });
  }

  const user = await prisma.user.findUnique({ where: { email } });
  if (!user || user.role !== "PLATFORM_ADMIN") return NextResponse.json({ error: "Code de récupération invalide." }, { status: 400 });
  await prisma.user.update({ where: { id: user.id }, data: { passwordHash: hashPassword(password) } });
  return NextResponse.json({ ok: true });
}
