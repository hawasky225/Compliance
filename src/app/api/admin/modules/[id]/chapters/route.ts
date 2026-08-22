import { NextResponse } from "next/server";
import { requireAdmin } from "@/lib/admin";
import { prisma } from "@/lib/prisma";

export async function POST(req: Request, { params }: { params: Promise<{ id: string }> }) {
  await requireAdmin();
  const { id } = await params;
  const b = await req.json();
  const title = String(b.title || "").trim();
  if (!title) return NextResponse.json({ error: "Titre du chapitre requis" }, { status: 400 });
  const max = await prisma.chapter.aggregate({ where: { moduleId: id }, _max: { sortOrder: true } });
  const chapter = await prisma.chapter.create({
    data: {
      moduleId: id,
      title,
      summary: String(b.summary || "").trim() || null,
      body: String(b.body || "").trim() || null,
      contentType: ["TEXT","PDF","VIDEO","MIXED"].includes(String(b.contentType)) ? b.contentType : "TEXT",
      durationMinutes: Math.max(1, Number(b.durationMinutes) || 20),
      pdfUrl: String(b.pdfUrl || "").trim() || null,
      videoUrl: String(b.videoUrl || "").trim() || null,
      sortOrder: Number.isFinite(Number(b.sortOrder)) ? Number(b.sortOrder) : (max._max.sortOrder ?? -1) + 1,
      required: b.required !== false,
      published: b.published !== false,
    },
  });
  return NextResponse.json(chapter, { status: 201 });
}
