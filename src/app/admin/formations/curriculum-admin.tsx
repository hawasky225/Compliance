"use client";

import { FormEvent, useState } from "react";
import { useRouter } from "next/navigation";

type Chapter={id:string;title:string;summary:string|null;body:string|null;contentType:string;durationMinutes:number;pdfUrl:string|null;videoUrl:string|null;sortOrder:number;required:boolean;published:boolean};
type Module={id:string;title:string;description:string|null;sortOrder:number;published:boolean;chapters:Chapter[]};
type Course={id:string;title:string;modules:Module[]};

async function api(url:string,options:RequestInit){const r=await fetch(url,{...options,headers:{"Content-Type":"application/json",...(options.headers||{})}});const d=await r.json().catch(()=>({}));if(!r.ok)throw new Error(d.error||"Une erreur est survenue.");return d}

export default function CurriculumAdmin({courses}:{courses:Course[]}){
  const router=useRouter();const[busy,setBusy]=useState(false);const[error,setError]=useState("");
  async function run(fn:()=>Promise<unknown>){setBusy(true);setError("");try{await fn();router.refresh()}catch(e){setError(e instanceof Error?e.message:"Erreur") }finally{setBusy(false)}}
  return <section className="curriculum-admin-section">
    <div className="admin-panel-head"><div><p className="eyebrow">PARCOURS PÉDAGOGIQUES</p><h2>Modules & chapitres</h2><p>Construisez les parcours persistés, imposez l’ordre, ajoutez les ressources PDF/vidéo et définissez les chapitres obligatoires.</p></div></div>
    {error&&<div className="admin-alert error">{error}</div>}
    <div className="curriculum-course-list">{courses.map(course=><article className="curriculum-course" key={course.id}>
      <div className="curriculum-course-head"><div><small>FORMATION</small><h3>{course.title}</h3></div><span className="soft-badge">{course.modules.length} module(s)</span></div>
      <form className="premium-form compact-form" onSubmit={async e=>{e.preventDefault();const f=e.currentTarget;const b=Object.fromEntries(new FormData(f).entries());await run(()=>api(`/api/admin/courses/${course.id}/modules`,{method:"POST",body:JSON.stringify(b)}));f.reset()}}>
        <label><span>Nom du module</span><input name="title" placeholder="Ex. Risques critiques" required/></label><label><span>Ordre</span><input name="sortOrder" type="number" min="0" defaultValue={course.modules.length}/></label><label className="span-2"><span>Description</span><input name="description" placeholder="Objectifs du module"/></label><button className="primary-btn" disabled={busy}>＋ Ajouter le module</button>
      </form>
      <div className="module-admin-list">{course.modules.sort((a,b)=>a.sortOrder-b.sortOrder).map((module,mi)=><div className="module-admin-card" key={module.id}>
        <div className="module-admin-head"><div><span className="module-number">{mi+1}</span><div><strong>{module.title}</strong><small>{module.description||"Sans description"}</small></div></div><span className="soft-badge">{module.chapters.length} chapitre(s)</span></div>
        <div className="chapter-admin-list">{module.chapters.sort((a,b)=>a.sortOrder-b.sortOrder).map((c,ci)=><div className="chapter-admin-item" key={c.id}><div className="chapter-admin-index">{mi+1}.{ci+1}</div><div className="chapter-admin-copy"><strong>{c.title}</strong><small>{c.durationMinutes} min · {c.contentType} · {c.required?"Obligatoire":"Optionnel"} · {c.published?"Publié":"Brouillon"}</small>{c.summary&&<p>{c.summary}</p>}<div className="chapter-resource-tags">{c.pdfUrl&&<span>PDF</span>}{c.videoUrl&&<span>Vidéo</span>}</div></div><button className="danger-link" disabled={busy} onClick={()=>run(()=>api(`/api/admin/chapters/${c.id}`,{method:"DELETE"}))}>Supprimer</button></div>)}</div>
        <details className="admin-details"><summary>＋ Ajouter un chapitre</summary><form className="premium-form compact-form chapter-create-form" onSubmit={async e=>{e.preventDefault();const f=e.currentTarget;const fd=new FormData(f);const b=Object.fromEntries(fd.entries());await run(()=>api(`/api/admin/modules/${module.id}/chapters`,{method:"POST",body:JSON.stringify({...b,durationMinutes:Number(b.durationMinutes),sortOrder:Number(b.sortOrder),required:fd.get("required")==="on",published:fd.get("published")==="on"})}));f.reset()}}>
          <label><span>Titre</span><input name="title" placeholder="Ex. Isolation des énergies (LOTO)" required/></label><label><span>Type</span><select name="contentType" defaultValue="MIXED"><option value="TEXT">Texte</option><option value="PDF">PDF</option><option value="VIDEO">Vidéo</option><option value="MIXED">Mixte</option></select></label><label><span>Durée (min)</span><input name="durationMinutes" type="number" min="1" defaultValue="30"/></label><label><span>Ordre</span><input name="sortOrder" type="number" min="0" defaultValue={module.chapters.length}/></label><label className="span-2"><span>Résumé</span><input name="summary" placeholder="Compétences et objectifs du chapitre"/></label><label className="span-2"><span>Contenu pédagogique</span><textarea name="body" rows={4} placeholder="Texte, consignes, cas pratique, points clés..."/></label><label className="span-2"><span>Lien PDF</span><input name="pdfUrl" type="url" placeholder="https://.../support.pdf"/></label><label className="span-2"><span>Lien vidéo</span><input name="videoUrl" type="url" placeholder="https://.../video"/></label><label className="check-label"><input name="required" type="checkbox" defaultChecked/><span>Chapitre obligatoire</span></label><label className="check-label"><input name="published" type="checkbox" defaultChecked/><span>Publier immédiatement</span></label><button className="primary-btn" disabled={busy}>Créer le chapitre</button>
        </form></details>
      </div>)}</div>
    </article>)}</div>
  </section>
}
