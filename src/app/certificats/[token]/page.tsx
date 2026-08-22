import Link from "next/link";
import { notFound } from "next/navigation";
import QRCode from "qrcode";
import { prisma } from "@/lib/prisma";

export default async function CertificatePage({ params }: { params: Promise<{ token: string }> }) {
  const { token } = await params;
  const cert = await prisma.certification.findUnique({
    where: { verificationToken: token },
    include: { scheme: true, professional: { include: { user: true } } },
  });
  if (!cert) notFound();

  const base = process.env.NEXT_PUBLIC_APP_URL ?? "https://compliance-web-production.up.railway.app";
  const verifyUrl = `${base.replace(/\/$/, "")}/verifier/${cert.verificationToken}`;
  const qr = await QRCode.toDataURL(verifyUrl, { margin: 1, width: 260, color: { dark: "#123d30", light: "#ffffff" } });
  const issued = cert.issuedAt?.toLocaleDateString("fr-FR", { day: "2-digit", month: "long", year: "numeric" }) ?? "—";
  const expires = cert.expiresAt?.toLocaleDateString("fr-FR", { day: "2-digit", month: "long", year: "numeric" }) ?? "—";

  return <main className="credential-page">
    <style>{`
      .credential-page{min-height:100vh;background:radial-gradient(circle at top left,#edf5f1 0,#f7f9f7 38%,#eef2ef 100%);padding:42px 28px 56px;color:#17231d}
      .credential-wrap{width:min(1120px,100%);margin:0 auto}
      .credential-toolbar{display:flex;align-items:center;justify-content:space-between;gap:16px;margin-bottom:18px}
      .credential-toolbar .brand{display:flex;align-items:center;gap:10px;font-weight:900;letter-spacing:.02em}.credential-toolbar .brand-mark{width:38px;height:38px;border-radius:12px;background:#123d30;color:white;display:grid;place-items:center;font-family:Georgia,serif}
      .credential-actions{display:flex;gap:9px;flex-wrap:wrap}.credential-actions a{padding:10px 14px;border-radius:10px;border:1px solid #ced9d3;background:white;color:#17392c;font-weight:750;font-size:13px}.credential-actions a.primary{background:#123d30;color:white;border-color:#123d30}
      .credential{position:relative;overflow:hidden;background:#fff;border:1px solid #dce5df;border-radius:26px;box-shadow:0 30px 80px rgba(23,55,43,.12);min-height:730px}
      .credential:before{content:"";position:absolute;inset:0;border:10px solid #f3f7f4;pointer-events:none}.credential:after{content:"";position:absolute;width:420px;height:420px;border-radius:50%;right:-180px;top:-180px;border:1px solid #d8e7df;box-shadow:0 0 0 36px #f7faf8,0 0 0 72px #edf5f1;opacity:.75}
      .credential-head{height:102px;background:#123d30;color:white;display:flex;align-items:center;justify-content:space-between;padding:0 44px;position:relative;z-index:1}.credential-brand{display:flex;align-items:center;gap:12px}.credential-brand-mark{width:42px;height:42px;border-radius:12px;background:white;color:#123d30;display:grid;place-items:center;font-family:Georgia,serif;font-size:24px;font-weight:700}.credential-brand strong{font-size:22px}.credential-head small{letter-spacing:.22em;font-weight:800;font-size:10px;opacity:.84}
      .credential-body{position:relative;z-index:1;display:grid;grid-template-columns:minmax(0,1fr) 315px;gap:40px;padding:54px 52px 44px}
      .credential-kicker{font-size:10px;letter-spacing:.2em;font-weight:900;color:#2c7357;text-transform:uppercase;margin:0 0 16px}.credential-title{font-family:Georgia,serif;font-size:46px;line-height:1.06;font-weight:500;margin:0;max-width:720px}.credential-lead{margin:34px 0 9px;color:#738078;font-size:14px}.credential-name{font-family:Georgia,serif;font-size:42px;margin:0 0 14px}.credential-statement{font-size:15px;color:#68776f;line-height:1.75;max-width:680px}.credential-code{display:inline-flex;margin-top:13px;padding:7px 11px;border-radius:999px;background:#edf5f1;color:#1e654a;font-weight:850;font-size:11px;letter-spacing:.04em}
      .credential-meta{display:grid;grid-template-columns:repeat(3,1fr);gap:12px;margin-top:42px;padding-top:26px;border-top:1px solid #e4eae6}.credential-meta div{min-width:0}.credential-meta span{display:block;color:#8a958e;text-transform:uppercase;letter-spacing:.09em;font-size:9px;font-weight:800;margin-bottom:7px}.credential-meta strong{display:block;font-size:13px;line-height:1.35;overflow-wrap:anywhere}
      .credential-side{align-self:stretch;border-left:1px solid #e1e8e3;padding-left:36px;display:flex;flex-direction:column;justify-content:center;align-items:center;text-align:center}.credential-seal{width:86px;height:86px;border-radius:50%;background:#e7f2ec;border:1px solid #cfe2d8;display:grid;place-items:center;color:#1f674b;font-size:30px;margin-bottom:18px}.credential-side h3{font-family:Georgia,serif;font-size:23px;margin:0}.credential-side p{font-size:11px;color:#7a887f;line-height:1.55;margin:8px 0 20px}.credential-qr{padding:12px;background:white;border-radius:18px;border:1px solid #dae5df;box-shadow:0 10px 26px rgba(23,55,43,.08)}.credential-qr img{display:block;width:174px;height:174px}.credential-id{font-size:10px;color:#7e8c83;margin-top:14px;max-width:230px;overflow-wrap:anywhere}.credential-footer{position:relative;z-index:1;border-top:1px solid #e7ece8;padding:18px 52px 25px;display:flex;justify-content:space-between;gap:20px;color:#839088;font-size:10px}.credential-footer strong{color:#42584d}
      @media(max-width:850px){.credential-body{grid-template-columns:1fr;padding:38px 28px}.credential-side{border-left:0;border-top:1px solid #e1e8e3;padding:28px 0 0}.credential-title{font-size:36px}.credential-name{font-size:34px}.credential-meta{grid-template-columns:1fr}.credential-head{padding:0 28px}.credential-footer{padding:18px 28px;flex-direction:column}.credential-toolbar{align-items:flex-start;flex-direction:column}}
      @media print{.credential-page{background:white;padding:0}.credential-toolbar{display:none}.credential{border:0;border-radius:0;box-shadow:none;min-height:auto}.credential-wrap{width:100%}}
    `}</style>

    <div className="credential-wrap">
      <div className="credential-toolbar">
        <div className="brand"><span className="brand-mark">C</span><span>compliance</span></div>
        <div className="credential-actions">
          <Link href="/certifications">← Mes certifications</Link>
          <Link href={`/verifier/${cert.verificationToken}`}>Vérifier l’authenticité</Link>
          <Link className="primary" href="/dashboard">Tableau de bord</Link>
        </div>
      </div>

      <section className="credential" aria-label={`Certificat ${cert.certificateNumber}`}>
        <header className="credential-head">
          <div className="credential-brand"><span className="credential-brand-mark">C</span><strong>compliance</strong></div>
          <small>CREDENTIAL OFFICIEL · HSE & MINES</small>
        </header>

        <div className="credential-body">
          <div>
            <p className="credential-kicker">Certification professionnelle vérifiable</p>
            <h1 className="credential-title">{cert.scheme.title}</h1>
            <p className="credential-lead">Compliance atteste que</p>
            <h2 className="credential-name">{cert.professional.user.name}</h2>
            <p className="credential-statement">a satisfait aux exigences d’évaluation et de compétence définies par le schéma de certification <strong>{cert.scheme.code}</strong>. Ce certificat est inscrit dans le registre numérique Compliance et peut être vérifié publiquement à tout moment.</p>
            <span className="credential-code">SCHÉMA {cert.scheme.code}</span>

            <div className="credential-meta">
              <div><span>Numéro du certificat</span><strong>{cert.certificateNumber}</strong></div>
              <div><span>Délivré le</span><strong>{issued}</strong></div>
              <div><span>Valable jusqu’au</span><strong>{expires}</strong></div>
            </div>
          </div>

          <aside className="credential-side">
            <div className="credential-seal">✓</div>
            <h3>Authenticité vérifiable</h3>
            <p>Scannez le QR code pour consulter l’enregistrement officiel de cette certification.</p>
            <div className="credential-qr"><img src={qr} alt="QR code de vérification du certificat" /></div>
            <div className="credential-id">ID de vérification<br/><strong>{cert.verificationToken}</strong></div>
          </aside>
        </div>

        <footer className="credential-footer">
          <span><strong>Compliance Certification Registry</strong> · Credential numérique sécurisé</span>
          <span>Imprimez cette page pour enregistrer une copie PDF.</span>
        </footer>
      </section>
    </div>
  </main>;
}
