import Link from "next/link";
import { notFound } from "next/navigation";
import QRCode from "qrcode";
import { prisma } from "@/lib/prisma";

export default async function CertificatePage({ params }: { params: Promise<{ token: string }> }) {
  const { token } = await params;
  const cert = await prisma.certification.findUnique({ where: { verificationToken: token }, include: { scheme: true, professional: { include: { user: true } } } });
  if (!cert) notFound();
  const base = process.env.NEXT_PUBLIC_APP_URL ?? 'https://compliance-web-production.up.railway.app';
  const verifyUrl = `${base}/verifier/${cert.verificationToken}`;
  const qr = await QRCode.toDataURL(verifyUrl, { margin: 1, width: 220 });
  return <main className="verify-shell">
    <section className="verify-card certificate-print"><p className="eyebrow">CERTIFICAT OFFICIEL</p><h1>{cert.scheme.title}</h1><p>Compliance certifie que</p><h2>{cert.professional.user.name}</h2><p>a satisfait aux exigences du schéma <strong>{cert.scheme.code}</strong>.</p><dl><div><dt>Numéro</dt><dd>{cert.certificateNumber}</dd></div><div><dt>Délivré le</dt><dd>{cert.issuedAt?.toLocaleDateString('fr-FR') ?? '—'}</dd></div><div><dt>Valable jusqu’au</dt><dd>{cert.expiresAt?.toLocaleDateString('fr-FR') ?? '—'}</dd></div></dl><img src={qr} width={180} height={180} alt="QR de vérification du certificat" /><p className="muted">Scannez pour vérifier l’authenticité du certificat. Utilisez la fonction Imprimer du navigateur pour enregistrer le certificat en PDF.</p></section>
    <nav className="certificate-actions" aria-label="Navigation du certificat"><Link className="outline-btn" href="/certifications">← Mes certifications</Link><Link className="outline-btn" href={`/verifier/${cert.verificationToken}`}>Vérifier l’authenticité</Link><Link className="dark-btn" href="/dashboard">Tableau de bord</Link></nav>
  </main>;
}
