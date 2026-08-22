import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { setSession, verifyPassword } from "@/lib/auth";

export async function POST(request: Request) {
  const body = await request.json();
  const email = String(body.email ?? "").trim().toLowerCase();
  const password = String(body.password ?? "");
  const user = await prisma.user.findUnique({ where: { email }, include: { professional: true } });
  if (!user || !verifyPassword(password, user.passwordHash)) {
    return NextResponse.json({ error: "E-mail ou mot de passe incorrect." }, { status: 401 });
  }
  await setSession(user.id);

  // Platform administrators do not need a Professional profile or mining passport.
  if (user.role === "PLATFORM_ADMIN") {
    return NextResponse.json({ ok: true, redirect: "/admin" });
  }

  return NextResponse.json({ ok: true, redirect: user.professional?.onboardingCompleted ? "/" : "/onboarding" });
}
