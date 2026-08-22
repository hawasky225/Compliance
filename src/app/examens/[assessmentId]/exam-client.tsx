"use client";

import Link from "next/link";
import { useState } from "react";

type Question = { id: string; prompt: string; type: string; options: string[]; points: number };
type StartedExam = { attemptId: string; title: string; durationMinutes: number; passingScore: number; questions: Question[] };

export default function ExamClient({ assessmentId }: { assessmentId: string }) {
  const [exam, setExam] = useState<StartedExam | null>(null);
  const [answers, setAnswers] = useState<Record<string, string[]>>({});
  const [result, setResult] = useState<{ score: number; passed: boolean; certification?: { certificateNumber: string } | null } | null>(null);
  const [error, setError] = useState<string | null>(null);

  async function start() {
    setError(null);
    const response = await fetch(`/api/exams/${assessmentId}/start`, { method: 'POST' });
    const data = await response.json();
    if (!response.ok) return setError(data.error ?? 'Impossible de démarrer l’examen');
    setExam(data);
  }

  function choose(questionId: string, value: string) {
    setAnswers((current) => ({ ...current, [questionId]: [value] }));
  }

  async function submit() {
    if (!exam) return;
    setError(null);
    const response = await fetch(`/api/exams/attempts/${exam.attemptId}/submit`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ answers }),
    });
    const data = await response.json();
    if (!response.ok) return setError(data.error ?? 'Impossible de soumettre l’examen');
    setResult(data);
  }

  if (result) return (
    <section className="card exam-result">
      <p className="eyebrow">RÉSULTAT</p>
      <h2>{result.passed ? 'Examen réussi' : 'Examen non réussi'}</h2>
      <div className="score-big">{result.score}%</div>
      <p>{result.passed ? 'Votre résultat satisfait au seuil requis.' : 'Vous pourrez utiliser une nouvelle tentative si elle est disponible.'}</p>
      {result.certification && <div className="success-panel"><strong>Certification délivrée</strong><span>{result.certification.certificateNumber}</span></div>}
      <div className="meta-row" style={{ marginTop: '1.5rem' }}>
        <Link className="button" href="/dashboard">Retour au tableau de bord</Link>
        <Link className="button" href="/formations">Mes formations</Link>
        {result.certification && <Link className="button" href="/mes-certifications">Voir ma certification</Link>}
      </div>
    </section>
  );

  if (!exam) return <section className="card"><h2>Prêt à commencer ?</h2><p>Une tentative sera comptabilisée dès le démarrage de l’examen.</p>{error && <p className="error-text">{error}</p>}<button className="button" onClick={start}>Démarrer ma tentative</button></section>;

  return <section className="exam-layout"><div className="card"><p className="eyebrow">EXAMEN EN COURS</p><h2>{exam.title}</h2><p>Score requis : {exam.passingScore}% · Durée : {exam.durationMinutes} min</p></div>{exam.questions.map((q, index) => <article className="card question-card" key={q.id}><strong>{index + 1}. {q.prompt}</strong><div className="answer-list">{q.options.map((option) => <label key={option}><input type="radio" name={q.id} checked={answers[q.id]?.[0] === option} onChange={() => choose(q.id, option)} /> {option}</label>)}</div></article>)}{error && <p className="error-text">{error}</p>}<button className="button" onClick={submit}>Soumettre l’examen</button></section>;
}
