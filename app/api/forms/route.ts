import { NextResponse } from "next/server";
import { readDb, writeDb, newId } from "@/lib/db";

// ZOMBIE: no login. Anyone can list every form and create new ones.
export async function GET() {
  const db = await readDb();
  const list = db.forms.map((f) => ({
    ...f,
    responseCount: db.responses.filter((r) => r.formId === f.id).length,
    // Newest submission time, or "" when nobody has answered yet.
    lastResponseAt: db.responses
      .filter((r) => r.formId === f.id)
      .reduce((latest, r) => (r.submittedAt > latest ? r.submittedAt : latest), ""),
  }));
  return NextResponse.json(list);
}

export async function POST(req: Request) {
  const body = await req.json().catch(() => ({}));
  const db = await readDb();
  const form = {
    id: newId(),
    title: String(body.title ?? "").trim() || "Untitled form",
    description: String(body.description ?? ""),
    createdAt: new Date().toISOString().slice(0, 10),
    accent: "#4b36d9",
    thankYou: "Thank you! Your answers were sent.",
    questions: [] as { id: string; type: string; label: string; required: boolean; options: string[] }[],
  };
  db.forms.push(form);
  await writeDb(db);
  return NextResponse.json(form, { status: 201 });
}
