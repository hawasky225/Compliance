import { AppShell } from "@/components/app-shell";
import { certifications } from "@/lib/demo";

export default function Certifications(){
  return <AppShell><div className="page-head"><div><p className="eyebrow">QUALIFICATIONS</p><h1>Mes certifications</h1><p>Consultez, vérifiez et renouvelez vos certifications professionnelles.</p></div><button className="primary-btn">Explorer les certifications</button></div>
  <div className="cert-summary"><div><strong>3</strong><span>Actives</span></div><div><strong>1</strong><span>À renouveler</span></div><div><strong>100%</strong><span>Identité vérifiée</span></div></div>
  <div className="cert-card-grid">{certifications.map(c=><article className="credential-card" key={c.code}><div className="section-head"><span className="seal">✓</span><span className={`status ${c.tone}`}>{c.status}</span></div><p className="eyebrow">{c.short}</p><h3>{c.title}</h3><div className="credential-id">N° {c.code}</div><div className="date-grid"><div><small>Délivrée le</small><strong>{c.issued}</strong></div><div><small>Valable jusqu’au</small><strong>{c.expires}</strong></div></div><div className="actions"><LinkButton href={`/verification/${c.code}`} label="Vérifier" />{c.status!=="Actif"&&<button className="dark-btn">Renouveler</button>}</div></article>)}</div></AppShell>;
}

function LinkButton({href,label}:{href:string;label:string}){ return <a className="outline-btn" href={href}>{label}</a>; }
