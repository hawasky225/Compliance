"use client";
import Link from "next/link";
import { usePathname } from "next/navigation";

const nav = [
  ["/dashboard", "Accueil"],
  ["/formations", "Mes formations"],
  ["/certifications", "Certifications"],
  ["/passeport", "Mon Passeport"],
];

function initials(name: string) {
  return name.split(/\s+/).filter(Boolean).slice(0, 2).map((part) => part[0]?.toUpperCase()).join("") || "CP";
}

export function AppShell({ children, userName, jobTitle }: { children: React.ReactNode; userName: string; jobTitle?: string | null }) {
  const path = usePathname();
  const avatar = initials(userName);
  return <div className="app-layout">
    <aside className="sidebar">
      <Link href="/dashboard" className="brand"><span className="brand-mark">C</span><span>compliance</span></Link>
      <div className="workspace-pill"><span>⛏</span><div><small>Espace professionnel</small><strong>Mines & HSE</strong></div></div>
      <nav>{nav.map(([href,label]) => <Link key={href} href={href} className={path.startsWith(href) ? "nav-link active" : "nav-link"}>{label}</Link>)}</nav>
      <div className="user-mini"><div className="avatar">{avatar}</div><div><strong>{userName}</strong><small>{jobTitle || "Professionnel minier"}</small></div></div>
    </aside>
    <main className="main-area"><header className="topbar"><strong>Espace professionnel</strong><div className="avatar">{avatar}</div></header><div className="content">{children}</div></main>
  </div>;
}
