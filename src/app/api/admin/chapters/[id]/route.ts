import { NextResponse } from "next/server";
import { requireAdmin } from "@/lib/admin";
import { prisma } from "@/lib/prisma";

export async function PATCH(req: Request, { params }: { params: Promise<{ id: string }> }) {
  await requireAdmin();
  const { id } = await params;
  const b = await req.json();
  const data: Record<string, unknown> = {};
  for (const key of ["title","summary","body","pdfUrl","videoUrl"] as const) if (key in b) data[key] = String(b[key] || "").trim() || null;
  if ("durationMinutes" in b) data.durationMinutes = Math.max(1, Number(b.durationMinutes) || 1);
  if ("sortOrder" in b) data.sortOrder = Number(b.sortOrder) || 0;
  if ("required" in b) data.required = Boolean(b.required);
  if ("published" in b) data.published = Boolean(b.published);
  if ("contentType" in b && ["TEXT","PDF","VIDEO","MIXED"].includes(String(b.contentType))) data.contentType = b.contentType;
  const chapter = await prisma.chapter.update({ where: { id }, data });
  return NextResponse.json(chapter);
}

export async function DELETE(_: Request, { params }: { params: Promise<{ id: string }> }) {
  await requireAdmin();
  const { id } = await params;
  await prisma.chapter.delete({ where: { id } });
  return NextResponse.json({ ok: true });
}
