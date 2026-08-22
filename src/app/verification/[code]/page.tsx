import { notFound, redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";

export default async function LegacyVerify({ params }: { params: Promise<{ code: string }> }) {
  const { code } = await params;
  const cert = await prisma.certification.findUnique({ where: { certificateNumber: code } });
  if (!cert) notFound();
  redirect(`/verifier/${cert.verificationToken}`);
}
