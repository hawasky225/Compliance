import { notFound } from "next/navigation";
import { prisma } from "@/lib/prisma";

export default async function VerifyPage({ params }: { params: Promise<{ token: string }> }) {
  const { token } = await params;
  const cert = await prisma.certification.findUnique({
    where: { verificationToken: token },
    include: { scheme: true, professional: { include: { user: true } } },
  });
  if (!cert) notFound();
  const now = new Date();
  const effectiveStatus = cert.status === 'ACTIVE' && cert.expiresAt && cert.expiresAt < now ? 'EXPIRED' : cert.status;

  return <main className="verify-shell"><section className="verify-card"><p className="eyebrow">VÉRIFICATION OFFICIELLE</p><h1>{effectiveStatus === 'ACTIVE' ? 'Certificat vérifié' : 'Statut du certificat'}</h1><div className={`verify-status ${effectiveStatus.toLowerCase()}`}>{effectiveStatus}</div><dl><div><dt>Professionnel</dt><dd>{cert.professional.user.name}</dd></div><div><dt>Certification</dt><dd>{cert.scheme.title}</dd></div><div><dt>Numéro</dt><dd>{cert.certificateNumber}</dd></div><div><dt>Date de délivrance</dt><dd>{cert.issuedAt?.toLocaleDateString('fr-FR') ?? '—'}</dd></div><div><dt>Date d’expiration</dt><dd>{cert.expiresAt?.toLocaleDateString('fr-FR') ?? '—'}</dd></div></dl><p className="muted">Cette page vérifie directement l’enregistrement présent dans le registre Compliance.</p></section></main>;
}
