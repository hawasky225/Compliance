import { redirect } from "next/navigation";
import { getSessionUserId } from "@/lib/auth";
import ExamClient from "./exam-client";

export default async function ExamPage({ params }: { params: Promise<{ assessmentId: string }> }) {
  const userId = await getSessionUserId();
  if (!userId) redirect('/connexion');
  const { assessmentId } = await params;
  return <main className="page-shell"><ExamClient assessmentId={assessmentId} /></main>;
}
