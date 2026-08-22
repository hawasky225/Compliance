# Compliance MVP

Plateforme française de formation, compétences et certification pour les professionnels HSE et miniers.

## MVP vertical slice
- Tableau de bord professionnel
- Catalogue et progression des formations
- Gestion des certifications et échéances
- Passeport professionnel
- Vérification publique d'un certificat par code
- Schéma PostgreSQL/Prisma pour comptes, résultats, examens et certifications

## Démarrage
```bash
cp .env.example .env.local
npm install
npx prisma generate
npm run dev
```

## Certifications initiales
1. PCM-HSE-F — Professionnel Certifié HSE Minier — Fondation
2. PCM-II — Investigation d'Incidents Miniers
3. PCM-ER — Évaluation des Risques Miniers

Règles MVP : score minimum 75 %, 2 tentatives, validité 36 mois, paramètres configurables par certification.
