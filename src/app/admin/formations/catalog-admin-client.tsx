"use client";

import { FormEvent, useState } from "react";
import { useRouter } from "next/navigation";

type Scheme = { id:string; code:string; title:string };
type Question = { id:string; prompt:string; options:unknown; correctAnswers:unknown; points:number };
type Assessment = { id:string; title:string; passingScore:number; maxAttempts:number; durationMinutes:number; published:boolean; schemeId:string|null; questions:Question[]; _count:{attempts:number} };
type Course = { id:string; title:string; description:string|null; durationMinutes:number; level:string; published:boolean; assessments:Assessment[] };

async function api(url:string, options:RequestInit) {
  const res = await fetch(url, { ...options, headers:{"Content-Type":"application/json", ...(options.headers||{})} });
  const data = await res.json().catch(()=>({}));
  if (!res.ok) throw new Error(data.error || "Une erreur est survenue.");
  return data;
}

export default function CatalogAdminClient({ courses, schemes }:{ courses:Course[]; schemes:Scheme[] }) {
  const router = useRouter();
  const [error,setError] = useState("");
  const [busy,setBusy] = useState(false);

  async function run(task:()=>Promise<unknown>) {
    setError(""); setBusy(true);
    try { await task(); router.refresh(); }
    catch (e) { setError(e instanceof Error ? e.message : "Une erreur est survenue."); }
    finally { setBusy(false); }
  }

  async function createCourse(e:FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const form=e.currentTarget; const body=Object.fromEntries(new FormData(form).entries());
    await run(()=>api("/api/admin/courses",{method:"POST",body:JSON.stringify({...body,durationMinutes:Number(body.durationMinutes),published:false})}));
    form.reset();
  }

  return <div className="catalog-admin">
    {error && <div className="admin-alert error">{error}</div>}
    <section className="admin-panel premium-create-card">
      <div className="admin-panel-head"><div><p className="eyebrow">NOUVELLE FORMATION</p><h2>Créer un programme</h2><p>Ajoutez une formation, puis rattachez-y un examen et sa banque de questions.</p></div><span className="soft-badge">Brouillon par défaut</span></div>
      <form className="premium-form course-create-form" onSubmit={createCourse}>
        <label><span>Titre</span><input name="title" placeholder="Ex. Gestion des risques critiques" required /></label>
        <label><span>Niveau</span><select name="level" defaultValue="Fondation"><option>Fondation</option><option>Praticien</option><option>Avancé</option><option>Expert</option></select></label>
        <label><span>Durée (minutes)</span><input name="durationMinutes" type="number" min="1" defaultValue="120" required /></label>
        <label className="span-2"><span>Description</span><textarea name="description" rows={3} placeholder="Objectifs, compétences visées et périmètre de la formation." /></label>
        <button disabled={busy} className="primary-btn" type="submit">＋ Créer la formation</button>
      </form>
    </section>

    <div className="catalog-toolbar"><div><h2>Catalogue</h2><p>{courses.length} formation(s) configurée(s)</p></div><div className="catalog-filters"><span className="soft-badge">{courses.filter(c=>c.published).length} publiées</span><span className="soft-badge">{courses.filter(c=>!c.published).length} brouillons</span></div></div>

    <div className="premium-course-list">{courses.map(course=><article className="premium-course-card" key={course.id}>
      <div className="course-card-head"><div><div className={`status-dot ${course.published?"live":"draft"}`}/><div><small>{course.published?"PUBLIÉ":"BROUILLON"}</small><h3>{course.title}</h3></div></div><button disabled={busy} className="outline-btn" onClick={()=>run(()=>api(`/api/admin/courses/${course.id}`,{method:"PATCH",body:JSON.stringify({published:!course.published})}))}>{course.published?"Dépublier":"Publier"}</button></div>
      <p>{course.description || "Aucune description renseignée."}</p>
      <div className="course-metadata"><span>◷ {course.durationMinutes} min</span><span>◇ {course.level}</span><span>▣ {course.assessments.length} examen(s)</span><span>◎ {course.assessments.reduce((s,a)=>s+a._count.attempts,0)} tentative(s)</span></div>

      <details className="admin-details"><summary>Modifier les informations</summary><form className="premium-form compact-form" onSubmit={async e=>{e.preventDefault();const form=e.currentTarget;const body=Object.fromEntries(new FormData(form).entries());await run(()=>api(`/api/admin/courses/${course.id}`,{method:"PATCH",body:JSON.stringify({...body,durationMinutes:Number(body.durationMinutes)})}))}}><label><span>Titre</span><input name="title" defaultValue={course.title}/></label><label><span>Niveau</span><input name="level" defaultValue={course.level}/></label><label><span>Durée</span><input name="durationMinutes" type="number" min="1" defaultValue={course.durationMinutes}/></label><label className="span-2"><span>Description</span><textarea name="description" defaultValue={course.description||""}/></label><button className="primary-btn" disabled={busy}>Enregistrer</button></form></details>

      <div className="exam-list">{course.assessments.map(a=><div className="exam-admin-card" key={a.id}><div className="exam-title-row"><div><span className={`status ${a.published?"success":"warning"}`}>{a.published?"Publié":"Brouillon"}</span><strong>{a.title}</strong><small>{a.questions.length} question(s) · seuil {a.passingScore}% · {a.maxAttempts} tentative(s) · {a.durationMinutes} min</small></div><button disabled={busy} className="mini-action" onClick={()=>run(()=>api(`/api/admin/assessments/${a.id}`,{method:"PATCH",body:JSON.stringify({published:!a.published})}))}>{a.published?"Masquer":"Publier"}</button></div>
        <details className="question-bank"><summary>Banque de questions <b>{a.questions.length}</b></summary><div className="question-list">{a.questions.map((q,i)=><div className="question-admin-row" key={q.id}><span>{i+1}</span><div><strong>{q.prompt}</strong><small>{Array.isArray(q.options)?q.options.join(" · "):""}</small></div><button disabled={busy} className="danger-link" onClick={()=>run(()=>api(`/api/admin/questions/${q.id}`,{method:"DELETE"}))}>Supprimer</button></div>)}</div><QuestionForm assessmentId={a.id} busy={busy} run={run}/></details>
      </div>)}
      {course.assessments.length===0&&<div className="empty-inline">Aucun examen configuré pour cette formation.</div>}
      <details className="admin-details"><summary>＋ Ajouter un examen</summary><ExamForm courseId={course.id} schemes={schemes} busy={busy} run={run}/></details>
    </article>)}</div>
  </div>;
}

function ExamForm({courseId,schemes,busy,run}:{courseId:string;schemes:Scheme[];busy:boolean;run:(task:()=>Promise<unknown>)=>Promise<void>}) {
  return <form className="premium-form compact-form" onSubmit={async e=>{e.preventDefault();const form=e.currentTarget;const body=Object.fromEntries(new FormData(form).entries());await run(()=>api(`/api/admin/courses/${courseId}/assessments`,{method:"POST",body:JSON.stringify({...body,passingScore:Number(body.passingScore),maxAttempts:Number(body.maxAttempts),durationMinutes:Number(body.durationMinutes),published:false})}));form.reset();}}><label className="span-2"><span>Titre de l’examen</span><input name="title" placeholder="Examen final" required/></label><label><span>Schéma</span><select name="schemeId" defaultValue=""><option value="">Sans certification</option>{schemes.map(s=><option key={s.id} value={s.id}>{s.code} — {s.title}</option>)}</select></label><label><span>Seuil (%)</span><input name="passingScore" type="number" min="0" max="100" defaultValue="75"/></label><label><span>Tentatives</span><input name="maxAttempts" type="number" min="1" defaultValue="2"/></label><label><span>Durée (min)</span><input name="durationMinutes" type="number" min="1" defaultValue="45"/></label><button className="primary-btn" disabled={busy}>Créer l’examen</button></form>;
}

function QuestionForm({assessmentId,busy,run}:{assessmentId:string;busy:boolean;run:(task:()=>Promise<unknown>)=>Promise<void>}) {
  return <form className="premium-form question-form" onSubmit={async e=>{e.preventDefault();const form=e.currentTarget;const fd=new FormData(form);const options=[1,2,3,4].map(i=>String(fd.get(`option${i}`)||"").trim()).filter(Boolean);const correct=String(fd.get("correct")||"").trim();await run(()=>api(`/api/admin/assessments/${assessmentId}/questions`,{method:"POST",body:JSON.stringify({prompt:fd.get("prompt"),options,correctAnswers:[correct],points:1})}));form.reset();}}><label className="span-2"><span>Nouvelle question</span><input name="prompt" placeholder="Saisissez la question" required/></label>{[1,2,3,4].map(i=><label key={i}><span>Réponse {i}</span><input name={`option${i}`} required={i<3}/></label>)}<label><span>Réponse correcte</span><input name="correct" placeholder="Copier exactement la bonne réponse" required/></label><button className="primary-btn" disabled={busy}>Ajouter la question</button></form>;
}
