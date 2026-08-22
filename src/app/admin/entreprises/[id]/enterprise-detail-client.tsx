"use client";

import { FormEvent, useState } from "react";
import { useRouter } from "next/navigation";

type User={id:string;name:string;email:string;role:string};
type Member={id:string;role:string;canViewProfiles:boolean;canVerifyCertificates:boolean;canExport:boolean;user:User};
type Professional={id:string;professionalId:string;jobTitle?:string;organizationId?:string;profileVisibleToEmployers:boolean;user:User;certifications:any[]};
type Org={id:string;name:string;industry:string;country?:string;active:boolean;members:Member[];professionals:Professional[]};

export default function EnterpriseDetailClient({organization,users,professionals}:{organization:Org;users:User[];professionals:Professional[]}){
  const router=useRouter();
  const[error,setError]=useState("");
  const[busy,setBusy]=useState(false);
  async function act(body:any){setBusy(true);setError("");try{const r=await fetch(`/api/admin/organizations/${organization.id}`,{method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify(body)});const d=await r.json().catch(()=>({}));if(!r.ok)throw new Error(d.error||"Action impossible");router.refresh();}catch(e){setError(e instanceof Error?e.message:"Action impossible");}finally{setBusy(false)}}
  async function save(e:FormEvent<HTMLFormElement>){e.preventDefault();setBusy(true);setError("");const f=e.currentTarget;const b=Object.fromEntries(new FormData(f).entries());try{const r=await fetch(`/api/admin/organizations/${organization.id}`,{method:"PATCH",headers:{"Content-Type":"application/json"},body:JSON.stringify({...b,active:b.active==="on"})});if(!r.ok)throw new Error("Impossible d’enregistrer les paramètres");router.refresh();}catch(e){setError(e instanceof Error?e.message:"Erreur");}finally{setBusy(false)}}
  const unattached=professionals.filter(p=>!p.organizationId||p.organizationId===organization.id);
  return <div className="enterprise-management-stack">
    {error&&<div className="admin-alert error">{error}</div>}
    <section className="admin-panel"><div className="admin-panel-head"><div><p className="eyebrow">PARAMÈTRES</p><h2>Configuration entreprise</h2></div><span className={`access-pill ${organization.active?"active":"disabled"}`}>{organization.active?"Portail actif":"Portail désactivé"}</span></div>
      <form className="premium-form compact-form" onSubmit={save}><label><span>Nom</span><input name="name" defaultValue={organization.name}/></label><label><span>Secteur</span><input name="industry" defaultValue={organization.industry}/></label><label><span>Pays</span><input name="country" defaultValue={organization.country||""}/></label><label className="toggle-line"><input type="checkbox" name="active" defaultChecked={organization.active}/><span>Autoriser l’accès au portail entreprise</span></label><button className="primary-btn" disabled={busy}>Enregistrer</button></form>
    </section>

    <section className="admin-panel"><div className="admin-panel-head"><div><p className="eyebrow">ACCÈS PORTAIL</p><h2>Utilisateurs entreprise</h2><p>Ajoutez les personnes autorisées à consulter ou vérifier les profils de cette entreprise.</p></div><span className="soft-badge">{organization.members.length} accès</span></div>
      <form className="enterprise-access-form" onSubmit={e=>{e.preventDefault();const f=e.currentTarget;const d=Object.fromEntries(new FormData(f).entries());act({action:"addMember",userId:d.userId,role:d.role,canExport:d.canExport==="on"});}}><select name="userId" required defaultValue=""><option value="" disabled>Sélectionner un utilisateur</option>{users.filter(u=>!organization.members.some(m=>m.user.id===u.id)).map(u=><option key={u.id} value={u.id}>{u.name} · {u.email}</option>)}</select><select name="role" defaultValue="VIEWER"><option value="ADMIN">Admin entreprise</option><option value="VERIFIER">Vérificateur</option><option value="VIEWER">Lecture seule</option></select><label><input type="checkbox" name="canExport"/> Export autorisé</label><button className="primary-btn" disabled={busy}>Ajouter l’accès</button></form>
      <div className="admin-table-card"><table className="premium-table"><thead><tr><th>UTILISATEUR</th><th>RÔLE</th><th>DROITS</th><th>ACTION</th></tr></thead><tbody>{organization.members.map(m=><tr key={m.id}><td><strong>{m.user.name}</strong><small>{m.user.email}</small></td><td><span className="soft-badge">{m.role}</span></td><td>{m.canViewProfiles?"Profils · ":""}{m.canVerifyCertificates?"Certificats · ":""}{m.canExport?"Export":""}</td><td><button className="danger-link" disabled={busy} onClick={()=>act({action:"removeMember",memberId:m.id})}>Retirer</button></td></tr>)}</tbody></table></div>
    </section>

    <section className="admin-panel"><div className="admin-panel-head"><div><p className="eyebrow">EFFECTIF</p><h2>Professionnels rattachés</h2><p>Les entreprises ne voient que les professionnels qui leur sont explicitement rattachés.</p></div><span className="soft-badge">{organization.professionals.length} professionnels</span></div>
      <form className="enterprise-access-form" onSubmit={e=>{e.preventDefault();const f=e.currentTarget;const d=Object.fromEntries(new FormData(f).entries());act({action:"assignProfessional",professionalId:d.professionalId});}}><select name="professionalId" required defaultValue=""><option value="" disabled>Rattacher un professionnel</option>{unattached.filter(p=>p.organizationId!==organization.id).map(p=><option key={p.id} value={p.id}>{p.user.name} · {p.professionalId}</option>)}</select><button className="primary-btn" disabled={busy}>Rattacher</button></form>
      <div className="admin-table-card"><table className="premium-table"><thead><tr><th>PROFESSIONNEL</th><th>FONCTION</th><th>CERTIFICATIONS</th><th>VISIBLE</th><th>ACTION</th></tr></thead><tbody>{organization.professionals.map(p=><tr key={p.id}><td><strong>{p.user.name}</strong><small>{p.professionalId}</small></td><td>{p.jobTitle||"Professionnel minier"}</td><td>{p.certifications.length}</td><td><button className="mini-action" onClick={()=>act({action:"toggleVisibility",professionalId:p.id,visible:!p.profileVisibleToEmployers})}>{p.profileVisibleToEmployers?"Visible":"Masqué"}</button></td><td><button className="danger-link" onClick={()=>act({action:"detachProfessional",professionalId:p.id})}>Détacher</button></td></tr>)}</tbody></table></div>
    </section>
  </div>;
}
