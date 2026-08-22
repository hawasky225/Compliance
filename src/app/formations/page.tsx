import { AppShell } from "@/components/app-shell";
import { courses } from "@/lib/demo";

export default function Formations(){
  return <AppShell><div className="page-head"><div><p className="eyebrow">APPRENTISSAGE</p><h1>Mes formations</h1><p>Développez et maintenez vos compétences professionnelles.</p></div></div>
  <div className="course-grid">{courses.map((c,i)=><article className="course-card" key={c.id}><div className={`course-cover cover-${i}`}><span>{i===0?'⛑':i===1?'◈':'⛏'}</span><small>{c.category}</small></div><div className="course-body"><span className="level-pill">{c.level}</span><h3>{c.title}</h3><p>{c.duration} · {c.modules} modules</p><div className="progress"><i style={{width:`${c.progress}%`}}/></div><div className="section-head"><b>{c.status}</b><span>{c.progress}%</span></div><button className="dark-btn wide">{c.status==='Terminé'?'Revoir la formation':'Continuer'}</button></div></article>)}</div></AppShell>;
}
