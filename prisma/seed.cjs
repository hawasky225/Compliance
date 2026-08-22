const { PrismaClient } = require('@prisma/client');
const crypto = require('node:crypto');
const prisma = new PrismaClient();

const schemes = [
  {
    code: 'PCM-HSE-F', title: 'Professionnel Certifié HSE Minier — Fondation', description: 'Fondamentaux HSE applicables aux opérations minières.',
    course: { slug: 'fondamentaux-hse-minier', title: 'Fondamentaux HSE Minier', description: 'Parcours d’induction et de maîtrise des fondamentaux HSE pour travailler en sécurité sur un site minier.', durationMinutes: 360, level: 'Fondation' },
    curriculum: [
      { title: 'Induction & culture HSE minière', description: 'Comprendre les règles fondamentales avant l’accès aux opérations.', chapters: [
        ['Induction générale du site minier','Règles cardinales, zones de travail, communication et responsabilités HSE.',35],
        ['Identification des dangers & JSA/JHA','Reconnaître les dangers et préparer une analyse de risques avant tâche.',45],
        ['EPI, signalisation et permis de travail','Choisir les EPI, respecter la signalisation et comprendre le système de permis.',35],
      ]},
      { title: 'Risques opérationnels essentiels', description: 'Appliquer les contrôles de base sur les activités minières courantes.', chapters: [
        ['Engins mobiles et circulation sur mine','Angles morts, interactions piétons-engins, zones d’exclusion et radio.',45],
        ['Incidents, HiPo et premiers réflexes','Sécurisation, alerte, conservation des faits et remontée des événements.',40],
        ['Environnement minier & prévention des pollutions','Déchets, hydrocarbures, poussières, eau, bruit et réponse aux déversements.',40],
      ]},
    ],
    questions: [
      ['Quel est l’objectif principal d’une évaluation des risques ?', ['Identifier les dangers et définir les contrôles', 'Remplacer les inspections', 'Éliminer toute documentation', 'Mesurer uniquement les coûts'], ['Identifier les dangers et définir les contrôles']],
      ['Un contrôle critique est un contrôle dont la défaillance peut contribuer directement à un événement majeur.', ['Vrai', 'Faux'], ['Vrai']],
      ['Après un incident, quelle action doit être priorisée ?', ['Sécuriser la zone et prendre en charge les personnes', 'Chercher immédiatement un responsable', 'Reprendre le travail sans analyse', 'Supprimer les preuves'], ['Sécuriser la zone et prendre en charge les personnes']],
      ['La hiérarchie des contrôles privilégie quelle approche ?', ['Éliminer le danger lorsque possible', 'Utiliser uniquement des EPI', 'Former sans modifier le risque', 'Accepter le risque'], ['Éliminer le danger lorsque possible']],
    ],
  },
  {
    code: 'PCM-II', title: 'Professionnel Certifié en Investigation d’Incidents Miniers', description: 'Méthodes d’investigation, causes racines et actions correctives.',
    course: { slug: 'investigation-incidents-miniers', title: 'Investigation d’Incidents Miniers', description: 'Parcours pratique pour conduire une investigation factuelle, identifier les causes et vérifier l’efficacité des actions.', durationMinutes: 300, level: 'Praticien' },
    curriculum: [
      { title: 'Maîtriser la scène et les faits', description: 'Construire une investigation sur des preuves vérifiables.', chapters: [
        ['Sécurisation de la scène et réponse initiale','Protéger les personnes, stabiliser la situation et préserver les preuves.',35],
        ['Collecte des faits et entretiens','Photos, données, documents, chronologie et techniques d’entretien non accusatoires.',45],
        ['Chronologie et causes immédiates','Reconstituer l’événement et distinguer faits, écarts et hypothèses.',40],
      ]},
      { title: 'Causes racines & actions', description: 'Passer des constats à des mesures de prévention durables.', chapters: [
        ['5 Why, arbre des causes et ICAM','Utiliser des méthodes structurées pour rechercher les causes sous-jacentes.',50],
        ['Actions correctives et hiérarchie des contrôles','Définir des actions reliées aux causes, responsables et échéances.',40],
        ['Vérification d’efficacité et clôture','Mesurer l’efficacité, documenter les preuves et clôturer l’investigation.',35],
      ]},
    ],
    questions: [
      ['Une cause racine est :', ['Une cause sous-jacente dont le traitement réduit la probabilité de récidive', 'Le nom de la personne impliquée', 'Toujours une erreur humaine', 'Le dommage final'], ['Une cause sous-jacente dont le traitement réduit la probabilité de récidive']],
      ['L’investigation doit préserver les faits avant de formuler des conclusions.', ['Vrai', 'Faux'], ['Vrai']],
      ['Une bonne action corrective doit être :', ['Liée à une cause identifiée et vérifiable', 'Toujours une formation', 'Sans responsable', 'Sans échéance'], ['Liée à une cause identifiée et vérifiable']],
      ['Quel élément est une source de preuve utile ?', ['Témoignages, photos, procédures et données', 'Rumeurs uniquement', 'Opinions sans faits', 'Aucun document'], ['Témoignages, photos, procédures et données']],
    ],
  },
  {
    code: 'PCM-ER', title: 'Professionnel Certifié en Évaluation des Risques Miniers', description: 'Identification des dangers, évaluation et maîtrise des risques miniers.',
    course: { slug: 'evaluation-risques-miniers', title: 'Évaluation des Risques Miniers', description: 'Parcours praticien pour analyser les risques, définir les contrôles critiques et réévaluer le risque résiduel.', durationMinutes: 300, level: 'Praticien' },
    curriculum: [
      { title: 'Méthodes d’évaluation du risque', description: 'Structurer l’identification, la cotation et la priorisation des risques.', chapters: [
        ['Danger, risque et scénarios redoutés','Distinguer danger, événement, conséquence et exposition.',35],
        ['Matrice de risques et cotation','Évaluer probabilité, gravité et niveau de risque avec des critères cohérents.',45],
        ['JSA/JHA et analyse avant tâche','Décomposer une activité en étapes et définir les contrôles avant exécution.',40],
      ]},
      { title: 'Contrôles critiques & réévaluation', description: 'Concevoir, vérifier et améliorer les barrières de maîtrise.', chapters: [
        ['Hiérarchie des contrôles','Prioriser élimination, substitution, ingénierie, administratif et EPI.',40],
        ['BowTie et contrôles critiques','Relier menaces, événement redouté, conséquences et barrières critiques.',50],
        ['Risque résiduel et management of change','Réévaluer après contrôles et lors des changements d’équipement ou de procédé.',40],
      ]},
    ],
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

async function seedCurriculum(course, curriculum) {
  for (let mi = 0; mi < curriculum.length; mi++) {
    const spec = curriculum[mi];
    let module = await prisma.courseModule.findFirst({ where: { courseId: course.id, title: spec.title } });
    if (module) module = await prisma.courseModule.update({ where: { id: module.id }, data: { description: spec.description, sortOrder: mi, published: true } });
    else module = await prisma.courseModule.create({ data: { courseId: course.id, title: spec.title, description: spec.description, sortOrder: mi, published: true } });
    for (let ci = 0; ci < spec.chapters.length; ci++) {
      const [title, summary, durationMinutes] = spec.chapters[ci];
      const existing = await prisma.chapter.findFirst({ where: { moduleId: module.id, title } });
      const data = { title, summary, body: summary, contentType: 'TEXT', durationMinutes, sortOrder: ci, required: true, published: true };
      if (existing) await prisma.chapter.update({ where: { id: existing.id }, data });
      else await prisma.chapter.create({ data: { moduleId: module.id, ...data } });
    }
  }
}

async function main() {
  await bootstrapAdmin();
  for (const item of schemes) {
    const scheme = await prisma.certificationScheme.upsert({ where: { code: item.code }, update: { title: item.title, description: item.description, active: true }, create: { code: item.code, title: item.title, description: item.description, validityMonths: 36, passingScore: 75, maxAttempts: 2 } });
    const course = await prisma.course.upsert({ where: { slug: item.course.slug }, update: { ...item.course, published: true }, create: { ...item.course, published: true } });
    await seedCurriculum(course, item.curriculum);
    let assessment = await prisma.assessment.findFirst({ where: { courseId: course.id, schemeId: scheme.id } });
    if (!assessment) assessment = await prisma.assessment.create({ data: { courseId: course.id, schemeId: scheme.id, title: `Examen — ${item.title}`, type: 'EXAM', passingScore: 75, maxAttempts: 2, durationMinutes: 45, published: true, requiresCourseCompletion: true } });
    else assessment = await prisma.assessment.update({ where: { id: assessment.id }, data: { published: true, requiresCourseCompletion: true } });
    const count = await prisma.question.count({ where: { assessmentId: assessment.id } });
    if (count === 0) await prisma.question.createMany({ data: item.questions.map((q, i) => ({ assessmentId: assessment.id, prompt: q[0], type: q[1].length === 2 && q[1].includes('Vrai') ? 'TRUE_FALSE' : 'SINGLE_CHOICE', options: q[1], correctAnswers: q[2], points: 1, sortOrder: i + 1 })) });
  }
}

main().finally(() => prisma.$disconnect());
