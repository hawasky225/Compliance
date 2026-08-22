import { NextResponse } from "next/server";
import { getSessionUserId } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function POST(_: Request, { params }: { params: Promise<{ assessmentId: string }> }) {
  const userId = await getSessionUserId();
  if (!userId) return NextResponse.json({ error: "Non authentifié" }, { status: 401 });
  const { assessmentId } = await params;
  const professional = await prisma.professional.findUnique({ where: { userId } });
  if (!professional) return NextResponse.json({ error: "Profil professionnel introuvable" }, { status: 404 });

  const assessment = await prisma.assessment.findUnique({
    where: { id: assessmentId },
    include: { questions: { orderBy: { sortOrder: "asc" } } },
  });
  if (!assessment || !assessment.published) return NextResponse.json({ error: "Examen indisponible" }, { status: 404 });

  const inProgress = await prisma.examAttempt.findFirst({
    where: { assessmentId, professionalId: professional.id, status: "IN_PROGRESS" },
    orderBy: { startedAt: "desc" },
  });

  if (inProgress) {
    const deadline = inProgress.startedAt.getTime() + assessment.durationMinutes * 60_000;
    if (Date.now() <= deadline) {
      return NextResponse.json({
        attemptId: inProgress.id,
        title: assessment.title,
        durationMinutes: assessment.durationMinutes,
        passingScore: assessment.passingScore,
        startedAt: inProgress.startedAt.toISOString(),
        questions: assessment.questions.map((q) => ({ id: q.id, prompt: q.prompt, type: q.type, options: q.options, points: q.points })),
      });
    }

    await prisma.$transaction([
      prisma.examAttempt.update({ where: { id: inProgress.id }, data: { status: "GRADED", score: 0, passed: false, submittedAt: new Date() } }),
      prisma.assessmentResult.create({ data: { assessmentId, professionalId: professional.id, score: 0, passed: false, attempt: inProgress.attemptNumber } }),
    ]);
  }

  const previous = await prisma.examAttempt.count({ where: { assessmentId, professionalId: professional.id } });
  if (previous >= assessment.maxAttempts) return NextResponse.json({ error: "Nombre maximal de tentatives atteint" }, { status: 409 });

  const attempt = await prisma.examAttempt.create({
    data: { assessmentId, professionalId: professional.id, attemptNumber: previous + 1 },
  });

  return NextResponse.json({
    attemptId: attempt.id,
    title: assessment.title,
    durationMinutes: assessment.durationMinutes,
    passingScore: assessment.passingScore,
    startedAt: attempt.startedAt.toISOString(),
    questions: assessment.questions.map((q) => ({ id: q.id, prompt: q.prompt, type: q.type, options: q.options, points: q.points })),
  });
}
