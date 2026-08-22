import { NextResponse } from "next/server";
import { getApiAdmin } from "@/lib/admin-api";
import { prisma } from "@/lib/prisma";

function slugify(value: string) {
  return value.normalize("NFD").replace(/[\u0300-\u036f]/g, "").toLowerCase().trim().replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)/g, "");
}

export async function POST(request: Request) {
  if (!await getApiAdmin()) return NextResponse.json({ error: "Accès refusé" }, { status: 403 });
  const body = await request.json();
  const title = String(body.title ?? "").trim();
  const description = String(body.description ?? "").trim() || null;
  const level = String(body.level ?? "Fondation").trim() || "Fondation";
  const durationMinutes = Number(body.durationMinutes ?? 0);
  const published = Boolean(body.published);
  if (title.length < 3) return NextResponse.json({ error: "Le titre est requis." }, { status: 400 });
  if (!Number.isFinite(durationMinutes) || durationMinutes < 1) return NextResponse.json({ error: "La durée doit être supérieure à 0." }, { status: 400 });

  let slug = slugify(title) || `formation-${Date.now()}`;
  const existing = await prisma.course.findUnique({ where: { slug } });
  if (existing) slug = `${slug}-${Date.now().toString().slice(-6)}`;

  const course = await prisma.course.create({ data: { title, slug, description, durationMinutes, level, published } });
  return NextResponse.json({ ok: true, course }, { status: 201 });
}
