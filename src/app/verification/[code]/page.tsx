import Link from "next/link";
import { certifications, professional } from "@/lib/demo";

export default async function Verify({params}:{params:Promise<{code:string}>}){
  const {code}=await params;
  const cert=certifications.find(c=>c.code===code)||certifications[0];
  return <main className="verify-page"><Link href="/dashboard" className="brand"><span className="brand-mark">C</span><span>compliance</span></Link><div className="verify-card"><div className="verify-success">✓</div><p className="eyebrow">VÉRIFICATION OFFICIELLE</p><h1>Certificat authentique</h1><p>Cette certification a été émise et enregistrée sur Compliance.</p><div className="verified-person"><div className="avatar">MK</div><div><small>Titulaire</small><strong>{professional.name}</strong><span>{professional.role}</span></div></div><div className="verification-cert"><small>Certification</small><strong>{cert.title}</strong><span>{cert.code}</span></div><div className="verify-data"><div><small>Date d’émission</small><strong>{cert.issued}</strong></div><div><small>Date d’expiration</small><strong>{cert.expires}</strong></div><div><small>Statut</small><strong>{cert.status.toUpperCase()}</strong></div></div><div className="security-note">✓ Enregistrement numérique vérifié</div></div><p className="verify-footer">© 2026 Compliance · Certification HSE & Mines</p></main>;
}
