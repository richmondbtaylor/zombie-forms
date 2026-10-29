import { NextResponse } from "next/server";
import { readDb, writeDb, newId } from "@/lib/db";
import { summarize } from "@/lib/summary";

type Ctx = { params: Promise<{ id: string }> };

// ZOMBIE: no login. Anyone with the form id can read every answer, which may include
// names and emails. Only the form owner should be able to see responses.
export async function GET(_req: Request, { params }: Ctx) {
  const { id } = await params;
  const db = await readDb();
  const form = db.forms.find((f) => f.id === id);
  if (!form) return NextResponse.json({ error: "Form not found." }, { status: 404 });
  const responses = db.responses.filter((r) => r.formId === id);
  return NextResponse.json({ form, responses, summary: summarize(form.questions, responses) });
}

// This is what the public form posts to.
export async function POST(req: Request, { params }: Ctx) {
  const { id } = await params;
  const body = await req.json().catch(() => ({}));
  const db = await readDb();
  const form = db.forms.find((f) => f.id === id);
  if (!form) return NextResponse.json({ error: "Form not found." }, { status: 404 });

  // ZOMBIE: "required" is only checked in the browser (app/f/[id]/page.tsx).
  // This route accepts empty answers, so anyone using curl skips the check.
  // Fix: loop over form.questions, and return 400 if a required one is empty.
  //
  // ZOMBIE: email answers are not validated here either. "not-an-email" is saved as is.
  // Fix: check every "email" question with a real email check before saving.
  //
  // ZOMBIE: no spam protection. No captcha, no rate limit. A script can post thousands of rows.
  //
  // ZOMBIE: no consent. Answers can hold personal data (names, emails) and we never ask
  // permission or show a privacy notice (GDPR, CCPA).
  const answers: Record<string, string | number> = {};
  const raw = body.answers && typeof body.answers === "object" ? body.answers : {};
  for (const q of form.questions) {
    const v = raw[q.id];
    answers[q.id] = q.type === "rating" && v !== undefined && v !== "" ? Number(v) : String(v ?? "");
  }

  const response = { id: newId(), formId: id, submittedAt: new Date().toISOString(), answers };
  db.responses.push(response);
  await writeDb(db);
  return NextResponse.json(response, { status: 201 });
}
