import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function POST(request: Request) {
  const expected = process.env.CRON_SECRET;
  if (!expected || request.headers.get('authorization') !== `Bearer ${expected}`) return NextResponse.json({ error: 'Non autorisé' }, { status: 401 });
  const now = new Date();
  const in90 = new Date(now); in90.setDate(in90.getDate() + 90);
  const expired = await prisma.certification.updateMany({ where: { status: { in: ['ACTIVE','EXPIRING'] }, expiresAt: { lt: now } }, data: { status: 'EXPIRED' } });
  const expiring = await prisma.certification.updateMany({ where: { status: 'ACTIVE', expiresAt: { gte: now, lte: in90 } }, data: { status: 'EXPIRING' } });
  return NextResponse.json({ expired: expired.count, expiring: expiring.count, processedAt: now.toISOString() });
}
