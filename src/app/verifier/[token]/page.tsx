import Link from "next/link";
import { notFound } from "next/navigation";
import { prisma } from "@/lib/prisma";

export default async function VerifyPage({ params }: { params: Promise<{ token: string }> }) {
  const { token } = await params;
  const cert = await prisma.certification.findUnique({
    where: { verificationToken: token },
    include: { scheme: true, professional: { include: { user: true } } },
  });
  if (!cert) notFound();

  const now = new Date();
  const effectiveStatus = cert.status === "ACTIVE" && cert.expiresAt && cert.expiresAt < now ? "EXPIRED" : cert.status;
  const active = effectiveStatus === "ACTIVE";
  const issued = cert.issuedAt?.toLocaleDateString("fr-FR", { day: "2-digit", month: "long", year: "numeric" }) ?? "—";
  const expires = cert.expiresAt?.toLocaleDateString("fr-FR", { day: "2-digit", month: "long", year: "numeric" }) ?? "—";

  const statusLabel: Record<string,string> = {
    ACTIVE: "Certification valide",
    EXPIRED: "Certification expirée",
    SUSPENDED: "Certification suspendue",
    REVOKED: "Certification révoquée",
    PENDING: "Certification en attente",
    EXPIRING: "Expiration prochaine",
  };

  return <main className="registry-page">
    <style>{`
      .registry-page{min-height:100vh;background:linear-gradient(180deg,#eef5f1 0,#f7f9f8 46%,#eef2ef 100%);color:#17231d;padding:0 24px 56px}
      .registry-topbar{height:76px;max-width:1180px;margin:0 auto;display:flex;align-items:center;justify-content:space-between}.registry-brand{display:flex;align-items:center;gap:10px;font-weight:900;font-size:18px}.registry-mark{width:36px;height:36px;border-radius:11px;background:#123d30;color:white;display:grid;place-items:center;font-family:Georgia,serif;font-size:21px}.registry-topbar small{font-size:10px;letter-spacing:.13em;color:#65766c;font-weight:800}
      .registry-shell{width:min(980px,100%);margin:38px auto 0}.registry-status-card{background:#123d30;color:white;border-radius:24px 24px 0 0;padding:34px 38px;display:flex;justify-content:space-between;gap:25px;align-items:center;box-shadow:0 24px 70px rgba(20,55,42,.12)}.registry-status-left{display:flex;gap:18px;align-items:center}.registry-check{width:64px;height:64px;border-radius:50%;display:grid;place-items:center;font-size:30px;font-weight:900;background:${active ? "#e6f4ec" : "#fff2df"};color:${active ? "#1f704d" : "#a15d0c"}}.registry-status-card p{margin:0 0 4px;font-size:10px;letter-spacing:.16em;font-weight:850;opacity:.72;text-transform:uppercase}.registry-status-card h1{font-family:Georgia,serif;font-size:34px;font-weight:500;margin:0}.registry-status-pill{border:1px solid rgba(255,255,255,.22);background:rgba(255,255,255,.09);padding:8px 12px;border-radius:999px;font-weight:850;font-size:11px;letter-spacing:.04em}
      .registry-card{background:white;border:1px solid #dce5df;border-top:0;border-radius:0 0 24px 24px;box-shadow:0 28px 80px rgba(23,55,43,.10);overflow:hidden}.registry-main{padding:38px;display:grid;grid-template-columns:minmax(0,1fr) 280px;gap:36px}.registry-label{font-size:9px;text-transform:uppercase;letter-spacing:.12em;color:#85928a;font-weight:850;margin:0 0 7px}.registry-person{font-family:Georgia,serif;font-size:34px;margin:0 0 6px}.registry-sub{color:#718077;font-size:13px;margin:0}.registry-cert{margin-top:30px;padding:24px;background:#f5f8f6;border:1px solid #e2e9e4;border-radius:16px}.registry-cert h2{font-family:Georgia,serif;font-size:25px;font-weight:500;margin:0 0 8px}.registry-cert p{font-size:12px;color:#718077;margin:0}.registry-code{display:inline-flex;margin-top:13px;padding:6px 9px;border-radius:999px;background:#e7f2ec;color:#246b4e;font-weight:850;font-size:10px}
      .registry-data{display:grid;grid-template-columns:repeat(2,1fr);gap:12px;margin-top:24px}.registry-data div{padding:14px 15px;border:1px solid #e2e8e4;border-radius:12px}.registry-data span,.registry-data strong{display:block}.registry-data span{font-size:8px;color:#89948e;text-transform:uppercase;letter-spacing:.09em;font-weight:800;margin-bottom:5px}.registry-data strong{font-size:12px;overflow-wrap:anywhere}
      .registry-security{border-left:1px solid #e2e8e4;padding-left:30px}.registry-shield{width:56px;height:56px;border-radius:15px;background:#e9f3ee;color:#246b4e;display:grid;place-items:center;font-size:25px;margin-bottom:20px}.registry-security h3{font-family:Georgia,serif;font-size:22px;font-weight:500;margin:0 0 9px}.registry-security p{font-size:11px;color:#718077;line-height:1.65}.registry-token{margin-top:18px;padding:12px;background:#f7f9f7;border-radius:10px;font-size:9px;color:#77847c;overflow-wrap:anywhere}.registry-token strong{display:block;color:#375044;margin-top:4px}
      .registry-foot{border-top:1px solid #e6ece8;padding:20px 38px;display:flex;justify-content:space-between;align-items:center;gap:15px}.registry-note{font-size:10px;color:#7c8981;line-height:1.55;max-width:560px}.registry-actions{display:flex;gap:9px;flex-wrap:wrap}.registry-actions a{padding:10px 14px;border-radius:10px;font-size:12px;font-weight:800;border:1px solid #d0dad4}.registry-actions a:first-child{background:white;color:#193d2f}.registry-actions a:last-child{background:#123d30;color:white;border-color:#123d30}
      @media(max-width:760px){.registry-main{grid-template-columns:1fr;padding:26px}.registry-security{border-left:0;border-top:1px solid #e2e8e4;padding:26px 0 0}.registry-status-card{align-items:flex-start;flex-direction:column;padding:28px}.registry-data{grid-template-columns:1fr}.registry-foot{padding:20px 26px;align-items:flex-start;flex-direction:column}.registry-topbar small{display:none}}
    `}</style>

    <header className="registry-topbar">
      <Link className="registry-brand" href="/"><span className="registry-mark">C</span><span>compliance</span></Link>
      <small>REGISTRE PUBLIC DES CERTIFICATIONS</small>
    </header>

    <div className="registry-shell">
      <section className="registry-status-card">
        <div className="registry-status-left">
          <div className="registry-check">{active ? "✓" : "!"}</div>
          <div><p>Vérification officielle</p><h1>{statusLabel[effectiveStatus] ?? "Statut de certification"}</h1></div>
        </div>
        <span className="registry-status-pill">{effectiveStatus}</span>
      </section>

      <section className="registry-card">
        <div className="registry-main">
          <div>
            <p className="registry-label">Titulaire du credential</p>
            <h2 className="registry-person">{cert.professional.user.name}</h2>
            <p className="registry-sub">Identité professionnelle enregistrée dans Compliance</p>

            <div className="registry-cert">
              <p className="registry-label">Certification</p>
              <h2>{cert.scheme.title}</h2>
              <p>Credential délivré dans le cadre du schéma professionnel Compliance.</p>
              <span className="registry-code">{cert.scheme.code}</span>
            </div>

            <div className="registry-data">
              <div><span>Numéro du certificat</span><strong>{cert.certificateNumber}</strong></div>
              <div><span>Statut</span><strong>{statusLabel[effectiveStatus] ?? effectiveStatus}</strong></div>
              <div><span>Date de délivrance</span><strong>{issued}</strong></div>
              <div><span>Date d’expiration</span><strong>{expires}</strong></div>
            </div>
          </div>

          <aside className="registry-security">
            <div className="registry-shield">◆</div>
            <h3>Enregistrement authentique</h3>
            <p>Cette page interroge directement le registre numérique Compliance. Les informations affichées correspondent à l’enregistrement courant du certificat et non à une copie statique.</p>
            <div className="registry-token">Identifiant de vérification<strong>{cert.verificationToken}</strong></div>
          </aside>
        </div>

        <footer className="registry-foot">
          <div className="registry-note"><strong>Source de confiance :</strong> Compliance Certification Registry. Un certificat suspendu, expiré ou révoqué est signalé directement sur cette page.</div>
          <div className="registry-actions"><Link href={`/certificats/${cert.verificationToken}`}>Voir le certificat</Link><Link href="/">Retour à Compliance</Link></div>
        </footer>
      </section>
    </div>
  </main>;
}
