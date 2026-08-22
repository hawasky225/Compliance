const { PrismaClient } = require('@prisma/client');
const crypto = require('node:crypto');
const prisma = new PrismaClient();

const schemes = [
  {
    code: 'PCM-HSE-F', title: 'Professionnel Certifié HSE Minier — Fondation', description: 'Fondamentaux HSE applicables aux opérations minières.',
    course: { slug: 'fondamentaux-hse-minier', title: 'Fondamentaux HSE Minier', description: 'Risques, contrôles critiques, incidents et environnement.', durationMinutes: 360, level: 'Fondation' },
    questions: [
      ['Quel est l’objectif principal d’une évaluation des risques ?', ['Identifier les dangers et définir les contrôles', 'Remplacer les inspections', 'Éliminer toute documentation', 'Mesurer uniquement les coûts'], ['Identifier les dangers et définir les contrôles']],
      ['Un contrôle critique est un contrôle dont la défaillance peut contribuer directement à un événement majeur.', ['Vrai', 'Faux'], ['Vrai']],
      ['Après un incident, quelle action doit être priorisée ?', ['Sécuriser la zone et prendre en charge les personnes', 'Chercher immédiatement un responsable', 'Reprendre le travail sans analyse', 'Supprimer les preuves'], ['Sécuriser la zone et prendre en charge les personnes']],
      ['La hiérarchie des contrôles privilégie quelle approche ?', ['Éliminer le danger lorsque possible', 'Utiliser uniquement des EPI', 'Former sans modifier le risque', 'Accepter le risque'], ['Éliminer le danger lorsque possible']],
    ],
  },
  {
    code: 'PCM-II', title: 'Professionnel Certifié en Investigation d’Incidents Miniers', description: 'Méthodes d’investigation, causes racines et actions correctives.',
    course: { slug: 'investigation-incidents-miniers', title: 'Investigation d’Incidents Miniers', description: 'Collecte des faits, causes immédiates et profondes, actions.', durationMinutes: 300, level: 'Praticien' },
    questions: [
      ['Une cause racine est :', ['Une cause sous-jacente dont le traitement réduit la probabilité de récidive', 'Le nom de la personne impliquée', 'Toujours une erreur humaine', 'Le dommage final'], ['Une cause sous-jacente dont le traitement réduit la probabilité de récidive']],
      ['L’investigation doit préserver les faits avant de formuler des conclusions.', ['Vrai', 'Faux'], ['Vrai']],
      ['Une bonne action corrective doit être :', ['Liée à une cause identifiée et vérifiable', 'Toujours une formation', 'Sans responsable', 'Sans échéance'], ['Liée à une cause identifiée et vérifiable']],
      ['Quel élément est une source de preuve utile ?', ['Témoignages, photos, procédures et données', 'Rumeurs uniquement', 'Opinions sans faits', 'Aucun document'], ['Témoignages, photos, procédures et données']],
    ],
  },
  {
    code: 'PCM-ER', title: 'Professionnel Certifié en Évaluation des Risques Miniers', description: 'Identification des dangers, évaluation et maîtrise des risques miniers.',
    course: { slug: 'evaluation-risques-miniers', title: 'Évaluation des Risques Miniers', description: 'Méthodes d’identification, cotation, contrôles et réévaluation.', durationMinutes: 300, level: 'Praticien' },
    questions: [
      ['Le risque combine généralement :', ['Probabilité et gravité', 'Coût et délai', 'Ancienneté et poste', 'Formation et salaire'], ['Probabilité et gravité']],
      ['Une évaluation doit être revue lorsque les conditions de travail changent significativement.', ['Vrai', 'Faux'], ['Vrai']],
      ['Quel contrôle est généralement plus efficace que les EPI ?', ['Une mesure d’ingénierie', 'Un rappel verbal', 'Une affiche seule', 'Aucun'], ['Une mesure d’ingénierie']],
      ['Un risque résiduel est :', ['Le risque restant après application des contrôles', 'Le risque avant toute mesure', 'Un risque inexistant', 'Un coût financier'], ['Le risque restant après application des contrôles']],
    ],
  },
];

function hashPassword(password) {
  const salt = crypto.randomBytes(16).toString('hex');
  const hash = crypto.scryptSync(password, salt, 64).toString('hex');
  return `${salt}:${hash}`;
}

async function bootstrapAdmin() {
  const email = process.env.BOOTSTRAP_ADMIN_EMAIL?.trim().toLowerCase();
  const password = process.env.BOOTSTRAP_ADMIN_PASSWORD;
  if (!email || !password) return;
  if (password.length < 12) throw new Error('BOOTSTRAP_ADMIN_PASSWORD must contain at least 12 characters');
  const existing = await prisma.user.findUnique({ where: { email } });
  if (existing) {
    await prisma.user.update({ where: { email }, data: { role: 'PLATFORM_ADMIN' } });
    return;
  }
  await prisma.user.create({ data: { email, name: 'Compliance Admin', passwordHash: hashPassword(password), role: 'PLATFORM_ADMIN' } });
}

async function main() {
  await bootstrapAdmin();
  for (const item of schemes) {
    const scheme = await prisma.certificationScheme.upsert({ where: { code: item.code }, update: { title: item.title, description: item.description, active: true }, create: { code: item.code, title: item.title, description: item.description, validityMonths: 36, passingScore: 75, maxAttempts: 2 } });
    const course = await prisma.course.upsert({ where: { slug: item.course.slug }, update: { ...item.course, published: true }, create: { ...item.course, published: true } });
    let assessment = await prisma.assessment.findFirst({ where: { courseId: course.id, schemeId: scheme.id } });
    if (!assessment) assessment = await prisma.assessment.create({ data: { courseId: course.id, schemeId: scheme.id, title: `Examen — ${item.title}`, type: 'EXAM', passingScore: 75, maxAttempts: 2, durationMinutes: 45, published: true } });
    const count = await prisma.question.count({ where: { assessmentId: assessment.id } });
    if (count === 0) await prisma.question.createMany({ data: item.questions.map((q, i) => ({ assessmentId: assessment.id, prompt: q[0], type: q[1].length === 2 && q[1].includes('Vrai') ? 'TRUE_FALSE' : 'SINGLE_CHOICE', options: q[1], correctAnswers: q[2], points: 1, sortOrder: i + 1 })) });
  }
}

main().finally(() => prisma.$disconnect());
