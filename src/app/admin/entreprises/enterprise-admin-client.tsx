"use client";

import Link from "next/link";
import { FormEvent, useState } from "react";
import { useRouter } from "next/navigation";

type O = { id:string; name:string; slug:string; industry:string; country?:string; active:boolean; members:any[]; professionals:any[] };

export default function EnterpriseAdminClient({organizations}:{organizations:O[]}) {
  const router = useRouter();
  const [open,setOpen] = useState(false);
  const [error,setError] = useState("");

  async function create(e:FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setError("");
    const form=e.currentTarget;
    const body=Object.fromEntries(new FormData(form).entries());
    const res=await fetch("/api/admin/organizations",{method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify(body)});
    if(!res.ok){const data=await res.json().catch(()=>({}));setError(data.error||"Impossible de créer l’entreprise.");return;}
    setOpen(false);form.reset();router.refresh();
  }

  return <>
    <div className="enterprise-hero">
      <div><span className="enterprise-icon">▦</span><h2>Portail Entreprise</h2><p>Chaque entreprise dispose d’un espace cloisonné. Gérez ses accès, rattachez ses professionnels et contrôlez les droits de consultation et de vérification.</p></div>
      <button className="primary-btn" onClick={()=>setOpen(!open)}>＋ Nouvelle entreprise</button>
    </div>
    {error&&<div className="admin-alert error">{error}</div>}
    {open&&<form className="enterprise-create" onSubmit={create}><input name="name" placeholder="Nom de l’entreprise" required/><input name="country" placeholder="Pays" defaultValue="Côte d’Ivoire"/><input name="industry" placeholder="Secteur" defaultValue="MINING"/><button className="primary-btn">Créer l’espace</button></form>}
    <div className="enterprise-grid">{organizations.map(o=><article className="enterprise-card" key={o.id}>
      <div className="enterprise-card-head"><div className="company-logo">{o.name.slice(0,2).toUpperCase()}</div><span className={`access-pill ${o.active?"active":"disabled"}`}>{o.active?"Actif":"Inactif"}</span></div>
      <h3>{o.name}</h3><p>{o.industry} · {o.country||"Pays non défini"}</p>
      <div className="company-kpis"><div><b>{o.professionals.length}</b><span>Professionnels</span></div><div><b>{o.members.length}</b><span>Accès portail</span></div><div><b>{o.professionals.reduce((n,p)=>n+p.certifications.length,0)}</b><span>Certifications</span></div></div>
      <div className="permission-preview"><strong>Droits disponibles</strong><span>✓ Consulter les profils rattachés</span><span>✓ Vérifier les certifications</span><span>✓ Administrer les accès autorisés</span></div>
      <Link className="outline-btn wide" href={`/admin/entreprises/${o.id}`}>Gérer l’entreprise →</Link>
    </article>)}</div>
    {organizations.length===0&&<div className="premium-empty"><b>Aucune entreprise configurée</b><span>Créez le premier espace client pour commencer le déploiement B2B.</span></div>}
  </>;
}
