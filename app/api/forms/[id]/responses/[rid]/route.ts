import { NextResponse } from "next/server";
import { readDb, writeDb } from "@/lib/db";

type Ctx = { params: Promise<{ id: string; rid: string }> };

// ZOMBIE: no login. Anyone with the ids can read one person's answers.
export async function GET(_req: Request, { params }: Ctx) {
  const { id, rid } = await params;
  const db = await readDb();
  const form = db.forms.find((f) => f.id === id);
  const response = db.responses.find((r) => r.id === rid && r.formId === id);
  if (!form || !response) return NextResponse.json({ error: "Response not found." }, { status: 404 });
  return NextResponse.json({ form, response });
}

// ZOMBIE: deleting a response is instant and permanent. There is no "are you sure?", no undo
// and no record of who deleted what. Ask first, mark it deleted instead of removing it
// (so it can be restored), write a line to an audit log, and let only the form owner do it.
export async function DELETE(_req: Request, { params }: Ctx) {
  const { id, rid } = await params;
  const db = await readDb();
  const before = db.responses.length;
  db.responses = db.responses.filter((r) => !(r.id === rid && r.formId === id));
  if (db.responses.length === before) return NextResponse.json({ error: "Response not found." }, { status: 404 });
  await writeDb(db);
  return NextResponse.json({ ok: true });
}
