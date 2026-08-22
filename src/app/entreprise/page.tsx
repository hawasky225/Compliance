import Link from "next/link";
import { redirect } from "next/navigation";
import { getSessionUserId } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export default async function EnterprisePortal() {
  const id = await getSessionUserId();
  if (!id) redirect("/connexion");

  const user = await prisma.user.findUnique({
    where: { id },
    include: {
      organizationMemberships: {
        include: {
          organization: {
            include: {
              professionals: {
                include: {
                  user: true,
                  certifications: {
                    include: { scheme: true },
                  },
                },
              },
            },
          },
        },
      },
    },
  });

  if (!user || !["EMPLOYER_ADMIN", "VERIFIER"].includes(user.role)) {
    redirect("/");
  }

  const membership = user.organizationMemberships[0];
  if (!membership) {
    return (
      <main className="verify-page">
        <div className="verify-card">
          <h1>Accès entreprise</h1>
          <p>Votre compte n’est pas encore rattaché à une entreprise. Contactez Compliance.</p>
        </div>
      </main>
    );
  }

  const organization = membership.organization;
  const visibleProfessionals = organization.professionals.filter(
    (professional) => professional.profileVisibleToEmployers,
  );
  const activeCertifications = organization.professionals.reduce(
    (total, professional) =>
      total + professional.certifications.filter((certification) => certification.status === "ACTIVE").length,
    0,
  );
  const expiringCertifications = organization.professionals.reduce(
    (total, professional) =>
      total + professional.certifications.filter((certification) => certification.status === "EXPIRING").length,
    0,
  );
  const verifiedIdentities = organization.professionals.filter(
    (professional) => professional.identityVerified,
  ).length;

  return (
    <main className="verify-page" style={{ alignItems: "stretch" }}>
      <header className="enterprise-portal-head">
        <div className="brand">
          <span className="brand-mark">C</span>
          <span>compliance</span>
          <small>ENTREPRISE</small>
        </div>
        <div>
          <strong>{organization.name}</strong> · <Link href="/api/auth/logout">Déconnexion</Link>
        </div>
      </header>

      <section className="enterprise-portal-content">
        <p className="eyebrow">ESPACE SÉCURISÉ</p>
        <h1>Registre des compétences</h1>
        <p>Consultez les professionnels rattachés à votre organisation et vérifiez leurs certifications.</p>

        <div className="directory-kpis">
          <div>
            <b>{organization.professionals.length}</b>
            <span>Professionnels</span>
          </div>
          <div>
            <b>{activeCertifications}</b>
            <span>Certifications actives</span>
          </div>
          <div>
            <b>{verifiedIdentities}</b>
            <span>Identités vérifiées</span>
          </div>
          <div>
            <b>{expiringCertifications}</b>
            <span>À renouveler</span>
          </div>
        </div>

        <div className="admin-table-card">
          <table className="premium-table">
            <thead>
              <tr>
                <th>PROFESSIONNEL</th>
                <th>FONCTION</th>
                <th>CERTIFICATIONS</th>
                <th>STATUT</th>
              </tr>
            </thead>
            <tbody>
              {visibleProfessionals.map((professional) => (
                <tr key={professional.id}>
                  <td>
                    <div className="table-person">
                      <span className="avatar">{professional.user.name.slice(0, 2).toUpperCase()}</span>
                      <div>
                        <strong>{professional.user.name}</strong>
                        <small>{professional.professionalId}</small>
                      </div>
                    </div>
                  </td>
                  <td>{professional.jobTitle || "Professionnel"}</td>
                  <td>
                    {professional.certifications.length === 0 ? (
                      <small>Aucune certification</small>
                    ) : (
                      professional.certifications.map((certification) => (
                        <div key={certification.id}>
                          <b>{certification.scheme.code}</b>{" "}
                          <small>· {certification.expiresAt?.toLocaleDateString("fr-FR") || "—"}</small>
                        </div>
                      ))
                    )}
                  </td>
                  <td>
                    <span className="access-pill active">Vérifiable</span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>
    </main>
  );
}
