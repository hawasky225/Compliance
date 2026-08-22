import Link from "next/link";
import { requireAdmin } from "@/lib/admin";
import { prisma } from "@/lib/prisma";

export default async function AdminProfessionnelsPage() {
  await requireAdmin();
  const professionals = await prisma.professional.findMany({ include: { user: true, certifications: { include: { scheme: true } }, attempts: { orderBy: { startedAt: 'desc' }, take: 3, include: { assessment: true } } }, orderBy: { createdAt: 'desc' }, take: 100 });
  return <main className="page-shell"><div className="page-head"><div><p className="eyebrow">ADMINISTRATION</p><h1>Professionnels</h1><p>Résultats, certifications et échéances par personne.</p></div><Link className="outline-btn" href="/admin">← Tableau de bord Admin</Link></div><div className="grid-3">{professionals.map(p => <article className="card" key={p.id}><h3>{p.user.name}</h3><p>{p.jobTitle ?? 'Professionnel minier'} · {p.employer ?? 'Indépendant'}</p><div className="meta-row"><span>{p.professionalId}</span><span>{p.certifications.length} certifications</span></div>{p.certifications.map(c => <div className="meta-row" key={c.id}><span>{c.scheme.code}</span><span>{c.status}</span><span>{c.expiresAt?.toLocaleDateString('fr-FR') ?? '—'}</span></div>)}</article>)}</div></main>;
}
