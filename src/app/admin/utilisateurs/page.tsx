import { requireAdmin } from "@/lib/admin";
import { prisma } from "@/lib/prisma";
import UsersAdminClient from "./users-admin-client";

export default async function UsersPage(){
 await requireAdmin();
 const [users,orgs]=await Promise.all([
  prisma.user.findMany({where:{role:{not:"PLATFORM_ADMIN"}},include:{professional:{include:{certifications:true}},organizationMemberships:{include:{organization:true}}},orderBy:{createdAt:"desc"},take:500}),
  prisma.organization.findMany({include:{_count:{select:{members:true,professionals:true}}},orderBy:{name:"asc"}})
 ]);
 return <main className="page-shell"><div className="admin-page-head"><div><p className="eyebrow">ACCÈS & IDENTITÉS</p><h1>Gestion des utilisateurs</h1><p>Contrôlez les comptes, rôles, accès et rattachements entreprise depuis un seul espace.</p></div></div><UsersAdminClient users={JSON.parse(JSON.stringify(users))} organizations={JSON.parse(JSON.stringify(orgs))}/></main>
}