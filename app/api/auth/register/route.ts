import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { hashPassword, setSession } from "@/lib/auth";

export async function POST(request: Request) {
  const body = await request.json();
  const name = String(body.name ?? "").trim();
  const email = String(body.email ?? "").trim().toLowerCase();
  const password = String(body.password ?? "");

  if (name.length < 2 || !email.includes("@") || password.length < 10) {
    return NextResponse.json({ error: "Informations invalides. Le mot de passe doit contenir au moins 10 caractères." }, { status: 400 });
  }

  const exists = await prisma.user.findUnique({ where: { email } });
  if (exists) return NextResponse.json({ error: "Un compte existe déjà avec cette adresse e-mail." }, { status: 409 });

  const user = await prisma.user.create({
    data: {
      name,
      email,
      passwordHash: hashPassword(password),
      professional: { create: { professionalId: `CMP-${crypto.randomUUID().slice(0, 8).toUpperCase()}` } },
    },
  });

  await setSession(user.id);
  return NextResponse.json({ ok: true, redirect: "/onboarding" }, { status: 201 });
}
