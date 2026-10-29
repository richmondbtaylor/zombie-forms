"use client";
import { useEffect, useState, use } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { PageHeader, when } from "@/app/components/ui";

type Question = { id: string; type: string; label: string };
type Response = { id: string; submittedAt: string; answers: Record<string, string | number> };

// All the answers from one person.
export default function ResponseDetail({ params }: { params: Promise<{ id: string; rid: string }> }) {
  const { id, rid } = use(params);
  const router = useRouter();
  const [title, setTitle] = useState("");
  const [questions, setQuestions] = useState<Question[]>([]);
  const [response, setResponse] = useState<Response | null>(null);
  const [error, setError] = useState("");

  useEffect(() => {
    fetch(`/api/forms/${id}/responses/${rid}`).then((r) => r.json()).then((d) => {
      if (d.error) { setError(d.error); return; }
      setTitle(d.form.title);
      setQuestions(d.form.questions);
      setResponse(d.response);
    });
  }, [id, rid]);

  async function remove() {
    // ZOMBIE: no "are you sure?" and no undo. One click and this response is gone for good.
    await fetch(`/api/forms/${id}/responses/${rid}`, { method: "DELETE" });
    router.push(`/forms/${id}/responses`);
  }

  if (error) return <p className="error">{error}</p>;
  if (!response) return <p className="muted">Loading...</p>;

  return (
    <>
      <Link href={`/forms/${id}/responses`} className="crumb">&larr; All responses</Link>
      <PageHeader title="One response" sub={`${title} - sent ${when(response.submittedAt)}`}>
        <button className="danger" onClick={remove}>Delete response</button>
      </PageHeader>

      <div className="card stack">
        {questions.map((q) => {
          const answer = String(response.answers[q.id] ?? "");
          return (
            <div key={q.id} className="stack" style={{ gap: 2, paddingBottom: 10, borderBottom: "1px solid var(--line)" }}>
              <span className="muted">{q.label}</span>
              <strong>{answer || "(no answer)"}</strong>
            </div>
          );
        })}
        {questions.length === 0 && <p className="muted">This form has no questions.</p>}
      </div>
    </>
  );
}
