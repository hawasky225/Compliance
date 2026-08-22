import { requireAdmin } from "@/lib/admin";
import { prisma } from "@/lib/prisma";
import CatalogAdminClient from "./catalog-admin-client";
import MiningLearningPaths from "./mining-learning-paths";
import CurriculumAdmin from "./curriculum-admin";

export default async function AdminFormationsPage() {
  await requireAdmin();
  const [courses, schemes] = await Promise.all([
    prisma.course.findMany({
      include: {
        modules: { orderBy: { sortOrder: "asc" }, include: { chapters: { orderBy: { sortOrder: "asc" } } } },
        assessments: {
          include: {
            questions: { orderBy: { sortOrder: "asc" } },
            _count: { select: { attempts: true } },
          },
          orderBy: { title: "asc" },
        },
      },
      orderBy: { createdAt: "desc" },
    }),
    prisma.certificationScheme.findMany({ where: { active: true }, select: { id: true, code: true, title: true }, orderBy: { code: "asc" } }),
  ]);

  const serial=JSON.parse(JSON.stringify(courses));
  return <>
    <div className="admin-page-head"><div><p className="eyebrow">CATALOGUE & ÉVALUATION</p><h1>Formations & parcours miniers</h1><p>Structurez des parcours complets : modules, chapitres, ressources, progression, examens et certification professionnelle.</p></div><div className="admin-head-actions"><span className="soft-badge">{courses.length} formations</span><span className="soft-badge">{courses.reduce((n,c)=>n+c.modules.length,0)} modules</span><span className="soft-badge">{courses.reduce((n,c)=>n+c.assessments.length,0)} examens</span></div></div>
    <MiningLearningPaths/>
    <div style={{height:24}}/>
    <CurriculumAdmin courses={serial}/>
    <div style={{height:24}}/>
    <CatalogAdminClient courses={serial} schemes={schemes}/>
  </>;
}
