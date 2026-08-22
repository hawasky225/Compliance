"use client";

import { FormEvent, useState } from "react";

export default function ProfileClient({ name, email, role }: { name: string; email: string; role: string }) {
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

  async function changePassword(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setMessage(""); setError("");
    const body = Object.fromEntries(new FormData(e.currentTarget).entries());
    const res = await fetch("/api/profile/password", { method:"POST", headers:{"Content-Type":"application/json"}, body:JSON.stringify(body) });
    const data = await res.json();
    if (!res.ok) return setError(data.error ?? "Impossible de modifier le mot de passe.");
    (e.currentTarget as HTMLFormElement).reset();
    setMessage("Mot de passe modifié avec succès.");
  }

  return <div className="profile-grid">
    <section className="panel"><p className="eyebrow">COMPTE</p><h2>Informations du profil</h2><div className="profile-info"><div><small>Nom</small><strong>{name}</strong></div><div><small>E-mail</small><strong>{email}</strong></div><div><small>Rôle</small><strong>{role === "PLATFORM_ADMIN" ? "Administrateur plateforme" : "Professionnel"}</strong></div></div></section>
    <section className="panel"><p className="eyebrow">SÉCURITÉ</p><h2>Modifier le mot de passe</h2><form onSubmit={changePassword} className="security-form"><label>Mot de passe actuel<input type="password" name="currentPassword" required /></label><label>Nouveau mot de passe<input type="password" name="newPassword" minLength={10} required /></label><label>Confirmer le nouveau mot de passe<input type="password" name="confirmPassword" minLength={10} required /></label>{error && <p className="form-error">{error}</p>}{message && <p className="form-success">{message}</p>}<button className="primary-btn" type="submit">Mettre à jour le mot de passe</button></form></section>
  </div>;
}
