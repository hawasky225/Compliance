export const professional = {
  name: "Moussa Koné",
  role: "Superviseur HSE",
  sector: "Secteur minier",
  location: "Abidjan, Côte d’Ivoire",
  initials: "MK",
  verified: true,
  hours: 42,
  average: 84,
};

export const certifications = [
  { code: "PCM-HSE-F-000184", short: "PCM-HSE-F", title: "Professionnel Certifié HSE Minier — Fondation", issued: "14 juin 2026", expires: "13 juin 2029", status: "Actif", tone: "success" },
  { code: "PCM-II-000091", short: "PCM-II", title: "Investigation d’Incidents Miniers", issued: "03 avril 2026", expires: "02 avril 2029", status: "Actif", tone: "success" },
  { code: "PCM-ER-000127", short: "PCM-ER", title: "Évaluation des Risques Miniers", issued: "18 nov. 2024", expires: "18 nov. 2026", status: "À renouveler", tone: "warning" },
];

export const courses = [
  { id: "incident", title: "Investigation d’incidents miniers", category: "Sécurité minière", duration: "8 h", modules: 6, progress: 72, status: "En cours", level: "Intermédiaire" },
  { id: "risk", title: "Évaluation et maîtrise des risques", category: "Gestion des risques", duration: "10 h", modules: 8, progress: 100, status: "Terminé", level: "Intermédiaire" },
  { id: "hse", title: "Fondamentaux HSE pour l’industrie minière", category: "HSE minier", duration: "16 h", modules: 12, progress: 100, status: "Terminé", level: "Fondation" },
];
