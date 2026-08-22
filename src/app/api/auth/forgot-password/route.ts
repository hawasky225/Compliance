import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { createPasswordResetToken } from "@/lib/auth";
import { rateLimit, requireSameOrigin } from "@/lib/security";

const GENERIC = "Si un compte existe pour cette adresse, un lien de réinitialisation sera envoyé.";

export async function POST(request: Request) {
  const originError = requireSameOrigin(request);
  if (originError) return originError;
  const limited = rateLimit(request, "auth:forgot-password", 5, 60 * 60_000);
  if (limited) return limited;

  const body = await request.json().catch(() => ({}));
  const email = String(body.email ?? "").trim().toLowerCase();
  if (!email) return NextResponse.json({ ok: true, message: GENERIC });

  const user = await prisma.user.findUnique({ where: { email } });
  const apiKey = process.env.RESEND_API_KEY;
  const from = process.env.RESET_EMAIL_FROM;
  const baseUrl = process.env.NEXT_PUBLIC_APP_URL?.replace(/\/$/, "");

  if (user && apiKey && from && baseUrl) {
    const token = createPasswordResetToken(user.id, user.passwordHash);
    const resetUrl = `${baseUrl}/reinitialiser-mot-de-passe?token=${encodeURIComponent(token)}`;
    const response = await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: { Authorization: `Bearer ${apiKey}`, "Content-Type": "application/json" },
      body: JSON.stringify({
        from,
        to: [user.email],
        subject: "Réinitialisation de votre mot de passe Compliance",
        html: `<div style="font-family:Arial,sans-serif;max-width:560px;margin:auto;color:#17211c"><h2>Compliance</h2><p>Bonjour ${escapeHtml(user.name)},</p><p>Vous avez demandé la réinitialisation de votre mot de passe.</p><p style="margin:28px 0"><a href="${resetUrl}" style="background:#123f32;color:white;padding:12px 18px;border-radius:8px;text-decoration:none;font-weight:700">Créer un nouveau mot de passe</a></p><p>Ce lien expire dans 30 minutes.</p><p style="color:#60706a;font-size:13px">Si vous n'êtes pas à l'origine de cette demande, ignorez simplement ce message.</p></div>`,
      }),
    });
    if (!response.ok) console.error("Password reset email delivery failed", response.status);
  }

  // Always return the same response so callers cannot determine whether an
  // account exists or whether transactional email is configured.
  return NextResponse.json({ ok: true, message: GENERIC });
}

function escapeHtml(value: string) {
  return value.replace(/[&<>'"]/g, (ch) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", "'": "&#39;", '"': "&quot;" }[ch] ?? ch));
}
