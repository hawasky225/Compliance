import type { Metadata } from "next";
import "./globals.css";
import "./admin-premium.css";
import "./curriculum.css";

export const metadata: Metadata = {
  title: "Compliance — Certification HSE & Mines",
  description: "Passeport de compétences et certifications pour les professionnels HSE et miniers."
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return <html lang="fr"><body>{children}</body></html>;
}
