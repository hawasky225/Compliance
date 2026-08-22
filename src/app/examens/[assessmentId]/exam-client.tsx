"use client";

import Link from "next/link";
import { useMemo, useState } from "react";

type Question = { id: string; prompt: string; type: string; options: string[]; points: number };
type StartedExam = { attemptId: string; title: string; durationMinutes: number; passingScore: number; questions: Question[] };

type ExamResult = {
  score: number;
  passed: boolean;
  certification?: { certificateNumber: string } | null;
};

export default function ExamClient({ assessmentId }: { assessmentId: string }) {
  const [exam, setExam] = useState<StartedExam | null>(null);
  const [answers, setAnswers] = useState<Record<string, string[]>>({});
  const [result, setResult] = useState<ExamResult | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const answered = useMemo(() => Object.values(answers).filter((value) => value?.length).length, [answers]);
  const total = exam?.questions.length ?? 0;
  const progress = total ? Math.round((answered / total) * 100) : 0;

  async function start() {
    setError(null);
    setLoading(true);
    try {
      const response = await fetch(`/api/exams/${assessmentId}/start`, { method: "POST" });
      const data = await response.json();
      if (!response.ok) return setError(data.error ?? "Impossible de démarrer l’examen");
      setExam(data);
    } finally {
      setLoading(false);
    }
  }

  function choose(questionId: string, value: string) {
    setAnswers((current) => ({ ...current, [questionId]: [value] }));
  }

  async function submit() {
    if (!exam) return;
    if (answered < exam.questions.length) {
      setError("Répondez à toutes les questions avant de soumettre l’examen.");
      return;
    }
    setError(null);
    setLoading(true);
    try {
      const response = await fetch(`/api/exams/attempts/${exam.attemptId}/submit`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ answers }),
      });
      const data = await response.json();
      if (!response.ok) return setError(data.error ?? "Impossible de soumettre l’examen");
      setResult(data);
    } finally {
      setLoading(false);
    }
  }

  if (result) {
    return (
      <section className="exam-result-shell">
        <div className={`result-orb ${result.passed ? "passed" : "failed"}`}>{result.passed ? "✓" : "!"}</div>
        <p className="exam-eyebrow">RÉSULTAT OFFICIEL</p>
        <h1>{result.passed ? "Examen réussi" : "Examen non réussi"}</h1>
        <div className="result-score">{result.score}%</div>
        <p className="result-copy">
          {result.passed
            ? "Votre résultat satisfait au seuil requis. Votre dossier de compétences a été mis à jour."
            : "Le seuil requis n’a pas été atteint. Une nouvelle tentative pourra être utilisée si elle reste disponible."}
        </p>
        {result.certification && (
          <div className="certificate-banner">
            <span>Certification délivrée</span>
            <strong>{result.certification.certificateNumber}</strong>
          </div>
        )}
        <div className="result-actions">
          <Link className="exam-btn primary" href="/dashboard">Tableau de bord</Link>
          <Link className="exam-btn secondary" href="/formations">Mes formations</Link>
          {result.certification && <Link className="exam-btn secondary" href="/mes-certifications">Voir ma certification</Link>}
        </div>
        <style jsx>{styles}</style>
      </section>
    );
  }

  if (!exam) {
    return (
      <section className="exam-start-shell">
        <div className="exam-start-card">
          <div className="start-icon">✦</div>
          <p className="exam-eyebrow">ÉVALUATION CERTIFIANTE</p>
          <h1>Prêt à commencer ?</h1>
          <p className="start-copy">Une tentative est comptabilisée dès que l’examen démarre. Vérifiez que vous êtes prêt avant de continuer.</p>
          <div className="start-rules">
            <div><span>01</span><p><strong>Une seule réponse</strong><small>Sélectionnez la meilleure réponse pour chaque question.</small></p></div>
            <div><span>02</span><p><strong>Progression complète</strong><small>Toutes les questions doivent être renseignées avant l’envoi.</small></p></div>
            <div><span>03</span><p><strong>Résultat immédiat</strong><small>Votre score et votre statut de certification apparaissent à la fin.</small></p></div>
          </div>
          {error && <div className="exam-error">{error}</div>}
          <button className="exam-btn primary wide" onClick={start} disabled={loading}>{loading ? "Ouverture de l’examen…" : "Démarrer ma tentative"}</button>
          <Link className="back-link" href="/formations">← Retour aux formations</Link>
        </div>
        <style jsx>{styles}</style>
      </section>
    );
  }

  return (
    <section className="exam-page">
      <header className="exam-hero">
        <div>
          <p className="exam-eyebrow light">EXAMEN EN COURS</p>
          <h1>{exam.title}</h1>
          <p>Répondez à chaque question puis soumettez votre tentative.</p>
        </div>
        <div className="hero-metrics">
          <div><strong>{exam.questions.length}</strong><span>questions</span></div>
          <div><strong>{exam.durationMinutes}</strong><span>minutes</span></div>
          <div><strong>{exam.passingScore}%</strong><span>score requis</span></div>
        </div>
      </header>

      <div className="exam-grid">
        <div className="question-stack">
          {exam.questions.map((q, index) => {
            const selected = answers[q.id]?.[0];
            return (
              <article className="question-panel" key={q.id}>
                <div className="question-head">
                  <span className="question-number">{String(index + 1).padStart(2, "0")}</span>
                  <div>
                    <small>QUESTION {index + 1} SUR {exam.questions.length}</small>
                    <h2>{q.prompt}</h2>
                  </div>
                </div>
                <div className="answer-list">
                  {q.options.map((option, optionIndex) => {
                    const checked = selected === option;
                    return (
                      <label className={`answer-option ${checked ? "selected" : ""}`} key={option}>
                        <input type="radio" name={q.id} checked={checked} onChange={() => choose(q.id, option)} />
                        <span className="option-letter">{String.fromCharCode(65 + optionIndex)}</span>
                        <span>{option}</span>
                        <i>{checked ? "✓" : ""}</i>
                      </label>
                    );
                  })}
                </div>
              </article>
            );
          })}
        </div>

        <aside className="exam-sidebar">
          <div className="progress-card">
            <p className="exam-eyebrow">PROGRESSION</p>
            <div className="progress-row"><strong>{answered}/{total}</strong><span>{progress}%</span></div>
            <div className="exam-progress"><i style={{ width: `${progress}%` }} /></div>
            <small>Questions répondues</small>
          </div>
          <div className="question-index">
            <strong>Navigation</strong>
            <div>{exam.questions.map((q, index) => <span key={q.id} className={answers[q.id]?.length ? "done" : ""}>{index + 1}</span>)}</div>
          </div>
          <div className="security-card">
            <strong>Évaluation sécurisée</strong>
            <p>Votre tentative et vos réponses sont enregistrées dans votre dossier professionnel.</p>
          </div>
          {error && <div className="exam-error">{error}</div>}
          <button className="exam-btn primary wide" onClick={submit} disabled={loading || answered < total}>
            {loading ? "Soumission…" : answered < total ? `Répondre aux ${total - answered} question${total - answered > 1 ? "s" : ""} restante${total - answered > 1 ? "s" : ""}` : "Soumettre l’examen"}
          </button>
          <Link className="back-link centered" href="/formations">Quitter et revenir aux formations</Link>
        </aside>
      </div>
      <style jsx>{styles}</style>
    </section>
  );
}

const styles = `
  .exam-page,.exam-start-shell,.exam-result-shell{max-width:1180px;margin:0 auto;padding:8px 0 48px;color:#17211c}
  .exam-hero{background:linear-gradient(135deg,#0f382b,#164b39);border-radius:24px;padding:32px 34px;color:#fff;display:flex;justify-content:space-between;gap:32px;align-items:flex-end;box-shadow:0 24px 60px rgba(18,63,50,.15);margin-bottom:24px}
  .exam-hero h1{font-family:Georgia,serif;font-size:32px;line-height:1.18;margin:4px 0 10px;font-weight:600}.exam-hero>div>p:last-child{margin:0;color:#c8d9d1;font-size:13px}
  .exam-eyebrow{font-size:10px;font-weight:850;letter-spacing:1.5px;color:#6c7d73;margin:0 0 7px}.exam-eyebrow.light{color:#a9c5b8}
  .hero-metrics{display:grid;grid-template-columns:repeat(3,92px);gap:8px}.hero-metrics>div{background:rgba(255,255,255,.08);border:1px solid rgba(255,255,255,.12);border-radius:14px;padding:14px;text-align:center}.hero-metrics strong,.hero-metrics span{display:block}.hero-metrics strong{font-family:Georgia,serif;font-size:24px}.hero-metrics span{font-size:9px;color:#bcd0c6;margin-top:4px;text-transform:uppercase;letter-spacing:.5px}
  .exam-grid{display:grid;grid-template-columns:minmax(0,1fr) 300px;gap:22px;align-items:start}.question-stack{display:grid;gap:18px}.question-panel,.progress-card,.question-index,.security-card,.exam-start-card,.exam-result-shell{background:#fff;border:1px solid #e0e7e2;border-radius:18px;box-shadow:0 12px 34px rgba(24,52,40,.06)}.question-panel{padding:24px}.question-head{display:flex;gap:16px;align-items:flex-start;margin-bottom:20px}.question-number{width:42px;height:42px;border-radius:12px;background:#edf5f0;color:#1f6a4d;display:grid;place-items:center;font-weight:850;font-size:12px;flex:0 0 42px}.question-head small{font-size:9px;color:#849087;font-weight:800;letter-spacing:.8px}.question-head h2{font-size:18px;line-height:1.45;margin:5px 0 0;font-weight:720}
  .answer-list{display:grid;gap:10px}.answer-option{display:grid;grid-template-columns:auto 32px 1fr 22px;align-items:center;gap:10px;border:1px solid #dce4df;border-radius:13px;padding:13px 14px;cursor:pointer;transition:.15s;background:#fff;font-size:13px}.answer-option:hover{border-color:#9fbeae;background:#fafcfb}.answer-option.selected{border-color:#2a7657;background:#eef7f2;box-shadow:0 0 0 1px #2a7657 inset}.answer-option input{width:15px;height:15px;accent-color:#1f6a4d}.option-letter{width:28px;height:28px;border-radius:8px;background:#f3f6f4;color:#587066;display:grid;place-items:center;font-size:10px;font-weight:850}.answer-option.selected .option-letter{background:#dcefe5;color:#1f6a4d}.answer-option i{font-style:normal;color:#1f6a4d;font-weight:900}
  .exam-sidebar{position:sticky;top:92px;display:grid;gap:14px}.progress-card,.question-index,.security-card{padding:18px}.progress-row{display:flex;justify-content:space-between;align-items:baseline}.progress-row strong{font-family:Georgia,serif;font-size:25px}.progress-row span{font-size:11px;font-weight:800;color:#2d7458}.exam-progress{height:7px;background:#edf1ee;border-radius:999px;overflow:hidden;margin:10px 0 7px}.exam-progress i{display:block;height:100%;background:#2b7658;border-radius:999px;transition:width .2s}.progress-card>small{font-size:9px;color:#89938d}.question-index>strong,.security-card>strong{font-size:12px}.question-index>div{display:grid;grid-template-columns:repeat(5,1fr);gap:7px;margin-top:12px}.question-index span{height:34px;border-radius:9px;background:#f4f6f4;color:#879189;display:grid;place-items:center;font-size:10px;font-weight:800}.question-index span.done{background:#e5f3ea;color:#236e4d}.security-card{background:#f6faf7}.security-card p{font-size:10px;color:#718077;line-height:1.55;margin:6px 0 0}
  .exam-btn{display:inline-flex;align-items:center;justify-content:center;min-height:44px;border-radius:11px;padding:11px 17px;font-size:12px;font-weight:800;text-decoration:none;cursor:pointer}.exam-btn.primary{background:#123f32;color:#fff;border:1px solid #123f32}.exam-btn.primary:disabled{opacity:.48;cursor:not-allowed}.exam-btn.secondary{background:#fff;color:#173c30;border:1px solid #cfdbd5}.exam-btn.wide{width:100%}.back-link{display:inline-block;color:#537066;font-size:11px;font-weight:700;text-decoration:none;margin-top:15px}.back-link.centered{text-align:center;width:100%;margin-top:2px}.exam-error{background:#fff1ee;border:1px solid #f0d5ce;color:#a63d2c;border-radius:10px;padding:11px 12px;font-size:11px;line-height:1.4}
  .exam-start-shell{min-height:70vh;display:grid;place-items:center}.exam-start-card{width:min(620px,100%);padding:34px}.start-icon{width:50px;height:50px;border-radius:14px;background:#e4f2e9;color:#1d6b4b;display:grid;place-items:center;font-size:21px;margin-bottom:20px}.exam-start-card h1,.exam-result-shell h1{font-family:Georgia,serif;font-size:34px;margin:5px 0 10px}.start-copy,.result-copy{color:#68776f;line-height:1.65;font-size:13px}.start-rules{display:grid;gap:10px;margin:24px 0}.start-rules>div{display:flex;gap:12px;padding:13px;border:1px solid #e4e9e6;border-radius:12px;background:#fbfcfb}.start-rules>div>span{width:30px;height:30px;border-radius:8px;background:#edf5f0;color:#276c50;display:grid;place-items:center;font-size:9px;font-weight:850}.start-rules p{margin:0}.start-rules strong,.start-rules small{display:block}.start-rules strong{font-size:11px}.start-rules small{font-size:10px;color:#7d8982;margin-top:3px;line-height:1.4}
  .exam-result-shell{width:min(720px,100%);margin:40px auto;text-align:center;padding:38px}.result-orb{width:62px;height:62px;border-radius:50%;display:grid;place-items:center;margin:0 auto 18px;font-size:28px;font-weight:900}.result-orb.passed{background:#e0f1e6;color:#1f704b}.result-orb.failed{background:#fff0e8;color:#a2531d}.result-score{font-family:Georgia,serif;font-size:64px;line-height:1;color:#153f31;margin:20px 0 12px}.result-copy{max-width:520px;margin:0 auto}.certificate-banner{margin:24px auto 0;max-width:470px;padding:15px 18px;border-radius:13px;background:#f0f7f3;border:1px solid #d7e7de;display:flex;justify-content:space-between;gap:14px;text-align:left}.certificate-banner span{font-size:10px;color:#718077}.certificate-banner strong{font-size:11px}.result-actions{display:flex;justify-content:center;gap:9px;flex-wrap:wrap;margin-top:25px}
  @media(max-width:900px){.exam-hero{display:block}.hero-metrics{margin-top:22px;grid-template-columns:repeat(3,1fr)}.exam-grid{grid-template-columns:1fr}.exam-sidebar{position:static}.question-index>div{grid-template-columns:repeat(8,1fr)}}
  @media(max-width:600px){.exam-hero{padding:24px}.exam-hero h1{font-size:26px}.hero-metrics{grid-template-columns:1fr}.question-panel,.exam-start-card,.exam-result-shell{padding:20px}.question-head{gap:10px}.question-head h2{font-size:16px}.answer-option{grid-template-columns:auto 28px 1fr 18px;padding:11px}.question-index>div{grid-template-columns:repeat(5,1fr)}}
`;
