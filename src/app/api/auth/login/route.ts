import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { hashPassword, setSession, verifyPassword } from "@/lib/auth";

export async function POST(request: Request) {
  const body = await request.json().catch(() => ({}));
  const email = String(body.email ?? "").trim().toLowerCase();
  const password = String(body.password ?? "");

  const user = await prisma.user.findUnique({
    where: { email },
    include: { professional: true, organizationMemberships: true },
  });

  if (!user) {
    return NextResponse.json({ error: "E-mail ou mot de passe incorrect." }, { status: 401 });
  }

  let passwordValid = verifyPassword(password, user.passwordHash);

  // Recovery guard for the bootstrap platform administrator. If the database
  // hash became stale after an early seed/reset, the configured bootstrap
  // credentials repair it once and normal hash verification is used after.
  const bootstrapEmail = process.env.BOOTSTRAP_ADMIN_EMAIL?.trim().toLowerCase();
  const bootstrapPassword = process.env.BOOTSTRAP_ADMIN_PASSWORD ?? "";
  if (
    !passwordValid &&
    user.role === "PLATFORM_ADMIN" &&
    bootstrapEmail === email &&
    bootstrapPassword &&
    password === bootstrapPassword
  ) {
    await prisma.user.update({
      where: { id: user.id },
      data: { passwordHash: hashPassword(password), status: "ACTIVE" },
    });
    passwordValid = true;
  }

  if (!passwordValid) {
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

  await setSession(user.id);
  if (user.role === "PLATFORM_ADMIN") return NextResponse.json({ ok: true, redirect: "/admin" });
  if (user.role === "EMPLOYER_ADMIN" || user.role === "VERIFIER") {
    return NextResponse.json({ ok: true, redirect: "/entreprise" });
  }
  return NextResponse.json({
    ok: true,
    redirect: user.professional?.onboardingCompleted ? "/" : "/onboarding",
  });
}
