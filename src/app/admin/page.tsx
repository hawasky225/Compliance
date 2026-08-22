import Link from "next/link";
import { requireAdmin } from "@/lib/admin";
import { prisma } from "@/lib/prisma";

export default async function AdminPage() {
  await requireAdmin();
  const now = new Date();
  const in90 = new Date(now); in90.setDate(in90.getDate() + 90);
  const [professionals, courses, schemes, activeCerts, expiring, attempts] = await Promise.all([
    prisma.professional.count(), prisma.course.count(), prisma.certificationScheme.count(),
    prisma.certification.count({ where: { status: 'ACTIVE' } }),
    prisma.certification.count({ where: { status: { in: ['ACTIVE','EXPIRING'] }, expiresAt: { lte: in90, gte: now } } }),
    prisma.examAttempt.count(),
  ]);
  const recent = await prisma.certification.findMany({ take: 8, orderBy: { createdAt: 'desc' }, include: { scheme: true, professional: { include: { user: true } } } });

  return <main className="page-shell"><div className="page-head"><div><p className="eyebrow">ADMINISTRATION</p><h1>Pilotage Compliance</h1><p>Gérez les formations, examens, professionnels et certifications.</p></div></div>
  <div className="grid-3"><article className="card"><strong>{professionals}</strong><span>Professionnels</span></article><article className="card"><strong>{activeCerts}</strong><span>Certifications actives</span></article><article className="card"><strong>{expiring}</strong><span>Échéances à 90 jours</span></article><article className="card"><strong>{courses}</strong><span>Formations</span></article><article className="card"><strong>{schemes}</strong><span>Schémas de certification</span></article><article className="card"><strong>{attempts}</strong><span>Tentatives d’examen</span></article></div>
  <div className="grid-3"><Link className="card" href="/admin/certifications"><h3>Schémas de certification</h3><p>Seuils, validité, tentatives et publication.</p></Link><Link className="card" href="/admin/formations"><h3>Formations & examens</h3><p>Catalogue, publication et banque de questions.</p></Link><Link className="card" href="/admin/professionnels"><h3>Professionnels</h3><p>Résultats, certificats et échéances.</p></Link></div>
  <section className="card"><h2>Dernières certifications</h2>{recent.map(c => <div className="meta-row" key={c.id}><span>{c.professional.user.name}</span><span>{c.scheme.code}</span><span>{c.certificateNumber}</span><span>{c.status}</span></div>)}</section></main>;
}
