"use client";
import { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { PageHeader, Stat, Empty, when } from "@/app/components/ui";

type FormRow = {
  id: string; title: string; description: string; createdAt: string;
  responseCount: number; lastResponseAt: string; accent?: string;
};

export default function FormList() {
  const router = useRouter();
  const [forms, setForms] = useState<FormRow[]>([]);
  const [loaded, setLoaded] = useState(false);
  const [copied, setCopied] = useState("");

  useEffect(() => {
    fetch("/api/forms").then((r) => r.json()).then((list) => {
      setForms(list);
      setLoaded(true);
    });
  }, []);

  async function create() {
    const res = await fetch("/api/forms", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ title: "Untitled form" }),
    });
    const form = await res.json();
    router.push(`/forms/${form.id}`);
  }

  async function copyLink(id: string) {
    const link = `${window.location.origin}/f/${id}`;
    try {
      await navigator.clipboard.writeText(link);
      setCopied(id);
      setTimeout(() => setCopied(""), 2000);
    } catch {
      window.prompt("Copy this link:", link);
    }
  }

  const totalResponses = forms.reduce((sum, f) => sum + f.responseCount, 0);

  return (
    <>
      <PageHeader title="My forms" sub="Build a form, share its link, read the answers.">
        <button onClick={create}>New form</button>
      </PageHeader>

      <div className="grid" style={{ marginBottom: 20 }}>
        <Stat label="Forms" value={String(forms.length)} />
        <Stat label="Responses in total" value={String(totalResponses)} />
      </div>

      {loaded && forms.length === 0 && <Empty>No forms yet. Click &quot;New form&quot; to build your first one.</Empty>}

      <div className="grid">
        {forms.map((f) => (
          <div key={f.id} className="card stack form-card" style={{ borderTopColor: f.accent || undefined }}>
            <strong>{f.title}</strong>
            <span className="muted">{f.description || "No description"}</span>
            <div className="row">
              <span className="pill">{f.responseCount} responses</span>
            </div>
            <span className="meta">
              {f.lastResponseAt ? `Last response: ${when(f.lastResponseAt)}` : "No responses yet"}
            </span>
            <div className="row">
              <Link className="btn ghost small" href={`/forms/${f.id}`}>Edit</Link>
              <Link className="btn ghost small" href={`/forms/${f.id}/responses`}>Responses</Link>
              <Link className="btn ghost small" href={`/f/${f.id}`}>Open form</Link>
              <button className="ghost small" onClick={() => copyLink(f.id)}>
                {copied === f.id ? "Copied!" : "Copy link"}
              </button>
            </div>
          </div>
        ))}
      </div>
    </>
  );
}
