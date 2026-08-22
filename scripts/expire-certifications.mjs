import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();
const now = new Date();
const in90 = new Date(now); in90.setDate(in90.getDate() + 90);

try {
  const expired = await prisma.certification.updateMany({
    where: { status: { in: ['ACTIVE','EXPIRING'] }, expiresAt: { lt: now } },
    data: { status: 'EXPIRED' },
  });
  const expiring = await prisma.certification.updateMany({
    where: { status: 'ACTIVE', expiresAt: { gte: now, lte: in90 } },
    data: { status: 'EXPIRING' },
  });
  console.log(JSON.stringify({ expired: expired.count, expiring: expiring.count, processedAt: now.toISOString() }));
} finally {
  await prisma.$disconnect();
}
