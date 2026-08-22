import Link from "next/link";
import { redirect } from "next/navigation";
import { AppShell } from "@/components/app-shell";
import { getSessionUserId } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export default async function Dashboard() {
  const userId = await getSessionUserId();
  if (!userId) redirect("/connexion");

  const professional = await prisma.professional.findUnique({
    where: { userId },
    include: {
      user: true,
      certifications: { include: { scheme: true }, orderBy: { expiresAt: "asc" } },
      enrollments: { include: { course: true }, orderBy: { startedAt: "desc" } },
      results: { orderBy: { completedAt: "desc" } },
    },
  });
  if (!professional) redirect("/onboarding");

  const activeCertifications = professional.certifications.filter((cert) => cert.status === "ACTIVE" || cert.status === "EXPIRING");
  const expiring = professional.certifications.find((cert) => cert.status === "EXPIRING") ?? professional.certifications.find((cert) => cert.expiresAt && cert.expiresAt > new Date());
  const completedEnrollments = professional.enrollments.filter((enrollment) => enrollment.status === "COMPLETED");
  const trainingMinutes = completedEnrollments.reduce((sum, enrollment) => sum + enrollment.course.durationMinutes, 0);
  const averageScore = professional.results.length ? Math.round(professional.results.reduce((sum, result) => sum + result.score, 0) / professional.results.length) : 0;
  const currentEnrollment = professional.enrollments.find((enrollment) => enrollment.status === "IN_PROGRESS" || enrollment.status === "ENROLLED");

  return <AppShell userName={professional.user.name} jobTitle={professional.jobTitle}>
    <div className="page-head"><div><p className="eyebrow">ESPACE PROFESSIONNEL</p><h1>Bonjour, {professional.user.name.split(" ")[0]} 👋</h1><p>Voici l’état actuel de votre parcours professionnel.</p></div><Link className="primary-btn" href="/passeport">Voir mon passeport</Link></div>
    <section className="stat-grid">
      <div className="stat-card"><span>Certifications valides</span><strong>{activeCertifications.length}</strong><small>{professional.certifications.length} délivrée(s) au total</small></div>
      <div className="stat-card"><span>Formations terminées</span><strong>{completedEnrollments.length}</strong><small>{Math.round(trainingMinutes / 60)} heures validées</small></div>
      <div className="stat-card"><span>Score moyen</span><strong>{averageScore}%</strong><small>{professional.results.length} résultat(s) enregistré(s)</small></div>
      <div className="stat-card warning"><span>À renouveler</span><strong>{professional.certifications.filter((cert) => cert.status === "EXPIRING").length}</strong><small>Échéances dans les 90 jours</small></div>
    </section>
    <section className="dashboard-grid">
      <article className="panel"><p className="eyebrow">PARCOURS DE FORMATION</p>{currentEnrollment ? <><h2>{currentEnrollment.course.title}</h2><p>{currentEnrollment.course.description || "Formation professionnelle Compliance."}</p><div className="progress"><i style={{width:`${currentEnrollment.progress}%`}}/></div><b>{currentEnrollment.progress}% terminé</b><Link className="dark-btn" href="/formations">Continuer la formation</Link></> : <><h2>Développez vos compétences</h2><p>Consultez les formations et examens disponibles pour renforcer votre passeport professionnel.</p><Link className="dark-btn" href="/formations">Voir les formations</Link></>}</article>
      <article className="panel expiry"><p className="eyebrow">PROCHAINE ÉCHÉANCE</p>{expiring ? <><h2>{expiring.scheme.title}</h2><p>Expire le <strong>{expiring.expiresAt?.toLocaleDateString("fr-FR") ?? "—"}</strong></p><span className={`status ${expiring.status === "EXPIRING" ? "warning" : ""}`}>{expiring.status}</span><Link className="outline-btn" href="/certifications">Voir mes certifications</Link></> : <><h2>Aucune échéance à venir</h2><p>Vos certifications seront suivies automatiquement dès leur délivrance.</p><Link className="outline-btn" href="/examens">Voir les examens</Link></>}</article>
    </section>
    <section className="panel"><div className="section-head"><h2>Certifications récentes</h2><Link href="/certifications">Voir toutes</Link></div>{professional.certifications.slice(0, 5).map((cert)=><div className="cert-row" key={cert.id}><div><strong>{cert.scheme.title}</strong><small>{cert.certificateNumber}</small></div><span>{cert.expiresAt?.toLocaleDateString("fr-FR") ?? "—"}</span><span className={`status ${cert.status === "EXPIRING" ? "warning" : ""}`}>{cert.status}</span></div>)}{professional.certifications.length === 0 && <p>Aucune certification n’a encore été délivrée.</p>}</section>
  </AppShell>;
}
