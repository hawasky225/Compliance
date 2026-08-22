"use client";

import Link from "next/link";
import { FormEvent, useState } from "react";

export default function ForgotPasswordPage() {
  const [message,setMessage]=useState("");
  const [error,setError]=useState("");
  const [recoveryMode,setRecoveryMode]=useState(false);
  const [email,setEmail]=useState("");

  async function submit(e:FormEvent<HTMLFormElement>) {
    e.preventDefault(); setError(""); setMessage("");
    const res=await fetch("/api/auth/forgot-password",{method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify({email})});
    const data=await res.json();
    if(!res.ok) return setError(data.error||"Impossible de traiter la demande.");
    setMessage(data.message||"Demande prise en compte.");
    setRecoveryMode(Boolean(data.recoveryMode));
  }

  return <main className="auth-page"><section className="auth-card">
    <div className="auth-brand">COMPLIANCE</div>
    <p className="auth-kicker">Récupération de compte</p>
    <h1>Mot de passe oublié</h1>
    <p>Entrez l’adresse e-mail associée à votre compte.</p>
    <form onSubmit={submit} className="auth-form">
      <input type="email" value={email} onChange={e=>setEmail(e.target.value)} placeholder="Adresse e-mail" required />
      {error&&<p className="auth-error">{error}</p>}
      {message&&<p className="auth-success">{message}</p>}
      <button className="button" type="submit">Continuer</button>
    </form>
    {recoveryMode&&<div className="recovery-box"><strong>Compte administrateur bootstrap</strong><p>Utilisez le code de récupération administrateur pour définir un nouveau mot de passe.</p><Link className="button secondary" href={`/reinitialiser-mot-de-passe?email=${encodeURIComponent(email)}&recovery=1`}>Saisir le code de récupération</Link></div>}
    <Link className="auth-back" href="/connexion">← Retour à la connexion</Link>
  </section></main>;
}
