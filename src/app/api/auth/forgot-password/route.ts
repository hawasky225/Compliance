import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { createPasswordResetToken } from "@/lib/auth";

const GENERIC = "Si un compte existe pour cette adresse, un lien de réinitialisation sera envoyé.";

export async function POST(request: Request) {
  const body = await request.json().catch(() => ({}));
  const email = String(body.email ?? "").trim().toLowerCase();
  if (!email) return NextResponse.json({ error: "Adresse e-mail requise." }, { status: 400 });

  const user = await prisma.user.findUnique({ where: { email } });
  if (!user) return NextResponse.json({ ok: true, message: GENERIC });

  const apiKey = process.env.RESEND_API_KEY;
  const from = process.env.RESET_EMAIL_FROM;
  const baseUrl = process.env.NEXT_PUBLIC_APP_URL?.replace(/\/$/, "");

  if (apiKey && from && baseUrl) {
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

    if (!response.ok) {
      console.error("Password reset email delivery failed", response.status);
      return NextResponse.json({ error: "Le service d’envoi d’e-mails est temporairement indisponible." }, { status: 503 });
    }

    return NextResponse.json({ ok: true, message: GENERIC, delivery: "email" });
  }

  // Bootstrap admin keeps an emergency recovery-code path if transactional
  // email is not configured. All normal users use the same e-mail reset flow
  // once RESEND_API_KEY and RESET_EMAIL_FROM are configured.
  const bootstrapEmail = process.env.BOOTSTRAP_ADMIN_EMAIL?.trim().toLowerCase();
  const canUseRecoveryCode =
    user.role === "PLATFORM_ADMIN" &&
    bootstrapEmail === email &&
    Boolean(process.env.ADMIN_RECOVERY_CODE);

  if (canUseRecoveryCode) {
    return NextResponse.json({
      ok: true,
      message: "L’envoi d’e-mail n’est pas encore configuré. Utilisez le code de récupération administrateur.",
      recoveryMode: true,
      delivery: "recovery-code",
    });
  }

  return NextResponse.json(
    {
      error: "La récupération par e-mail n’est pas encore configurée sur la plateforme. Contactez l’administrateur Compliance.",
      emailDeliveryNotConfigured: true,
    },
    { status: 503 },
  );
}

function escapeHtml(value: string) {
  return value.replace(/[&<>'"]/g, (ch) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", "'": "&#39;", '"': "&quot;" }[ch] ?? ch));
}
