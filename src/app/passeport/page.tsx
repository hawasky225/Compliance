import { redirect } from "next/navigation";
import { AppShell } from "@/components/app-shell";
import { getSessionUserId } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

function initials(name: string) {
  return name.split(/\s+/).filter(Boolean).slice(0, 2).map((part) => part[0]?.toUpperCase()).join("") || "CP";
}

export default async function Passeport() {
  const userId = await getSessionUserId();
  if (!userId) redirect("/connexion");
  const professional = await prisma.professional.findUnique({
    where: { userId },
    include: {
      user: true,
      certifications: { include: { scheme: true }, orderBy: { issuedAt: "desc" } },
      enrollments: { where: { status: "COMPLETED" }, include: { course: true } },
      results: true,
    },
  });
  if (!professional) redirect("/onboarding");

  const valid = professional.certifications.filter((cert) => cert.status === "ACTIVE" || cert.status === "EXPIRING");
  const trainingMinutes = professional.enrollments.reduce((sum, enrollment) => sum + enrollment.course.durationMinutes, 0);
  const average = professional.results.length ? Math.round(professional.results.reduce((sum, result) => sum + result.score, 0) / professional.results.length) : 0;
  const location = [professional.city, professional.country].filter(Boolean).join(", ") || "Localisation non renseignée";

  return <AppShell userName={professional.user.name} jobTitle={professional.jobTitle}><div className="page-head"><div><p className="eyebrow">IDENTITÉ PROFESSIONNELLE</p><h1>Mon Passeport</h1><p>Votre dossier vérifiable de compétences, formations et certifications.</p></div></div>
  <section className="passport-card"><div className="passport-banner"><div className="brand"><span className="brand-mark inverse">C</span><span>compliance</span></div><span>PASSEPORT PROFESSIONNEL</span></div><div className="passport-content"><div className="identity"><div className="avatar huge">{initials(professional.user.name)}</div><div><span className="verified">{professional.identityVerified ? "✓ Identité vérifiée" : "Identité à vérifier"}</span><h2>{professional.user.name}</h2><p>{professional.jobTitle || "Professionnel minier"} · Mines & HSE</p><small>{location}</small><br/><small>ID professionnel : {professional.professionalId}</small></div></div><div className="passport-stats"><div><strong>{valid.length}</strong><span>Certifications valides</span></div><div><strong>{Math.round(trainingMinutes / 60)} h</strong><span>Formation validée</span></div><div><strong>{average}%</strong><span>Score moyen</span></div></div><h3>Certifications</h3>{professional.certifications.map((cert)=><div className="passport-cert" key={cert.id}><span className="seal">✓</span><div><strong>{cert.scheme.title}</strong><small>{cert.certificateNumber}</small></div><span>{cert.expiresAt?.toLocaleDateString("fr-FR") ?? "—"}</span><span className={`status ${cert.status === "EXPIRING" ? "warning" : ""}`}>{cert.status}</span></div>)}{professional.certifications.length === 0 && <p>Aucune certification délivrée à ce jour.</p>}</div><div className="passport-footer">Passeport généré par Compliance · Vérification numérique sécurisée</div></section></AppShell>;
}
