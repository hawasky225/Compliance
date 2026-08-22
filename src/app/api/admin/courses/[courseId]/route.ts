import { NextResponse } from "next/server";
import { getApiAdmin } from "@/lib/admin-api";
import { prisma } from "@/lib/prisma";

export async function PATCH(request: Request, { params }: { params: Promise<{ courseId: string }> }) {
  if (!await getApiAdmin()) return NextResponse.json({ error: "Accès refusé" }, { status: 403 });
  const { courseId } = await params;
  const body = await request.json();
  const data: Record<string, unknown> = {};
  if (body.title !== undefined) data.title = String(body.title).trim();
  if (body.description !== undefined) data.description = String(body.description).trim() || null;
  if (body.level !== undefined) data.level = String(body.level).trim() || "Fondation";
  if (body.durationMinutes !== undefined) {
    const duration = Number(body.durationMinutes);
    if (!Number.isFinite(duration) || duration < 1) return NextResponse.json({ error: "Durée invalide." }, { status: 400 });
    data.durationMinutes = duration;
  }
  if (body.published !== undefined) data.published = Boolean(body.published);
  const course = await prisma.course.update({ where: { id: courseId }, data });
  return NextResponse.json({ ok: true, course });
}

export async function DELETE(_: Request, { params }: { params: Promise<{ courseId: string }> }) {
  if (!await getApiAdmin()) return NextResponse.json({ error: "Accès refusé" }, { status: 403 });
  const { courseId } = await params;
  const [enrollments, attempts] = await Promise.all([
    prisma.enrollment.count({ where: { courseId } }),
    prisma.examAttempt.count({ where: { assessment: { courseId } } }),
  ]);
  if (enrollments > 0 || attempts > 0) return NextResponse.json({ error: "Cette formation possède déjà une activité et ne peut pas être supprimée." }, { status: 409 });
  await prisma.course.delete({ where: { id: courseId } });
  return NextResponse.json({ ok: true });
}
