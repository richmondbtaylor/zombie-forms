"use client";
import { useEffect, useState, use } from "react";

type Question = { id: string; type: string; label: string; required: boolean; options: string[] };
type Form = {
  id: string; title: string; description: string; questions: Question[];
  accent?: string; thankYou?: string;
};

// The public page. Anyone with the link can fill it in.
// React escapes text for us. We never use dangerouslySetInnerHTML, so answers and
// labels cannot inject HTML. Keep it that way.
export default function PublicForm({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const [form, setForm] = useState<Form | null>(null);
  const [answers, setAnswers] = useState<Record<string, string>>({});
  const [error, setError] = useState("");
  const [done, setDone] = useState(false);
  // One question at a time (Typeform style). "step" is the number of the question on screen.
  const [oneAtATime, setOneAtATime] = useState(false);
  const [step, setStep] = useState(0);

  useEffect(() => {
    fetch(`/api/forms/${id}`).then((r) => r.json()).then((f) => {
      if (f.error) setError(f.error);
      else setForm(f);
    });
  }, [id]);

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    if (!form) return;
    setError("");

    // In one-at-a-time mode, Enter or Next moves on until the last question.
    if (oneAtATime && step < form.questions.length - 1) {
      next();
      return;
    }

    // ZOMBIE: this "required" check only runs in the browser. The API route does not check it.
    for (const q of form.questions) {
      if (q.required && !(answers[q.id] ?? "").trim()) {
        setError(`Please answer: ${q.label}`);
        if (oneAtATime) setStep(form.questions.indexOf(q));
        return;
      }
    }

    const res = await fetch(`/api/forms/${id}/responses`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ answers }),
    });
    if (!res.ok) {
      setError((await res.json()).error ?? "Could not send.");
      return;
    }
    setDone(true);
  }

  if (error && !form) return <p className="error">{error}</p>;
  if (!form) return <p className="muted">Loading...</p>;

  const accent = { "--accent": form.accent || "#4b36d9" } as React.CSSProperties;

  if (done) {
    return (
      <div className="public" style={accent}>
        <div className="card stack">
          <h1>Thank you!</h1>
          <p>{form.thankYou || "Your answers were sent."}</p>
        </div>
      </div>
    );
  }

  const questions = form.questions;
  const last = questions.length - 1;

  function set(qid: string, value: string) {
    setAnswers((a) => ({ ...a, [qid]: value }));
  }

  function next() {
    const q = questions[step];
    if (q.required && !(answers[q.id] ?? "").trim()) {
      setError(`Please answer: ${q.label}`);
      return;
    }
    setError("");
    setStep(step + 1);
  }

  function back() {
    // ZOMBIE: Back throws away what you typed. It clears the answer on the question you
    // leave AND the one you go back to. Fix: keep every answer in `answers` and only change the step.
    const leaving = questions[step];
    const returning = questions[step - 1];
    setAnswers((a) => {
      const copy = { ...a };
      delete copy[leaving.id];
      delete copy[returning.id];
      return copy;
    });
    setError("");
    setStep(step - 1);
  }

  function renderQuestion(q: Question, big: boolean) {
    return (
      // A rating row has buttons inside, so it uses a div (a label would click button 1).
      <Field key={q.id} asDiv={q.type === "rating"}>
        <span className={big ? "question-big" : undefined} style={big ? undefined : { color: "var(--ink)", fontWeight: 600 }}>
          {q.label}{q.required ? " *" : ""}
        </span>
        {q.type === "short" && <input value={answers[q.id] ?? ""} onChange={(e) => set(q.id, e.target.value)} />}
        {q.type === "email" && <input type="email" value={answers[q.id] ?? ""} onChange={(e) => set(q.id, e.target.value)} />}
        {q.type === "long" && <textarea rows={4} value={answers[q.id] ?? ""} onChange={(e) => set(q.id, e.target.value)} />}
        {q.type === "choice" && (
          <select value={answers[q.id] ?? ""} onChange={(e) => set(q.id, e.target.value)}>
            <option value="">Choose one</option>
            {q.options.map((o) => <option key={o} value={o}>{o}</option>)}
          </select>
        )}
        {q.type === "rating" && (
          <div className="row">
            {[1, 2, 3, 4, 5].map((n) => (
              <button key={n} type="button" className={answers[q.id] === String(n) ? "" : "ghost"}
                onClick={() => set(q.id, String(n))}>{n}</button>
            ))}
          </div>
        )}
      </Field>
    );
  }

  return (
    <div className="public" style={accent}>
      <form onSubmit={submit} noValidate className="card stack">
        <h1>{form.title}</h1>
        <p className="sub" style={{ margin: 0 }}>{form.description}</p>

        {questions.length > 0 && (
          <label className="check">
            <input type="checkbox" checked={oneAtATime}
              onChange={(e) => { setOneAtATime(e.target.checked); setStep(0); setError(""); }} />
            One question at a time
          </label>
        )}

        {questions.length === 0 && <p className="muted">This form has no questions yet.</p>}

        {oneAtATime && questions.length > 0 ? (
          <>
            <div className="progress" aria-label="Progress">
              <div className="progress-fill" style={{ width: `${((step + 1) / questions.length) * 100}%` }} />
            </div>
            <span className="muted">Question {step + 1} of {questions.length}</span>
            <div className="answer-box stack">{renderQuestion(questions[step], true)}</div>
          </>
        ) : (
          questions.map((q) => renderQuestion(q, false))
        )}

        {/* ZOMBIE: no consent checkbox and no privacy notice. This form can collect names and
            emails. Add a notice and a required consent box (GDPR, CCPA). */}
        {/* ZOMBIE: no captcha or spam protection. A bot can fill this in forever. */}
        <div className="row">
          {oneAtATime && step > 0 && <button type="button" className="ghost" onClick={back}>Back</button>}
          {oneAtATime && step < last && <button type="button" onClick={next}>Next</button>}
          {(!oneAtATime || step === last) && <button type="submit">Send</button>}
        </div>
        {error && <p className="error">{error}</p>}
      </form>
    </div>
  );
}

function Field({ asDiv, children }: { asDiv: boolean; children: React.ReactNode }) {
  return asDiv ? <div style={{ display: "grid", gap: 4, fontSize: 13, color: "var(--muted)" }}>{children}</div> : <label>{children}</label>;
}
