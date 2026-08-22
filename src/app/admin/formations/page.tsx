import Link from "next/link";
import { requireAdmin } from "@/lib/admin";
import { prisma } from "@/lib/prisma";

export default async function AdminFormationsPage() {
  await requireAdmin();
  const courses = await prisma.course.findMany({ include: { assessments: { include: { _count: { select: { questions: true, attempts: true } } } } }, orderBy: { title: 'asc' } });
  return <main className="page-shell"><div className="page-head"><div><p className="eyebrow">ADMINISTRATION</p><h1>Formations & examens</h1><p>Suivi du catalogue pédagogique et des banques de questions.</p></div><Link className="outline-btn" href="/admin">← Tableau de bord Admin</Link></div><div className="grid-3">{courses.map(course => <article className="card" key={course.id}><div className="badge">{course.published ? 'PUBLIÉ' : 'BROUILLON'}</div><h3>{course.title}</h3><p>{course.description}</p><div className="meta-row"><span>{course.durationMinutes} min</span><span>{course.level}</span></div>{course.assessments.map(a => <div key={a.id} className="meta-row"><span>{a.title}</span><span>{a._count.questions} questions</span><span>{a._count.attempts} tentatives</span></div>)}</article>)}</div></main>;
}
