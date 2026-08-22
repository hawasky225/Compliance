import { NextResponse } from "next/server";
import { getApiAdmin } from "@/lib/admin-api";
import { prisma } from "@/lib/prisma";

export async function DELETE(_: Request, { params }: { params: Promise<{ questionId: string }> }) {
  if (!await getApiAdmin()) return NextResponse.json({ error: "Accès refusé" }, { status: 403 });
  const { questionId } = await params;
  const answerCount = await prisma.examAnswer.count({ where: { questionId } });
  if (answerCount > 0) return NextResponse.json({ error: "Cette question a déjà été utilisée dans un examen et ne peut pas être supprimée." }, { status: 409 });
  await prisma.question.delete({ where: { id: questionId } });
  return NextResponse.json({ ok: true });
}
