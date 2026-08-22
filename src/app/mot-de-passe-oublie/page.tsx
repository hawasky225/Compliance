"use client";

import Link from "next/link";
import { FormEvent, useState } from "react";

export default function ForgotPasswordPage() {
  const [message, setMessage] = useState("");
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);

  async function submit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setMessage("");
    setLoading(true);
    try {
      const res = await fetch("/api/auth/forgot-password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email }),
      });
      const data = await res.json().catch(() => ({}));
      setMessage(data.message || "Si un compte existe pour cette adresse, un lien de réinitialisation sera envoyé.");
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
          Saisissez l’adresse e-mail associée à votre compte. Pour protéger les utilisateurs, la plateforme affiche toujours la même confirmation.
        </p>
        <form onSubmit={submit} style={{ display: "grid", gap: 14, marginTop: 24 }}>
          <label style={label}>Adresse e-mail</label>
          <input style={input} type="email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="nom@entreprise.com" required />
          {message && <p style={successBox}>{message}</p>}
          <button style={{ ...primary, opacity: loading ? 0.7 : 1 }} type="submit" disabled={loading}>
            {loading ? "Traitement en cours…" : "Recevoir le lien de réinitialisation"}
          </button>
        </form>
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
const successBox = { color: "#1d6b4b", margin: 0, background: "#edf8f2", border: "1px solid #d6ecdf", padding: "11px 12px", borderRadius: 10 } as const;
const back = { display: "inline-block", marginTop: 24, color: "#365b50", fontWeight: 700, textDecoration: "none" } as const;
