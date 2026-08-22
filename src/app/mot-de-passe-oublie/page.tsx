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

  return <main style={page}><section style={card}>
    <div style={{fontWeight:900,fontSize:24}}>COMPLIANCE</div>
    <p style={{fontSize:12,fontWeight:800,letterSpacing:1.5,textTransform:"uppercase",color:"#23745b",marginBottom:6}}>Récupération de compte</p>
    <h1 style={{margin:"0 0 8px",fontSize:32}}>Mot de passe oublié</h1>
    <p style={{color:"#60706a",marginTop:0}}>Entrez l’adresse e-mail associée à votre compte.</p>
    <form onSubmit={submit} style={{display:"grid",gap:14,marginTop:24}}>
      <input style={input} type="email" value={email} onChange={e=>setEmail(e.target.value)} placeholder="Adresse e-mail" required />
      {error&&<p style={{color:"#b42318",margin:0}}>{error}</p>}
      {message&&<p style={{color:"#23745b",margin:0}}>{message}</p>}
      <button style={primary} type="submit">Continuer</button>
    </form>
    {recoveryMode&&<div style={recoveryBox}><strong>Compte administrateur bootstrap</strong><p style={{color:"#60706a"}}>Utilisez le code de récupération administrateur pour définir un nouveau mot de passe.</p><Link style={secondary} href={`/reinitialiser-mot-de-passe?email=${encodeURIComponent(email)}&recovery=1`}>Saisir le code de récupération</Link></div>}
    <Link style={back} href="/connexion">← Retour à la connexion</Link>
  </section></main>;
}

const page={minHeight:"100vh",display:"grid",placeItems:"center",padding:24,background:"#f4f7f6"} as const;
const card={width:"100%",maxWidth:520,background:"white",borderRadius:24,padding:36,boxShadow:"0 20px 60px rgba(0,0,0,.08)"} as const;
const input={padding:14,borderRadius:12,border:"1px solid #d7dfdb",fontSize:16} as const;
const primary={padding:14,border:0,borderRadius:12,background:"#123f32",color:"white",fontWeight:800,fontSize:15,cursor:"pointer"} as const;
const secondary={display:"inline-block",padding:"11px 14px",borderRadius:10,border:"1px solid #c9d7d1",color:"#123f32",fontWeight:800,textDecoration:"none"} as const;
const recoveryBox={marginTop:22,padding:18,borderRadius:14,background:"#f2f7f5",border:"1px solid #dbe7e2"} as const;
const back={display:"inline-block",marginTop:24,color:"#365b50",fontWeight:700,textDecoration:"none"} as const;
