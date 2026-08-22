"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

export default function ChapterAction({ chapterId, completed, locked }: { chapterId: string; completed: boolean; locked: boolean }) {
  const router = useRouter();
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  async function complete() {
    if (locked || completed) return;
    setBusy(true); setError("");
    const res = await fetch(`/api/chapters/${chapterId}/complete`, { method: "POST" });
    const data = await res.json().catch(() => ({}));
    setBusy(false);
    if (!res.ok) { setError(data.error || "Impossible de valider le chapitre."); return; }
    router.refresh();
  }
  return <div className="chapter-action">
    <button className={completed ? "outline-btn" : "primary-btn"} disabled={busy || locked || completed} onClick={complete}>
      {locked ? "🔒 Chapitre verrouillé" : completed ? "✓ Chapitre terminé" : busy ? "Validation..." : "Marquer comme terminé"}
    </button>
    {error && <small className="error-text">{error}</small>}
  </div>;
}
