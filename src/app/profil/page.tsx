import { redirect } from "next/navigation";
import { getSessionUserId } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { AppShell } from "@/components/app-shell";
import { AdminShell } from "@/components/admin-shell";
import ProfileClient from "./profile-client";

export default async function ProfilePage() {
  const userId = await getSessionUserId();
  if (!userId) redirect("/connexion");

  const user = await prisma.user.findUnique({ where: { id: userId }, include: { professional: true } });
  if (!user) redirect("/connexion");

  const content = <>
    <div className="page-head"><div><p className="eyebrow">PROFIL & SÉCURITÉ</p><h1>Mon compte</h1><p>Gérez vos informations de compte et votre mot de passe.</p></div></div>
    <ProfileClient name={user.name} email={user.email} role={user.role} />
  </>;

  if (user.role === "PLATFORM_ADMIN") return <AdminShell userName={user.name}>{content}</AdminShell>;
  return <AppShell userName={user.name} jobTitle={user.professional?.jobTitle}>{content}</AppShell>;
}
