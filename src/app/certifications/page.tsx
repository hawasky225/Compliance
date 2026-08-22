import Link from "next/link";
import { redirect } from "next/navigation";
import { AppShell } from "@/components/app-shell";
import { getSessionUserId } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export default async function Certifications() {
  const userId = await getSessionUserId();
  if (!userId) redirect("/connexion");
  const professional = await prisma.professional.findUnique({
    where: { userId },
    include: { user: true, certifications: { include: { scheme: true }, orderBy: { issuedAt: "desc" } } },
  });
  if (!professional) redirect("/onboarding");

  const valid = professional.certifications.filter((cert) => cert.status === "ACTIVE" || cert.status === "EXPIRING").length;
  const renewing = professional.certifications.filter((cert) => cert.status === "EXPIRING").length;

  return <AppShell userName={professional.user.name} jobTitle={professional.jobTitle}><div className="page-head"><div><p className="eyebrow">QUALIFICATIONS</p><h1>Mes certifications</h1><p>Consultez, vérifiez et renouvelez vos certifications professionnelles.</p></div><Link className="primary-btn" href="/examens">Explorer les certifications</Link></div>
  <div className="cert-summary"><div><strong>{valid}</strong><span>Valides</span></div><div><strong>{renewing}</strong><span>À renouveler</span></div><div><strong>{professional.identityVerified ? "100%" : "—"}</strong><span>Identité vérifiée</span></div></div>
  <div className="cert-card-grid">{professional.certifications.map((cert)=><article className="credential-card" key={cert.id}><div className="section-head"><span className="seal">✓</span><span className={`status ${cert.status === "EXPIRING" ? "warning" : ""}`}>{cert.status}</span></div><p className="eyebrow">{cert.scheme.code}</p><h3>{cert.scheme.title}</h3><div className="credential-id">N° {cert.certificateNumber}</div><div className="date-grid"><div><small>Délivrée le</small><strong>{cert.issuedAt?.toLocaleDateString("fr-FR") ?? "—"}</strong></div><div><small>Valable jusqu’au</small><strong>{cert.expiresAt?.toLocaleDateString("fr-FR") ?? "—"}</strong></div></div><div className="actions"><Link className="outline-btn" href={`/verifier/${cert.verificationToken}`}>Vérifier</Link><Link className="dark-btn" href={`/certificats/${cert.verificationToken}`}>Certificat PDF</Link></div></article>)}{professional.certifications.length === 0 && <article className="card"><h3>Aucune certification délivrée</h3><p>Réussissez un examen de certification pour alimenter votre passeport.</p><Link className="dark-btn" href="/examens">Voir les examens</Link></article>}</div></AppShell>;
}
