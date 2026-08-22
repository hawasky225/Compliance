import { requireAdmin } from "@/lib/admin";
import { prisma } from "@/lib/prisma";
import CatalogAdminClient from "./catalog-admin-client";

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
    <div className="admin-page-head"><div><p className="eyebrow">CATALOGUE & ÉVALUATION</p><h1>Formations & examens</h1><p>Créez, publiez et pilotez vos programmes, examens et banques de questions.</p></div><div className="admin-head-actions"><span className="soft-badge">{courses.length} formations</span><span className="soft-badge">{courses.reduce((n,c)=>n+c.assessments.length,0)} examens</span></div></div>
    <CatalogAdminClient courses={courses} schemes={schemes}/>
  </>;
}
