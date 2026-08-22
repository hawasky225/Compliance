import Link from "next/link";
import { requireAdmin } from "@/lib/admin";
import { prisma } from "@/lib/prisma";

export default async function AdminCertificationsPage() {
  await requireAdmin();
  const schemes = await prisma.certificationScheme.findMany({ include: { _count: { select: { certifications: true, assessments: true } } }, orderBy: { code: 'asc' } });
  return <main className="page-shell"><div className="page-head"><div><p className="eyebrow">ADMINISTRATION</p><h1>Schémas de certification</h1><p>Paramètres officiels des certifications Compliance.</p></div><Link className="outline-btn" href="/admin">← Tableau de bord Admin</Link></div><div className="grid-3">{schemes.map(s => <article className="card" key={s.id}><div className="badge">{s.active ? 'ACTIF' : 'INACTIF'}</div><h3>{s.code}</h3><strong>{s.title}</strong><p>{s.description}</p><div className="meta-row"><span>Validité {s.validityMonths} mois</span><span>Seuil {s.passingScore}%</span><span>{s.maxAttempts} tentatives</span></div><div className="meta-row"><span>{s._count.assessments} examens</span><span>{s._count.certifications} certificats</span></div></article>)}</div></main>;
}
