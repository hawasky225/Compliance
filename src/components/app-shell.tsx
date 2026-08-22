"use client";
import Link from "next/link";
import { usePathname } from "next/navigation";

const nav = [
  ["/dashboard", "Accueil"],
  ["/formations", "Mes formations"],
  ["/certifications", "Certifications"],
  ["/passeport", "Mon Passeport"],
];

export function AppShell({ children }: { children: React.ReactNode }) {
  const path = usePathname();
  return <div className="app-layout">
    <aside className="sidebar">
      <Link href="/dashboard" className="brand"><span className="brand-mark">C</span><span>compliance</span></Link>
      <div className="workspace-pill"><span>⛏</span><div><small>Espace professionnel</small><strong>Mines & HSE</strong></div></div>
      <nav>{nav.map(([href,label]) => <Link key={href} href={href} className={path.startsWith(href) ? "nav-link active" : "nav-link"}>{label}</Link>)}</nav>
      <div className="user-mini"><div className="avatar">MK</div><div><strong>Moussa Koné</strong><small>Superviseur HSE</small></div></div>
    </aside>
    <main className="main-area"><header className="topbar"><strong>Espace professionnel</strong><div className="avatar">MK</div></header><div className="content">{children}</div></main>
  </div>;
}
