import Link from "next/link";
import { requireAdmin } from "@/lib/admin";
import { prisma } from "@/lib/prisma";

function monthKey(date: Date) { return `${date.getFullYear()}-${String(date.getMonth()+1).padStart(2,"0")}`; }
function monthLabel(date: Date) { return date.toLocaleDateString("fr-FR", { month:"short" }).replace(".",""); }

export default async function AdminPage() {
  await requireAdmin();
  const now = new Date();
  const in90 = new Date(now); in90.setDate(in90.getDate() + 90);
  const sixMonthsAgo = new Date(now.getFullYear(), now.getMonth() - 5, 1);

  const [professionals, courses, schemes, activeCerts, expiring, expired, attempts, results, recentCerts, recentResults] = await Promise.all([
    prisma.professional.count(),
    prisma.course.count(),
    prisma.certificationScheme.count(),
    prisma.certification.count({ where: { status: "ACTIVE" } }),
    prisma.certification.count({ where: { status: { in: ["ACTIVE","EXPIRING"] }, expiresAt: { lte: in90, gte: now } } }),
    prisma.certification.count({ where: { status: "EXPIRED" } }),
    prisma.examAttempt.count(),
    prisma.assessmentResult.findMany({ select: { score:true, passed:true, completedAt:true } }),
    prisma.certification.findMany({ where:{ createdAt:{ gte:sixMonthsAgo } }, orderBy:{ createdAt:"asc" }, include:{ scheme:true, professional:{ include:{ user:true } } } }),
    prisma.assessmentResult.findMany({ take:8, orderBy:{ completedAt:"desc" }, include:{ assessment:true, professional:{ include:{ user:true } } } }),
  ]);

  const passCount = results.filter(r => r.passed).length;
  const passRate = results.length ? Math.round(passCount / results.length * 100) : 0;
  const avgScore = results.length ? Math.round(results.reduce((s,r)=>s+r.score,0)/results.length) : 0;
  const totalCertStatus = Math.max(activeCerts + expiring + expired, 1);
  const activePct = Math.round(activeCerts / totalCertStatus * 100);
  const expiringPct = Math.round(expiring / totalCertStatus * 100);
  const expiredPct = Math.max(0, 100 - activePct - expiringPct);

  const months = Array.from({length:6},(_,i)=>new Date(now.getFullYear(), now.getMonth()-5+i, 1));
  const certByMonth = new Map<string,number>();
  const examByMonth = new Map<string,number>();
  recentCerts.forEach(c=>certByMonth.set(monthKey(c.createdAt),(certByMonth.get(monthKey(c.createdAt))||0)+1));
  results.filter(r=>r.completedAt>=sixMonthsAgo).forEach(r=>examByMonth.set(monthKey(r.completedAt),(examByMonth.get(monthKey(r.completedAt))||0)+1));
  const maxTrend = Math.max(1,...months.flatMap(m=>[certByMonth.get(monthKey(m))||0, examByMonth.get(monthKey(m))||0]));

  return <>
    <div className="admin-page-head"><div><p className="eyebrow">TABLEAU DE BORD</p><h1>Pilotage Compliance</h1><p>Vue consolidée des compétences, examens et certifications.</p></div><div className="admin-head-actions"><Link className="outline-btn" href="/admin/professionnels">Voir les professionnels</Link><Link className="primary-btn" href="/admin/formations">Gérer les formations</Link></div></div>

    <section className="admin-kpi-grid">
      <article className="admin-kpi"><span className="kpi-icon">♙</span><div><small>Professionnels</small><strong>{professionals}</strong><em>inscrits sur la plateforme</em></div></article>
      <article className="admin-kpi"><span className="kpi-icon">✓</span><div><small>Certifications actives</small><strong>{activeCerts}</strong><em>{expiring} à surveiller à 90 jours</em></div></article>
      <article className="admin-kpi"><span className="kpi-icon">◎</span><div><small>Taux de réussite</small><strong>{passRate}%</strong><em>{results.length} résultat(s) enregistré(s)</em></div></article>
      <article className="admin-kpi"><span className="kpi-icon">↗</span><div><small>Score moyen</small><strong>{avgScore}%</strong><em>{attempts} tentative(s) d’examen</em></div></article>
    </section>

    <section className="admin-analytics-grid">
      <article className="admin-panel trend-panel"><div className="admin-panel-head"><div><h2>Activité de certification</h2><p>Certificats délivrés et examens réalisés sur 6 mois</p></div><span className="soft-badge">6 derniers mois</span></div><div className="trend-chart">{months.map(m=>{const certs=certByMonth.get(monthKey(m))||0;const exams=examByMonth.get(monthKey(m))||0;return <div className="trend-col" key={monthKey(m)}><div className="trend-bars"><i className="bar exams" style={{height:`${Math.max(4,exams/maxTrend*100)}%`}} title={`${exams} examens`}/><i className="bar certs" style={{height:`${Math.max(4,certs/maxTrend*100)}%`}} title={`${certs} certifications`}/></div><small>{monthLabel(m)}</small></div>})}</div><div className="chart-legend"><span><i className="legend-dot exams"/>Examens</span><span><i className="legend-dot certs"/>Certifications</span></div></article>

      <article className="admin-panel status-panel"><div className="admin-panel-head"><div><h2>État des certifications</h2><p>Répartition du portefeuille actuel</p></div></div><div className="donut-wrap"><div className="donut" style={{background:`conic-gradient(#1f7a57 0 ${activePct}%, #e2a63b ${activePct}% ${activePct+expiringPct}%, #c9d1cc ${activePct+expiringPct}% 100%)`}}><div><strong>{activeCerts+expiring+expired}</strong><span>Total</span></div></div></div><div className="status-list"><div><span><i className="legend-dot active"/>Actives</span><strong>{activeCerts}</strong></div><div><span><i className="legend-dot warning"/>À renouveler</span><strong>{expiring}</strong></div><div><span><i className="legend-dot expired"/>Expirées</span><strong>{expired}</strong></div></div></article>
    </section>

    <section className="admin-bottom-grid">
      <article className="admin-panel"><div className="admin-panel-head"><div><h2>Modules de gestion</h2><p>Accès rapide aux opérations administratives</p></div></div><div className="admin-module-grid"><Link href="/admin/formations"><b>Formations & examens</b><span>{courses} formations · gérer le catalogue</span></Link><Link href="/admin/certifications"><b>Certifications</b><span>{schemes} schémas · validité et seuils</span></Link><Link href="/admin/professionnels"><b>Professionnels</b><span>{professionals} profils · résultats et échéances</span></Link><Link href="/profil"><b>Profil & sécurité</b><span>Mot de passe et paramètres du compte</span></Link></div></article>
      <article className="admin-panel"><div className="admin-panel-head"><div><h2>Activité récente</h2><p>Derniers résultats d’examen</p></div></div><div className="activity-table">{recentResults.map(r=><div className="activity-row" key={r.id}><div className={`activity-icon ${r.passed?"ok":"ko"}`}>{r.passed?"✓":"×"}</div><div><strong>{r.professional.user.name}</strong><small>{r.assessment.title}</small></div><b>{r.score}%</b><span className={`status ${r.passed?"success":"warning"}`}>{r.passed?"Réussi":"Échoué"}</span></div>)}{recentResults.length===0&&<p>Aucune activité enregistrée.</p>}</div></article>
    </section>
  </>;
}
