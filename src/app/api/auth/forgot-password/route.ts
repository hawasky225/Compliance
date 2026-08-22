import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { createPasswordResetToken } from "@/lib/auth";

const GENERIC = "Si un compte existe pour cette adresse, les instructions de réinitialisation ont été préparées.";

export async function POST(request: Request) {
  const body = await request.json().catch(() => ({}));
  const email = String(body.email ?? "").trim().toLowerCase();
  if (!email) return NextResponse.json({ error: "Adresse e-mail requise." }, { status: 400 });

  const user = await prisma.user.findUnique({ where: { email } });
  if (!user) return NextResponse.json({ ok: true, message: GENERIC });

  const bootstrapEmail = process.env.BOOTSTRAP_ADMIN_EMAIL?.trim().toLowerCase();
  if (user.role === "PLATFORM_ADMIN" && bootstrapEmail === email && process.env.ADMIN_RECOVERY_CODE) {
    return NextResponse.json({ ok: true, message: GENERIC, recoveryMode: true });
  }

  const apiKey = process.env.RESEND_API_KEY;
  const from = process.env.RESET_EMAIL_FROM;
  const baseUrl = process.env.NEXT_PUBLIC_APP_URL;
  if (apiKey && from && baseUrl) {
    const token = createPasswordResetToken(user.id, user.passwordHash);
    const resetUrl = `${baseUrl.replace(/\/$/, "")}/reinitialiser-mot-de-passe?token=${encodeURIComponent(token)}`;
    await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: { Authorization: `Bearer ${apiKey}`, "Content-Type": "application/json" },
      body: JSON.stringify({
        from,
        to: [user.email],
        subject: "Réinitialisation de votre mot de passe Compliance",
        html: `<p>Bonjour ${escapeHtml(user.name)},</p><p>Une demande de réinitialisation de mot de passe a été reçue.</p><p><a href="${resetUrl}">Réinitialiser mon mot de passe</a></p><p>Ce lien expire dans 30 minutes. Si vous n'êtes pas à l'origine de cette demande, ignorez ce message.</p>`,
      }),
    });
  }

  return NextResponse.json({ ok: true, message: GENERIC });
}

function escapeHtml(value: string) {
  return value.replace(/[&<>'"]/g, ch => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", "'": "&#39;", '"': "&quot;" }[ch] ?? ch));
}
