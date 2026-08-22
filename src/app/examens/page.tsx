import Link from "next/link";
import { redirect } from "next/navigation";
import { getSessionUserId } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export default async function ExamensPage() {
  const userId = await getSessionUserId();
  if (!userId) redirect('/connexion');
  const exams = await prisma.assessment.findMany({
    where: { published: true, type: 'EXAM' },
    include: { course: true, scheme: true },
    orderBy: { title: 'asc' },
  });

  return <main className="page-shell"><div className="page-head"><div><p className="eyebrow">ÉVALUATION</p><h1>Mes examens</h1><p>Passez les évaluations requises pour obtenir vos certifications.</p></div><Link className="outline-btn" href="/dashboard">← Tableau de bord</Link></div><div className="grid-3">{exams.map((exam) => <article className="card" key={exam.id}><div className="badge">{exam.scheme?.code ?? 'EXAM'}</div><h3>{exam.scheme?.title ?? exam.title}</h3><p>{exam.course.title}</p><div className="meta-row"><span>Score requis {exam.passingScore}%</span><span>{exam.maxAttempts} tentatives</span><span>{exam.durationMinutes} min</span></div><Link className="button" href={`/examens/${exam.id}`}>Commencer l’examen</Link></article>)}</div></main>;
}
