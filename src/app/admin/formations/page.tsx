import { requireAdmin } from "@/lib/admin";
import { prisma } from "@/lib/prisma";
import CatalogAdminClient from "./catalog-admin-client";
import MiningLearningPaths from "./mining-learning-paths";

export default async function AdminFormationsPage() {
  await requireAdmin();
  const [courses, schemes] = await Promise.all([
    prisma.course.findMany({
      include: {
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

  return <>
    <div className="admin-page-head"><div><p className="eyebrow">CATALOGUE & ÉVALUATION</p><h1>Formations & parcours miniers</h1><p>Structurez des parcours complets : modules, progression, quiz, examens et certification professionnelle.</p></div><div className="admin-head-actions"><span className="soft-badge">{courses.length} formations</span><span className="soft-badge">{courses.reduce((n,c)=>n+c.assessments.length,0)} examens</span></div></div>
    <MiningLearningPaths/>
    <div style={{height:24}}/>
    <CatalogAdminClient courses={courses} schemes={schemes}/>
  </>;
}
