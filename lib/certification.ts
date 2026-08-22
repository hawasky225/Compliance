import crypto from "node:crypto";
import { prisma } from "@/lib/prisma";

export async function issueCertificationIfEligible(professionalId: string, assessmentId: string, score: number) {
  const assessment = await prisma.assessment.findUnique({ where: { id: assessmentId }, include: { scheme: true } });
  if (!assessment?.scheme || score < assessment.passingScore) return null;

  const existing = await prisma.certification.findFirst({
    where: { professionalId, schemeId: assessment.scheme.id, status: { in: ["ACTIVE", "EXPIRING"] } },
  });
  if (existing) return existing;

  const issuedAt = new Date();
  const expiresAt = new Date(issuedAt);
  expiresAt.setMonth(expiresAt.getMonth() + assessment.scheme.validityMonths);
  const suffix = crypto.randomBytes(3).toString("hex").toUpperCase();
  const certificateNumber = `${assessment.scheme.code}-${issuedAt.getFullYear()}-${suffix}`;

  return prisma.certification.create({
    data: {
      certificateNumber,
      professionalId,
      schemeId: assessment.scheme.id,
      status: "ACTIVE",
      issuedAt,
      expiresAt,
    },
  });
}
