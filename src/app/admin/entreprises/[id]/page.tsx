import Link from "next/link";
import { notFound } from "next/navigation";
import { requireAdmin } from "@/lib/admin";
import { prisma } from "@/lib/prisma";
import EnterpriseDetailClient from "./enterprise-detail-client";

export default async function EnterpriseDetailPage({params}:{params:Promise<{id:string}>}) {
  await requireAdmin();
  const {id}=await params;
  const [organization, users, professionals] = await Promise.all([
    prisma.organization.findUnique({where:{id},include:{members:{include:{user:true}},professionals:{include:{user:true,certifications:{include:{scheme:true}}}}}}),
    prisma.user.findMany({where:{status:"ACTIVE",role:{not:"PLATFORM_ADMIN"}},select:{id:true,name:true,email:true,role:true},orderBy:{name:"asc"}}),
    prisma.professional.findMany({include:{user:true,organization:true,certifications:{include:{scheme:true}}},orderBy:{user:{name:"asc"}}}),
  ]);
  if(!organization) notFound();
  return <main className="page-shell">
    <div className="admin-page-head"><div><p className="eyebrow">ESPACE ENTREPRISE</p><h1>{organization.name}</h1><p>Gérez les paramètres, les accès portail et les professionnels rattachés à cette entreprise.</p></div><Link className="outline-btn" href="/admin/entreprises">← Entreprises</Link></div>
    <EnterpriseDetailClient organization={JSON.parse(JSON.stringify(organization))} users={users} professionals={JSON.parse(JSON.stringify(professionals))}/>
  </main>;
}
