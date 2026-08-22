import Link from "next/link";
import { notFound, redirect } from "next/navigation";
import { AppShell } from "@/components/app-shell";
import { getSessionUserId } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import ChapterAction from "./chapter-action";

export default async function CoursePathPage({ params }: { params: Promise<{ courseId: string }> }) {
  const userId = await getSessionUserId();
  if (!userId) redirect("/connexion");
  const { courseId } = await params;
  const professional = await prisma.professional.findUnique({ where: { userId }, include: { user: true } });
  if (!professional) redirect("/onboarding");
  const course = await prisma.course.findUnique({
    where: { id: courseId },
    include: {
      modules: { where: { published: true }, orderBy: { sortOrder: "asc" }, include: { chapters: { where: { published: true }, orderBy: { sortOrder: "asc" } } } },
      assessments: { where: { published: true }, orderBy: { title: "asc" } },
    },
  });
  if (!course || !course.published) notFound();
  const flat = course.modules.flatMap(m => m.chapters);
  const progressRows = flat.length ? await prisma.chapterProgress.findMany({ where: { professionalId: professional.id, chapterId: { in: flat.map(c => c.id) } } }) : [];
  const done = new Set(progressRows.filter(p => p.completed).map(p => p.chapterId));
  const required = flat.filter(c => c.required);
  const completedRequired = required.filter(c => done.has(c.id)).length;
  const progress = required.length ? Math.round((completedRequired / required.length) * 100) : 100;
  const examUnlocked = required.every(c => done.has(c.id));

  return <AppShell userName={professional.user.name} jobTitle={professional.jobTitle}>
    <div className="page-head"><div><p className="eyebrow">PARCOURS MINIER</p><h1>{course.title}</h1><p>{course.description || "Parcours de compétences HSE et minières."}</p></div><Link className="outline-btn" href="/formations">← Mes formations</Link></div>
    <div className="learning-layout">
      <section className="learning-path">
        {course.modules.map((module, moduleIndex) => <div className="learning-module" key={module.id}>
          <div className="learning-module-head"><div><span>MODULE {moduleIndex + 1}</span><h2>{module.title}</h2><p>{module.description}</p></div><b>{module.chapters.length} chapitre(s)</b></div>
          <div className="chapter-stack">{module.chapters.map((chapter) => {
            const globalIndex = flat.findIndex(c => c.id === chapter.id);
            const locked = flat.slice(0, globalIndex).filter(c => c.required).some(c => !done.has(c.id));
            const completed = done.has(chapter.id);
            return <article className={`learning-chapter ${completed ? "completed" : locked ? "locked" : "current"}`} key={chapter.id}>
              <div className="chapter-index">{globalIndex + 1}</div>
              <div className="chapter-main"><div className="chapter-title-row"><div><h3>{chapter.title}</h3><p>{chapter.summary}</p></div><span>{chapter.durationMinutes} min</span></div>
                {!locked && chapter.body && <div className="chapter-body">{chapter.body}</div>}
                {!locked && <div className="chapter-resources">{chapter.pdfUrl && <a className="outline-btn" href={chapter.pdfUrl} target="_blank" rel="noreferrer">PDF du chapitre ↗</a>}{chapter.videoUrl && <a className="outline-btn" href={chapter.videoUrl} target="_blank" rel="noreferrer">Vidéo ↗</a>}</div>}
                <ChapterAction chapterId={chapter.id} completed={completed} locked={locked}/>
              </div>
            </article>;
          })}</div>
        </div>)}
        {flat.length === 0 && <div className="premium-empty"><b>Contenu en préparation</b><span>Les chapitres de cette formation n’ont pas encore été publiés.</span></div>}
      </section>
      <aside className="learning-summary">
        <div className="learning-summary-card"><p className="eyebrow">PROGRESSION</p><h2>{progress}%</h2><div className="progress"><i style={{ width: `${progress}%` }}/></div><span>{completedRequired}/{required.length} chapitres obligatoires terminés</span></div>
        <div className="learning-summary-card"><p className="eyebrow">EXAMEN FINAL</p>{course.assessments.length === 0 ? <p>Aucun examen publié.</p> : examUnlocked ? <>{course.assessments.map(a => <Link key={a.id} className="dark-btn wide" href={`/examens/${a.id}`}>Passer {a.title}</Link>)}</> : <div className="locked-exam">🔒 Terminez tous les chapitres obligatoires pour débloquer l’examen final.</div>}</div>
      </aside>
    </div>
  </AppShell>;
}
