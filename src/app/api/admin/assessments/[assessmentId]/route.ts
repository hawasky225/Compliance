import { NextResponse } from "next/server";
import { getApiAdmin } from "@/lib/admin-api";
import { prisma } from "@/lib/prisma";

export async function PATCH(request: Request, { params }: { params: Promise<{ assessmentId: string }> }) {
  if (!await getApiAdmin()) return NextResponse.json({ error: "Accès refusé" }, { status: 403 });
  const { assessmentId } = await params;
  const body = await request.json();
  const data: Record<string, unknown> = {};
  if (body.title !== undefined) data.title = String(body.title).trim();
  if (body.passingScore !== undefined) {
    const value = Number(body.passingScore);
    if (value < 0 || value > 100) return NextResponse.json({ error: "Seuil invalide." }, { status: 400 });
    data.passingScore = value;
  }
  if (body.maxAttempts !== undefined) {
    const value = Number(body.maxAttempts);
    if (value < 1) return NextResponse.json({ error: "Nombre de tentatives invalide." }, { status: 400 });
    data.maxAttempts = value;
  }
  if (body.durationMinutes !== undefined) {
    const value = Number(body.durationMinutes);
    if (value < 1) return NextResponse.json({ error: "Durée invalide." }, { status: 400 });
    data.durationMinutes = value;
  }
  if (body.published !== undefined) data.published = Boolean(body.published);
  if (body.schemeId !== undefined) data.schemeId = body.schemeId ? String(body.schemeId) : null;
  const assessment = await prisma.assessment.update({ where: { id: assessmentId }, data });
  return NextResponse.json({ ok: true, assessment });
}
