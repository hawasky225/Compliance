import { NextResponse } from "next/server";
import { requireAdmin } from "@/lib/admin";
import { prisma } from "@/lib/prisma";

const memberRoles=["ADMIN","VIEWER","VERIFIER"] as const;

export async function PATCH(req:Request,{params}:{params:Promise<{id:string}>}){
  await requireAdmin();
  const {id}=await params;
  const b=await req.json();
  const organization=await prisma.organization.update({where:{id},data:{name:String(b.name||"").trim()||undefined,industry:String(b.industry||"MINING"),country:String(b.country||"").trim()||null,active:Boolean(b.active)}});
  return NextResponse.json(organization);
}

export async function POST(req:Request,{params}:{params:Promise<{id:string}>}){
  await requireAdmin();
  const {id}=await params;
  const b=await req.json();
  if(b.action==="addMember"){
    if(!b.userId)return NextResponse.json({error:"Utilisateur requis"},{status:400});
    const role=memberRoles.includes(b.role)?b.role:"VIEWER";
    const member=await prisma.organizationMember.upsert({where:{organizationId_userId:{organizationId:id,userId:String(b.userId)}},create:{organizationId:id,userId:String(b.userId),role,canViewProfiles:true,canVerifyCertificates:true,canExport:Boolean(b.canExport)},update:{role,canViewProfiles:true,canVerifyCertificates:true,canExport:Boolean(b.canExport)}});
    if(role==="ADMIN"||role==="VERIFIER")await prisma.user.update({where:{id:String(b.userId)},data:{role:role==="ADMIN"?"EMPLOYER_ADMIN":"VERIFIER"}});
    return NextResponse.json(member);
  }
  if(b.action==="removeMember"){
    await prisma.organizationMember.delete({where:{id:String(b.memberId)}});
    return NextResponse.json({ok:true});
  }
  if(b.action==="assignProfessional"){
    const p=await prisma.professional.update({where:{id:String(b.professionalId)},data:{organizationId:id,profileVisibleToEmployers:true}});
    return NextResponse.json(p);
  }
  if(b.action==="detachProfessional"){
    const p=await prisma.professional.update({where:{id:String(b.professionalId)},data:{organizationId:null}});
    return NextResponse.json(p);
  }
  if(b.action==="toggleVisibility"){
    const p=await prisma.professional.update({where:{id:String(b.professionalId)},data:{profileVisibleToEmployers:Boolean(b.visible)}});
    return NextResponse.json(p);
  }
  return NextResponse.json({error:"Action inconnue"},{status:400});
}
