"use client";
import { useEffect, useState, use } from "react";
import Link from "next/link";
import { PageHeader, Stat, Empty, when } from "@/app/components/ui";

type Question = { id: string; type: string; label: string };
type Response = { id: string; submittedAt: string; answers: Record<string, string | number> };
type SummaryRow = {
  id: string; label: string; type: string; answered: number;
  counts?: Record<string, number>; average?: number | null; distribution?: Record<string, number>;
};

export default function ResponsesPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const [title, setTitle] = useState("");
  const [questions, setQuestions] = useState<Question[]>([]);
  const [responses, setResponses] = useState<Response[]>([]);
  const [summary, setSummary] = useState<SummaryRow[]>([]);
  const [message, setMessage] = useState("");

  async function load() {
    const d = await (await fetch(`/api/forms/${id}/responses`)).json();
    if (d.error) { setMessage(d.error); return; }
    setTitle(d.form.title);
    setQuestions(d.form.questions);
    setResponses(d.responses);
    setSummary(d.summary);
  }
  useEffect(() => { load(); }, [id]); // eslint-disable-line react-hooks/exhaustive-deps

  async function remove(rid: string) {
    // ZOMBIE: no "are you sure?" and no undo. One click and the response is gone for good.
    await fetch(`/api/forms/${id}/responses/${rid}`, { method: "DELETE" });
    load();
  }

  const newest = responses.reduce((latest, r) => (r.submittedAt > latest ? r.submittedAt : latest), "");

  return (
    <>
      <Link href="/" className="crumb">&larr; My forms</Link>
      <PageHeader title={title || "Responses"} sub="Read what people sent.">
        <Link href={`/forms/${id}`} className="btn ghost">Edit form</Link>
        <Link href={`/f/${id}`} className="btn ghost">Open form</Link>
        {/* ZOMBIE: Export CSV and Webhook on submit are not built. The buttons only show a message. */}
        <button className="ghost" onClick={() => setMessage("Export CSV: not built yet, see ZOMBIE.md.")}>Export CSV</button>
        <button className="ghost" onClick={() => setMessage("Webhook on submit: not built yet, see ZOMBIE.md.")}>Webhook on submit</button>
      </PageHeader>
      {message && <p className="error">{message}</p>}

      <div className="grid" style={{ marginBottom: 8 }}>
        <Stat label="Responses" value={String(responses.length)} />
        <Stat label="Last response" value={newest ? newest.slice(0, 10) : "None yet"} />
      </div>

      <h2>Summary</h2>
      {summary.length === 0 && <Empty>This form has no questions yet.</Empty>}
      <div className="grid">
        {summary.map((s) => {
          const counts = s.counts ? Object.entries(s.counts) : [];
          const biggest = Math.max(1, ...counts.map(([, n]) => n));
          const dist = s.distribution ? Object.entries(s.distribution) : [];
          const biggestRating = Math.max(1, ...dist.map(([, n]) => n));
          return (
            <div key={s.id} className="card stack">
              <strong>{s.label}</strong>
              <span className="muted">{s.answered} answered</span>
              {s.counts && (
                <div className="hchart">
                  {counts.map(([choice, n]) => (
                    <div key={choice} className="hrow">
                      <span>{choice}</span>
                      <div className="htrack"><div className="hfill" style={{ width: `${(n / biggest) * 100}%` }} /></div>
                      <span className="hval">{n} ({s.answered ? Math.round((n / s.answered) * 100) : 0}%)</span>
                    </div>
                  ))}
                </div>
              )}
              {s.type === "rating" && (
                <>
                  <div style={{ fontSize: 24, fontWeight: 700 }}>
                    {s.average === null || s.average === undefined ? "No ratings" : s.average.toFixed(1) + " / 5"}
                  </div>
                  <div className="vchart">
                    {dist.map(([stars, n]) => (
                      <div key={stars} className="vcol">
                        <span className="vcount">{n}</span>
                        <div className="vfill" style={{ height: `${(n / biggestRating) * 70}%` }} />
                      </div>
                    ))}
                  </div>
                  <div className="vlabels">{dist.map(([stars]) => <span key={stars}>{stars}</span>)}</div>
                </>
              )}
            </div>
          );
        })}
      </div>

      <h2>All responses</h2>
      <div className="table-wrap">
        <table>
          <thead>
            <tr><th>When</th>{questions.map((q) => <th key={q.id}>{q.label}</th>)}<th></th></tr>
          </thead>
          <tbody>
            {responses.map((r) => (
              <tr key={r.id}>
                <td><Link href={`/forms/${id}/responses/${r.id}`}>{when(r.submittedAt)}</Link></td>
                {questions.map((q) => <td key={q.id}>{String(r.answers[q.id] ?? "")}</td>)}
                <td>
                  <div className="row" style={{ flexWrap: "nowrap" }}>
                    <Link href={`/forms/${id}/responses/${r.id}`} className="btn ghost small">View</Link>
                    <button className="danger small" onClick={() => remove(r.id)}>Delete</button>
                  </div>
                </td>
              </tr>
            ))}
            {responses.length === 0 && <tr><td colSpan={questions.length + 2} className="muted">No responses yet.</td></tr>}
          </tbody>
        </table>
      </div>
    </>
  );
}
