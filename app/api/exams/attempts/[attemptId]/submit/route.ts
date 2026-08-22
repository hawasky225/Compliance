import { NextResponse } from "next/server";
import { getSessionUserId } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { issueCertificationIfEligible } from "@/lib/certification";

function normalize(value: unknown) {
  return Array.isArray(value) ? value.map(String).sort() : [String(value)].sort();
}

export async function POST(request: Request, { params }: { params: Promise<{ attemptId: string }> }) {
  const userId = await getSessionUserId();
  if (!userId) return NextResponse.json({ error: "Non authentifié" }, { status: 401 });
  const { attemptId } = await params;
  const body = await request.json();
  const submittedAnswers = body?.answers ?? {};

  const attempt = await prisma.examAttempt.findUnique({
    where: { id: attemptId },
    include: { professional: true, assessment: { include: { questions: true } } },
  });
  if (!attempt || attempt.professional.userId !== userId) return NextResponse.json({ error: "Tentative introuvable" }, { status: 404 });
  if (attempt.status !== "IN_PROGRESS") return NextResponse.json({ error: "Tentative déjà soumise" }, { status: 409 });

  let earned = 0;
  let total = 0;
  const answers = attempt.assessment.questions.map((q) => {
    total += q.points;
    const selected = normalize(submittedAnswers[q.id] ?? []);
    const expected = normalize(q.correctAnswers);
    const correct = selected.length === expected.length && selected.every((v, i) => v === expected[i]);
    if (correct) earned += q.points;
    return { questionId: q.id, selectedAnswers: selected, correct, pointsAwarded: correct ? q.points : 0 };
  });

  const score = total === 0 ? 0 : Math.round((earned / total) * 100);
  const passed = score >= attempt.assessment.passingScore;

  await prisma.$transaction([
    prisma.examAnswer.createMany({ data: answers.map((a) => ({ ...a, attemptId: attempt.id })) }),
    prisma.examAttempt.update({ where: { id: attempt.id }, data: { status: "GRADED", score, passed, submittedAt: new Date() } }),
    prisma.assessmentResult.create({ data: { assessmentId: attempt.assessmentId, professionalId: attempt.professionalId, score, passed, attempt: attempt.attemptNumber } }),
  ]);

  const certification = passed ? await issueCertificationIfEligible(attempt.professionalId, attempt.assessmentId, score) : null;
  return NextResponse.json({ score, passed, passingScore: attempt.assessment.passingScore, certification });
}
