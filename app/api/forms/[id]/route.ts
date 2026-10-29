import { NextResponse } from "next/server";
import { readDb, writeDb } from "@/lib/db";

type Ctx = { params: Promise<{ id: string }> };

const TYPES = ["short", "long", "email", "choice", "rating"];

export async function GET(_req: Request, { params }: Ctx) {
  const { id } = await params;
  const db = await readDb();
  const form = db.forms.find((f) => f.id === id);
  if (!form) return NextResponse.json({ error: "Form not found." }, { status: 404 });
  return NextResponse.json(form);
}

// ZOMBIE: no login and no owner check. Anyone who knows (or guesses) a form id can
// rewrite it here. Add accounts and only let the owner edit.
export async function PUT(req: Request, { params }: Ctx) {
  const { id } = await params;
  const body = await req.json().catch(() => ({}));
  const db = await readDb();
  const form = db.forms.find((f) => f.id === id);
  if (!form) return NextResponse.json({ error: "Form not found." }, { status: 404 });

  if (typeof body.title === "string") form.title = body.title.trim() || "Untitled form";
  if (typeof body.description === "string") form.description = body.description;
  // Theme: only a plain hex color is accepted, so nothing odd ends up in the page styles.
  if (typeof body.accent === "string" && /^#[0-9a-fA-F]{6}$/.test(body.accent)) form.accent = body.accent;
  if (typeof body.thankYou === "string") form.thankYou = body.thankYou.trim() || "Thank you! Your answers were sent.";
  if (Array.isArray(body.questions)) {
    form.questions = body.questions
      .filter((q: { type?: string }) => TYPES.includes(String(q.type)))
      .map((q: { id?: string; type: string; label?: string; required?: boolean; options?: string[] }, n: number) => ({
        id: String(q.id || "q" + n + Date.now()),
        type: q.type,
        label: String(q.label ?? ""),
        required: Boolean(q.required),
        options: Array.isArray(q.options) ? q.options.map(String).filter(Boolean) : [],
      }));
  }
  await writeDb(db);
  return NextResponse.json(form);
}
