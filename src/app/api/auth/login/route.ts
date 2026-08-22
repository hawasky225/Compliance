import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { setSession, verifyPassword } from "@/lib/auth";
import { rateLimit, requireSameOrigin } from "@/lib/security";

export async function POST(request: Request) {
  const originError = requireSameOrigin(request);
  if (originError) return originError;
  const limited = rateLimit(request, "auth:login", 8, 15 * 60_000);
  if (limited) return limited;

  const body = await request.json().catch(() => ({}));
  const email = String(body.email ?? "").trim().toLowerCase();
  const password = String(body.password ?? "");

  const user = await prisma.user.findUnique({
    where: { email },
    include: { professional: true, organizationMemberships: true },
  });

  if (!user || !verifyPassword(password, user.passwordHash)) {
    return NextResponse.json({ error: "E-mail ou mot de passe incorrect." }, { status: 401 });
  }

  if (user.status !== "ACTIVE") {
    return NextResponse.json(
      {
        error:
          user.status === "SUSPENDED"
            ? "Votre accès est temporairement suspendu. Contactez votre administrateur."
            : "Ce compte a été désactivé. Contactez votre administrateur.",
      },
      { status: 403 },
    );
  }

  await setSession(user.id, user.passwordHash);
  if (user.role === "PLATFORM_ADMIN") return NextResponse.json({ ok: true, redirect: "/admin" });
  if (user.role === "EMPLOYER_ADMIN" || user.role === "VERIFIER") {
    return NextResponse.json({ ok: true, redirect: "/entreprise" });
  }
  return NextResponse.json({
    ok: true,
    redirect: user.professional?.onboardingCompleted ? "/" : "/onboarding",
  });
}
