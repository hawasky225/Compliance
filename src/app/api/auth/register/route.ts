import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { hashPassword, setSession } from "@/lib/auth";
import { rateLimit, requireSameOrigin } from "@/lib/security";

export async function POST(request: Request) {
  const originError = requireSameOrigin(request);
  if (originError) return originError;
  const limited = rateLimit(request, "auth:register", 5, 60 * 60_000);
  if (limited) return limited;

  const body = await request.json().catch(() => ({}));
  const name = String(body.name ?? "").trim();
  const email = String(body.email ?? "").trim().toLowerCase();
  const password = String(body.password ?? "");

  if (name.length < 2 || !email.includes("@") || password.length < 12) {
    return NextResponse.json({ error: "Informations invalides. Le mot de passe doit contenir au moins 12 caractères." }, { status: 400 });
  }

  const exists = await prisma.user.findUnique({ where: { email } });
  if (exists) return NextResponse.json({ error: "Impossible de créer ce compte avec les informations fournies." }, { status: 409 });

  const passwordHash = hashPassword(password);
  const user = await prisma.user.create({
    data: {
      name,
      email,
      passwordHash,
      professional: { create: { professionalId: `CMP-${crypto.randomUUID().slice(0, 8).toUpperCase()}` } },
    },
  });

  await setSession(user.id, passwordHash);
  return NextResponse.json({ ok: true, redirect: "/onboarding" }, { status: 201 });
}
