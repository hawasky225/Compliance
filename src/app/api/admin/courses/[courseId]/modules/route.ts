import { NextResponse } from "next/server";
import { requireAdmin } from "@/lib/admin";
import { prisma } from "@/lib/prisma";

export async function POST(req: Request, { params }: { params: Promise<{ courseId: string }> }) {
  await requireAdmin();
  const { courseId } = await params;
  const b = await req.json();
  const title = String(b.title || "").trim();
  if (!title) return NextResponse.json({ error: "Titre du module requis" }, { status: 400 });
  const max = await prisma.courseModule.aggregate({ where: { courseId }, _max: { sortOrder: true } });
  const module = await prisma.courseModule.create({
    data: {
      courseId,
      title,
      description: String(b.description || "").trim() || null,
      sortOrder: Number.isFinite(Number(b.sortOrder)) ? Number(b.sortOrder) : (max._max.sortOrder ?? -1) + 1,
      published: b.published !== false,
    },
  });
  return NextResponse.json(module, { status: 201 });
}
