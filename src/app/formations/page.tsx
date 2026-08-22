import Link from "next/link";
import { redirect } from "next/navigation";
import { AppShell } from "@/components/app-shell";
import { getSessionUserId } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export default async function Formations() {
  const userId = await getSessionUserId();
  if (!userId) redirect("/connexion");
  const professional = await prisma.professional.findUnique({ where: { userId }, include: { user: true, enrollments: true } });
  if (!professional) redirect("/onboarding");
  const courses = await prisma.course.findMany({ where: { published: true }, include: { assessments: { where: { published: true }, select: { id: true } } }, orderBy: { title: "asc" } });
  const enrollmentByCourse = new Map(professional.enrollments.map((enrollment) => [enrollment.courseId, enrollment]));

  return <AppShell userName={professional.user.name} jobTitle={professional.jobTitle}><div className="page-head"><div><p className="eyebrow">APPRENTISSAGE</p><h1>Mes formations</h1><p>Développez et maintenez vos compétences professionnelles.</p></div></div>
  <div className="course-grid">{courses.map((course,i)=>{ const enrollment = enrollmentByCourse.get(course.id); const progress = enrollment?.progress ?? 0; const status = enrollment?.status ?? "DISPONIBLE"; return <article className="course-card" key={course.id}><div className={`course-cover cover-${i % 3}`}><span>{i%3===0?'⛑':i%3===1?'◈':'⛏'}</span><small>Mines & HSE</small></div><div className="course-body"><span className="level-pill">{course.level}</span><h3>{course.title}</h3><p>{Math.round(course.durationMinutes / 60)} h · Formation professionnelle</p><div className="progress"><i style={{width:`${progress}%`}}/></div><div className="section-head"><b>{status}</b><span>{progress}%</span></div>{course.assessments[0] ? <Link className="dark-btn wide" href={`/examens/${course.assessments[0].id}`}>{status === "COMPLETED" ? "Revoir l’examen" : "Voir l’examen"}</Link> : <span className="outline-btn">Examen à venir</span>}</div></article>})}{courses.length === 0 && <article className="card"><h3>Aucune formation publiée</h3><p>Le catalogue sera disponible prochainement.</p></article>}</div></AppShell>;
}
