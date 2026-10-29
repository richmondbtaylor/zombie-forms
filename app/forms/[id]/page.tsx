"use client";
import { useEffect, useState, use } from "react";
import Link from "next/link";
import { PageHeader } from "@/app/components/ui";

type Question = { id: string; type: string; label: string; required: boolean; options: string[] };

const SWATCHES = ["#4b36d9", "#b8651b", "#2f8f6b", "#c2417a", "#1f6fb2", "#16151d"];
const DEFAULT_THANKS = "Thank you! Your answers were sent.";

const TYPE_NAMES: Record<string, string> = {
  short: "Short text",
  long: "Long text",
  email: "Email",
  choice: "Multiple choice",
  rating: "Rating (1 to 5)",
};

export default function BuilderPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [accent, setAccent] = useState("#4b36d9");
  const [thankYou, setThankYou] = useState(DEFAULT_THANKS);
  const [questions, setQuestions] = useState<Question[]>([]);
  const [message, setMessage] = useState("");
  const [loaded, setLoaded] = useState(false);

  useEffect(() => {
    fetch(`/api/forms/${id}`).then((r) => r.json()).then((f) => {
      if (f.error) { setMessage(f.error); return; }
      setTitle(f.title);
      setDescription(f.description);
      setAccent(f.accent || "#4b36d9");
      setThankYou(f.thankYou || DEFAULT_THANKS);
      setQuestions(f.questions);
      setLoaded(true);
    });
  }, [id]);

  function update(i: number, patch: Partial<Question>) {
    setQuestions(questions.map((q, n) => (n === i ? { ...q, ...patch } : q)));
  }

  function move(i: number, dir: -1 | 1) {
    const j = i + dir;
    if (j < 0 || j >= questions.length) return;
    const copy = [...questions];
    [copy[i], copy[j]] = [copy[j], copy[i]];
    setQuestions(copy);
  }

  function addQuestion() {
    const qid = "q" + Math.random().toString(36).slice(2, 8);
    setQuestions([...questions, { id: qid, type: "short", label: "", required: false, options: [] }]);
  }

  async function save() {
    const res = await fetch(`/api/forms/${id}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ title, description, accent, thankYou, questions }),
    });
    setMessage(res.ok ? "Saved." : "Could not save.");
  }

  if (!loaded) return <p className="muted">{message || "Loading..."}</p>;

  return (
    <>
      <Link href="/" className="crumb">&larr; My forms</Link>
      <PageHeader title="Edit form" sub="Change the questions and the look, then save.">
        <Link href={`/f/${id}`} className="btn ghost">Open the public form</Link>
        <Link href={`/forms/${id}/responses`} className="btn ghost">See responses</Link>
        <button type="button" onClick={save}>Save form</button>
      </PageHeader>

      <div className="card stack">
        <label>Title<input value={title} onChange={(e) => setTitle(e.target.value)} /></label>
        <label>Description<textarea rows={2} value={description} onChange={(e) => setDescription(e.target.value)} /></label>
      </div>

      <h2>Theme</h2>
      <div className="card stack">
        <label>Accent color
          <div className="swatches">
            <input type="color" value={accent} onChange={(e) => setAccent(e.target.value)} />
            {SWATCHES.map((c) => (
              <button key={c} type="button" className="swatch" style={{ background: c }}
                aria-label={`Use ${c}`} onClick={() => setAccent(c)} />
            ))}
          </div>
        </label>
        <label>Thank-you message
          <textarea rows={2} value={thankYou} onChange={(e) => setThankYou(e.target.value)} />
        </label>
        <div className="row">
          <span className="muted">Preview:</span>
          <button type="button" style={{ background: accent }}>Send</button>
        </div>
      </div>

      <h2>Questions</h2>
      <div className="stack">
        {questions.map((q, i) => (
          <div key={q.id} className="card stack">
            <div className="row">
              <input style={{ flex: 1, minWidth: 200 }} placeholder="Question" value={q.label}
                onChange={(e) => update(i, { label: e.target.value })} />
              <select style={{ width: 190, maxWidth: "100%" }} value={q.type} onChange={(e) => update(i, { type: e.target.value })}>
                {Object.entries(TYPE_NAMES).map(([value, name]) => <option key={value} value={value}>{name}</option>)}
                {/* ZOMBIE: file upload is listed but turned off. To do: store files (Supabase Storage, S3...),
                    check type and size, and scan for viruses. */}
                <option value="file" disabled>File upload (not built yet)</option>
              </select>
            </div>

            {q.type === "choice" && (
              <label>Choices, one per line
                <textarea rows={3} value={q.options.join("\n")}
                  onChange={(e) => update(i, { options: e.target.value.split("\n") })} />
              </label>
            )}

            <div className="row">
              <label className="check">
                <input type="checkbox" checked={q.required}
                  onChange={(e) => update(i, { required: e.target.checked })} /> Required
              </label>
              <button className="ghost small" type="button" onClick={() => move(i, -1)} disabled={i === 0}>Up</button>
              <button className="ghost small" type="button" onClick={() => move(i, 1)} disabled={i === questions.length - 1}>Down</button>
              <button className="ghost small" type="button" onClick={() => setQuestions(questions.filter((_, n) => n !== i))}>Remove</button>
              {/* ZOMBIE: logic jumps (conditional questions) are not built. The button only shows a message. */}
              <button className="ghost small" type="button"
                onClick={() => setMessage("Logic jumps: not built yet, see ZOMBIE.md.")}>Add logic jump</button>
            </div>
          </div>
        ))}
      </div>

      <div className="row" style={{ marginTop: 16 }}>
        <button className="ghost" type="button" onClick={addQuestion}>Add question</button>
        <button type="button" onClick={save}>Save form</button>
      </div>
      {message && <p className="muted">{message}</p>}
    </>
  );
}
