import { NextResponse } from "next/server";
import { getApiAdmin } from "@/lib/admin-api";
import { prisma } from "@/lib/prisma";

export async function POST(request: Request, { params }: { params: Promise<{ assessmentId: string }> }) {
  if (!await getApiAdmin()) return NextResponse.json({ error: "Accès refusé" }, { status: 403 });
  const { assessmentId } = await params;
  const body = await request.json();
  const prompt = String(body.prompt ?? "").trim();
  const options = Array.isArray(body.options) ? body.options.map((v: unknown) => String(v).trim()).filter(Boolean) : [];
  const correctAnswers = Array.isArray(body.correctAnswers) ? body.correctAnswers.map((v: unknown) => String(v).trim()).filter(Boolean) : [];
  const points = Math.max(1, Number(body.points ?? 1));
  if (!prompt) return NextResponse.json({ error: "La question est requise." }, { status: 400 });
  if (options.length < 2) return NextResponse.json({ error: "Ajoutez au moins deux réponses possibles." }, { status: 400 });
  if (!correctAnswers.length || correctAnswers.some((answer: string) => !options.includes(answer))) return NextResponse.json({ error: "Sélectionnez une réponse correcte valide." }, { status: 400 });
  const sortOrder = await prisma.question.count({ where: { assessmentId } }) + 1;
  const question = await prisma.question.create({ data: { assessmentId, prompt, type: options.length === 2 && options.includes("Vrai") && options.includes("Faux") ? "TRUE_FALSE" : correctAnswers.length > 1 ? "MULTIPLE_CHOICE" : "SINGLE_CHOICE", options, correctAnswers, points, sortOrder } });
  return NextResponse.json({ ok: true, question }, { status: 201 });
}
