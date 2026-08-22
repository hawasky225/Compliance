import { NextResponse } from "next/server";
import { getApiAdmin } from "@/lib/admin-api";
import { prisma } from "@/lib/prisma";

export async function POST(request: Request, { params }: { params: Promise<{ courseId: string }> }) {
  if (!await getApiAdmin()) return NextResponse.json({ error: "Accès refusé" }, { status: 403 });
  const { courseId } = await params;
  const body = await request.json();
  const title = String(body.title ?? "").trim();
  const passingScore = Number(body.passingScore ?? 75);
  const maxAttempts = Number(body.maxAttempts ?? 2);
  const durationMinutes = Number(body.durationMinutes ?? 45);
  const schemeId = body.schemeId ? String(body.schemeId) : null;
  if (!title) return NextResponse.json({ error: "Le titre de l’examen est requis." }, { status: 400 });
  if (passingScore < 0 || passingScore > 100) return NextResponse.json({ error: "Le seuil doit être compris entre 0 et 100." }, { status: 400 });
  if (maxAttempts < 1 || durationMinutes < 1) return NextResponse.json({ error: "Tentatives et durée doivent être supérieures à 0." }, { status: 400 });
  const assessment = await prisma.assessment.create({ data: { courseId, schemeId, title, type: "EXAM", passingScore, maxAttempts, durationMinutes, published: Boolean(body.published) } });
  return NextResponse.json({ ok: true, assessment }, { status: 201 });
}
