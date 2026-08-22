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

  return <main style={page}><section style={card}>
    <div style={{fontWeight:900,fontSize:24}}>COMPLIANCE</div>
    <p style={{fontSize:12,fontWeight:800,letterSpacing:1.5,textTransform:"uppercase",color:"#23745b",marginBottom:6}}>Sécurité du compte</p>
    <h1 style={{margin:"0 0 8px",fontSize:32}}>{title}</h1>
    <p style={{color:"#60706a",marginTop:0}}>{recovery?"Saisissez votre code de récupération puis choisissez un nouveau mot de passe.":"Choisissez un nouveau mot de passe sécurisé pour votre compte."}</p>
    {done?<><p style={{color:"#23745b",padding:"12px 14px",background:"#eef8f3",borderRadius:10}}>Votre mot de passe a été mis à jour.</p><Link style={primaryLink} href="/connexion">Se connecter</Link></>:<form onSubmit={submit} style={{display:"grid",gap:14,marginTop:24}}>
      {recovery&&<input style={input} name="recoveryCode" type="password" placeholder="Code de récupération" required />}
      <input style={input} name="password" type="password" minLength={12} placeholder="Nouveau mot de passe" required />
      <input style={input} name="confirmPassword" type="password" minLength={12} placeholder="Confirmer le nouveau mot de passe" required />
      {error&&<p style={{color:"#b42318",margin:0}}>{error}</p>}
      <button style={primaryButton} type="submit">Mettre à jour le mot de passe</button>
    </form>}
    <Link style={back} href="/connexion">← Retour à la connexion</Link>
  </section></main>;
}

const page={minHeight:"100vh",display:"grid",placeItems:"center",padding:24,background:"#f4f7f6"} as const;
const card={width:"100%",maxWidth:520,background:"white",borderRadius:24,padding:36,boxShadow:"0 20px 60px rgba(0,0,0,.08)"} as const;
const input={padding:14,borderRadius:12,border:"1px solid #d7dfdb",fontSize:16} as const;
const primaryButton={padding:14,border:0,borderRadius:12,background:"#123f32",color:"white",fontWeight:800,fontSize:15,cursor:"pointer"} as const;
const primaryLink={display:"inline-block",padding:"13px 16px",borderRadius:12,background:"#123f32",color:"white",fontWeight:800,textDecoration:"none"} as const;
const back={display:"inline-block",marginTop:24,color:"#365b50",fontWeight:700,textDecoration:"none"} as const;
