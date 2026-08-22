import { NextResponse } from "next/server";
import { getSessionUserId } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function POST(_: Request, { params }: { params: Promise<{ id: string }> }) {
  const userId = await getSessionUserId();
  if (!userId) return NextResponse.json({ error: "Non authentifié" }, { status: 401 });
  const { id } = await params;
  const professional = await prisma.professional.findUnique({ where: { userId } });
  if (!professional) return NextResponse.json({ error: "Profil professionnel introuvable" }, { status: 404 });

  const chapter = await prisma.chapter.findUnique({
    where: { id },
    include: { module: { include: { course: { include: { modules: { include: { chapters: true } } } } } } },
  });
  if (!chapter || !chapter.published || !chapter.module.published || !chapter.module.course.published) return NextResponse.json({ error: "Chapitre indisponible" }, { status: 404 });

  const ordered = chapter.module.course.modules
    .filter(m => m.published)
    .sort((a,b) => a.sortOrder - b.sortOrder)
    .flatMap(m => m.chapters.filter(c => c.published).sort((a,b) => a.sortOrder - b.sortOrder));
  const targetIndex = ordered.findIndex(c => c.id === id);
  const requiredBefore = ordered.slice(0, targetIndex).filter(c => c.required).map(c => c.id);
  if (requiredBefore.length) {
    const doneBefore = await prisma.chapterProgress.count({ where: { professionalId: professional.id, completed: true, chapterId: { in: requiredBefore } } });
    if (doneBefore < requiredBefore.length) return NextResponse.json({ error: "Terminez les chapitres précédents avant de continuer." }, { status: 409 });
  }

  await prisma.chapterProgress.upsert({
    where: { chapterId_professionalId: { chapterId: id, professionalId: professional.id } },
    create: { chapterId: id, professionalId: professional.id, completed: true, completedAt: new Date() },
    update: { completed: true, completedAt: new Date() },
  });

  const requiredIds = ordered.filter(c => c.required).map(c => c.id);
  const completedCount = requiredIds.length ? await prisma.chapterProgress.count({ where: { professionalId: professional.id, completed: true, chapterId: { in: requiredIds } } }) : 0;
  const progress = requiredIds.length ? Math.round((completedCount / requiredIds.length) * 100) : 100;
  await prisma.enrollment.upsert({
    where: { professionalId_courseId: { professionalId: professional.id, courseId: chapter.module.courseId } },
    create: { professionalId: professional.id, courseId: chapter.module.courseId, status: progress === 100 ? "COMPLETED" : "IN_PROGRESS", progress, completedAt: progress === 100 ? new Date() : null },
    update: { status: progress === 100 ? "COMPLETED" : "IN_PROGRESS", progress, completedAt: progress === 100 ? new Date() : null },
  });
  return NextResponse.json({ ok: true, progress, courseCompleted: progress === 100 });
}
