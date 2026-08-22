import Link from "next/link";
import { redirect } from "next/navigation";
import { getSessionUserId } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export default async function MesCertificationsPage() {
  const userId = await getSessionUserId();
  if (!userId) redirect('/connexion');
  const professional = await prisma.professional.findUnique({
    where: { userId },
    include: { certifications: { include: { scheme: true }, orderBy: { issuedAt: 'desc' } } },
  });
  if (!professional) redirect('/onboarding');

  return <main className="page-shell"><div className="page-head"><div><p className="eyebrow">PASSEPORT PROFESSIONNEL</p><h1>Mes certifications</h1><p>Vos qualifications actives, échéances et preuves vérifiables.</p></div><Link className="button" href="/examens">Passer un examen</Link></div><div className="grid-3">{professional.certifications.map((cert) => <article className="card" key={cert.id}><div className="badge">{cert.status}</div><h3>{cert.scheme.title}</h3><p>{cert.certificateNumber}</p><div className="meta-row"><span>Délivré : {cert.issuedAt?.toLocaleDateString('fr-FR') ?? '—'}</span><span>Expire : {cert.expiresAt?.toLocaleDateString('fr-FR') ?? '—'}</span></div><Link href={`/verifier/${cert.verificationToken}`}>Vérifier le certificat →</Link></article>)}{professional.certifications.length === 0 && <article className="card"><h3>Aucune certification délivrée</h3><p>Réussissez un examen de certification pour alimenter votre passeport.</p><Link className="button" href="/examens">Voir les examens</Link></article>}</div></main>;
}
