"use client";

import Link from "next/link";
import { FormEvent, useState } from "react";

export default function ForgotPasswordPage() {
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  const [recoveryMode, setRecoveryMode] = useState(false);
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);

  async function submit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setError("");
    setMessage("");
    setRecoveryMode(false);
    setLoading(true);
    try {
      const res = await fetch("/api/auth/forgot-password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email }),
      });
      const data = await res.json();
      if (!res.ok) return setError(data.error || "Impossible de traiter la demande.");
      setMessage(data.message || "Demande prise en compte.");
      setRecoveryMode(Boolean(data.recoveryMode));
    } finally {
      setLoading(false);
    }
  }

  return (
    <main style={page}>
      <section style={card}>
        <div style={{ fontWeight: 900, fontSize: 24 }}>COMPLIANCE</div>
        <p style={eyebrow}>Récupération de compte</p>
        <h1 style={{ margin: "0 0 8px", fontSize: 32 }}>Mot de passe oublié</h1>
        <p style={{ color: "#60706a", marginTop: 0, lineHeight: 1.6 }}>
          Saisissez l’adresse e-mail de votre compte. La récupération est disponible pour tous les utilisateurs Compliance.
        </p>
        <form onSubmit={submit} style={{ display: "grid", gap: 14, marginTop: 24 }}>
          <label style={label}>Adresse e-mail</label>
          <input style={input} type="email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="nom@entreprise.com" required />
          {error && <p style={errorBox}>{error}</p>}
          {message && <p style={successBox}>{message}</p>}
          <button style={{ ...primary, opacity: loading ? 0.7 : 1 }} type="submit" disabled={loading}>
            {loading ? "Envoi en cours…" : "Recevoir le lien de réinitialisation"}
          </button>
        </form>
        {recoveryMode && (
          <div style={recoveryBox}>
            <strong>Récupération administrateur</strong>
            <p style={{ color: "#60706a", lineHeight: 1.5 }}>
              L’envoi d’e-mail n’est pas encore configuré. Utilisez le code de récupération administrateur pour définir un nouveau mot de passe.
            </p>
            <Link style={secondary} href={`/reinitialiser-mot-de-passe?email=${encodeURIComponent(email)}&recovery=1`}>
              Saisir le code de récupération
            </Link>
          </div>
        )}
        <Link style={back} href="/connexion">← Retour à la connexion</Link>
      </section>
    </main>
  );
}

const page = { minHeight: "100vh", display: "grid", placeItems: "center", padding: 24, background: "radial-gradient(circle at top left,#eef5f1,#f7f9f8 45%,#eef3f0)" } as const;
const card = { width: "100%", maxWidth: 540, background: "white", border: "1px solid #e2e8e4", borderRadius: 24, padding: 38, boxShadow: "0 24px 70px rgba(20,53,40,.10)" } as const;
const eyebrow = { fontSize: 12, fontWeight: 800, letterSpacing: 1.5, textTransform: "uppercase", color: "#23745b", marginBottom: 6 } as const;
const label = { fontSize: 12, fontWeight: 800, color: "#33453d" } as const;
const input = { padding: 15, borderRadius: 12, border: "1px solid #cfdad4", fontSize: 16, outline: "none" } as const;
const primary = { padding: 15, border: 0, borderRadius: 12, background: "#123f32", color: "white", fontWeight: 800, fontSize: 15, cursor: "pointer" } as const;
const secondary = { display: "inline-block", padding: "11px 14px", borderRadius: 10, border: "1px solid #c9d7d1", color: "#123f32", fontWeight: 800, textDecoration: "none" } as const;
const recoveryBox = { marginTop: 22, padding: 18, borderRadius: 14, background: "#f2f7f5", border: "1px solid #dbe7e2" } as const;
const successBox = { color: "#1d6b4b", margin: 0, background: "#edf8f2", border: "1px solid #d6ecdf", padding: "11px 12px", borderRadius: 10 } as const;
const errorBox = { color: "#a23a2b", margin: 0, background: "#fff2ef", border: "1px solid #f0d7d0", padding: "11px 12px", borderRadius: 10 } as const;
const back = { display: "inline-block", marginTop: 24, color: "#365b50", fontWeight: 700, textDecoration: "none" } as const;
