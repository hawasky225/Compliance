"use client";

import { FormEvent, useEffect, useState } from "react";

export default function OnboardingPage() {
  const [name, setName] = useState("");
  const [error, setError] = useState("");

  useEffect(() => {
    fetch("/api/profile").then(async r => {
      if (r.status === 401) return window.location.href = "/connexion";
      const data = await r.json();
      if (data.user?.role === "PLATFORM_ADMIN") return window.location.href = "/admin";
      if (data.user?.professional?.onboardingCompleted) return window.location.href = "/";
      setName(data.user?.name ?? "");
    });
  }, []);

  async function submit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault(); setError("");
    const body = Object.fromEntries(new FormData(e.currentTarget).entries());
    const res = await fetch("/api/profile", { method:"PATCH", headers:{"Content-Type":"application/json"}, body:JSON.stringify(body) });
    if (!res.ok) return setError("Impossible d’enregistrer votre profil.");
    window.location.href = "/passeport";
  }

  return <main style={{maxWidth:760,margin:"0 auto",padding:"56px 24px"}}>
    <p style={{fontWeight:800,color:"#23745b"}}>ÉTAPE 1 SUR 1</p>
    <h1>Bienvenue {name || "sur Compliance"}</h1>
    <p>Complétez votre profil professionnel minier. Ces informations alimenteront votre passeport de compétences.</p>
    <form onSubmit={submit} style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:16,marginTop:30}}>
      <input name="jobTitle" required placeholder="Fonction (ex. HSE Supervisor)" style={input}/>
      <input name="employer" placeholder="Employeur" style={input}/>
      <input name="country" required defaultValue="Côte d’Ivoire" placeholder="Pays" style={input}/>
      <input name="city" placeholder="Ville / Site" style={input}/>
      <input name="phone" placeholder="Téléphone" style={input}/>
      <div />
      {error && <p style={{gridColumn:"1/-1",color:"#b42318"}}>{error}</p>}
      <button style={{gridColumn:"1/-1",padding:15,border:0,borderRadius:12,background:"#123f32",color:"white",fontWeight:800}}>Créer mon passeport professionnel</button>
    </form>
  </main>;
}

const input = {padding:14,borderRadius:12,border:"1px solid #d7dfdb",fontSize:16} as const;
