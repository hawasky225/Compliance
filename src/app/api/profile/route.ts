import { NextResponse } from "next/server";
import { getSessionUserId } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function GET() {
  const userId = await getSessionUserId();
  if (!userId) return NextResponse.json({ error: "Non authentifié" }, { status: 401 });
  const user = await prisma.user.findUnique({ where: { id: userId }, include: { professional: true } });
  return NextResponse.json({ user: user ? { id: user.id, name: user.name, email: user.email, role: user.role, professional: user.professional } : null });
}

export async function PATCH(request: Request) {
  const userId = await getSessionUserId();
  if (!userId) return NextResponse.json({ error: "Non authentifié" }, { status: 401 });
  const body = await request.json();
  const data = {
    jobTitle: String(body.jobTitle ?? "").trim() || null,
    employer: String(body.employer ?? "").trim() || null,
    country: String(body.country ?? "").trim() || null,
    city: String(body.city ?? "").trim() || null,
    phone: String(body.phone ?? "").trim() || null,
    onboardingCompleted: true,
  };
  const professional = await prisma.professional.update({ where: { userId }, data });
  return NextResponse.json({ ok: true, professional });
}
