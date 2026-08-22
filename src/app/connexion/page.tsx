"use client";

import Link from "next/link";
import { FormEvent, useState } from "react";

export default function ConnexionPage() {
  const [mode, setMode] = useState<"login" | "register">("login");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  async function submit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault(); setError(""); setLoading(true);
    const form = new FormData(e.currentTarget);
    const body = Object.fromEntries(form.entries());
    const res = await fetch(`/api/auth/${mode === "login" ? "login" : "register"}`, { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(body) });
    const data = await res.json(); setLoading(false);
    if (!res.ok) return setError(data.error ?? "Une erreur est survenue.");
    window.location.href = data.redirect ?? "/";
  }

  return <main style={{minHeight:"100vh",display:"grid",placeItems:"center",padding:24,background:"#f4f7f6"}}>
    <section style={{width:"100%",maxWidth:460,background:"white",borderRadius:24,padding:32,boxShadow:"0 20px 60px rgba(0,0,0,.08)"}}>
      <div style={{fontWeight:900,fontSize:24,marginBottom:8}}>COMPLIANCE</div>
      <p style={{color:"#60706a",marginTop:0}}>Votre passeport de compétences HSE & minières.</p>
      <div style={{display:"flex",gap:8,margin:"24px 0"}}>
        <button onClick={()=>setMode("login")} style={{flex:1,padding:12,borderRadius:12,border:"1px solid #d7dfdb",fontWeight:700}}>Connexion</button>
        <button onClick={()=>setMode("register")} style={{flex:1,padding:12,borderRadius:12,border:"1px solid #d7dfdb",fontWeight:700}}>Créer un compte</button>
      </div>
      <form onSubmit={submit} style={{display:"grid",gap:14}}>
        {mode === "register" && <input name="name" required placeholder="Nom complet" style={input}/>} 
        <input name="email" type="email" required placeholder="Adresse e-mail" style={input}/>
        <input name="password" type="password" required minLength={10} placeholder="Mot de passe" style={input}/>
        {mode === "login" && <div style={{textAlign:"right",marginTop:-4}}><Link href="/mot-de-passe-oublie" style={{fontSize:14,fontWeight:700,color:"#184f3f",textDecoration:"none"}}>Mot de passe oublié ?</Link></div>}
        {error && <p style={{color:"#b42318",margin:0}}>{error}</p>}
        <button disabled={loading} style={{padding:14,border:0,borderRadius:12,background:"#123f32",color:"white",fontWeight:800}}>{loading ? "Traitement…" : mode === "login" ? "Se connecter" : "Créer mon passeport"}</button>
      </form>
    </section>
  </main>;
}

const input = { padding:14, borderRadius:12, border:"1px solid #d7dfdb", fontSize:16 } as const;
