import Link from "next/link";
import { AppShell } from "@/components/app-shell";
import { certifications, courses, professional } from "@/lib/demo";

export default function Dashboard(){
  const expiring = certifications.find(c=>c.status !== "Actif")!;
  return <AppShell>
    <div className="page-head"><div><p className="eyebrow">22 AOÛT 2026</p><h1>Bonjour, Moussa 👋</h1><p>Voici l’état de votre parcours professionnel.</p></div><Link className="primary-btn" href="/passeport">Voir mon passeport</Link></div>
    <section className="stat-grid">
      <div className="stat-card"><span>Certifications actives</span><strong>3</strong><small>+1 cette année</small></div>
      <div className="stat-card"><span>Formations terminées</span><strong>2</strong><small>42 heures validées</small></div>
      <div className="stat-card"><span>Score moyen</span><strong>{professional.average}%</strong><small>Très bon niveau</small></div>
      <div className="stat-card warning"><span>À renouveler</span><strong>1</strong><small>Dans les 90 jours</small></div>
    </section>
    <section className="dashboard-grid">
      <article className="panel"><p className="eyebrow">CONTINUER À APPRENDRE</p><h2>{courses[0].title}</h2><p>Maîtrisez les méthodes d’analyse, de recherche des causes et d’actions correctives.</p><div className="progress"><i style={{width:`${courses[0].progress}%`}}/></div><b>{courses[0].progress}% terminé</b><Link className="dark-btn" href="/formations">Continuer la formation</Link></article>
      <article className="panel expiry"><p className="eyebrow">PROCHAINE ÉCHÉANCE</p><h2>{expiring.title}</h2><p>Expire le <strong>{expiring.expires}</strong></p><span className="status warning">88 jours restants</span><Link className="outline-btn" href="/certifications">Préparer le renouvellement</Link></article>
    </section>
    <section className="panel"><div className="section-head"><h2>Certifications récentes</h2><Link href="/certifications">Voir toutes</Link></div>{certifications.map(c=><div className="cert-row" key={c.code}><div><strong>{c.title}</strong><small>{c.code}</small></div><span>{c.expires}</span><span className={`status ${c.tone}`}>{c.status}</span></div>)}</section>
  </AppShell>;
}
