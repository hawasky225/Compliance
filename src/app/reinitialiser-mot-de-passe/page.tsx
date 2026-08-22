"use client";

import Link from "next/link";
import { FormEvent, useMemo, useState } from "react";
import { useSearchParams } from "next/navigation";

export default function ResetPasswordPage() {
  const params=useSearchParams();
  const token=params.get("token")||"";
  const email=params.get("email")||"";
  const recovery=params.get("recovery")==="1";
  const [error,setError]=useState("");
  const [done,setDone]=useState(false);
  const title=useMemo(()=>recovery?"Récupération administrateur":"Nouveau mot de passe",[recovery]);

  async function submit(e:FormEvent<HTMLFormElement>) {
    e.preventDefault(); setError("");
    const body=Object.fromEntries(new FormData(e.currentTarget).entries());
    const res=await fetch("/api/auth/reset-password",{method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify({...body,token,email})});
    const data=await res.json();
    if(!res.ok) return setError(data.error||"Impossible de réinitialiser le mot de passe.");
    setDone(true);
  }

  return <main className="auth-page"><section className="auth-card">
    <div className="auth-brand">COMPLIANCE</div>
    <p className="auth-kicker">Sécurité du compte</p>
    <h1>{title}</h1>
    {done?<><p className="auth-success">Votre mot de passe a été mis à jour.</p><Link className="button" href="/connexion">Se connecter</Link></>:<form onSubmit={submit} className="auth-form">
      {recovery&&<input name="recoveryCode" type="password" placeholder="Code de récupération" required />}
      <input name="password" type="password" minLength={12} placeholder="Nouveau mot de passe" required />
      <input name="confirmPassword" type="password" minLength={12} placeholder="Confirmer le nouveau mot de passe" required />
      {error&&<p className="auth-error">{error}</p>}
      <button className="button" type="submit">Mettre à jour le mot de passe</button>
    </form>}
    <Link className="auth-back" href="/connexion">← Retour à la connexion</Link>
  </section></main>;
}
