// ZOMBIE: this "database" is a JSON file on disk. It works on your laptop and
// dies on any real host (Vercel's disk is read-only and wiped on every deploy).
// Replace it with a real database (Supabase, Neon, Postgres...) before you ship.
import { promises as fs } from "fs";
import path from "path";
import seed from "@/data/seed.json";

// Written out by hand because the seed's answers have different keys per form.
export type Question = { id: string; type: string; label: string; required: boolean; options: string[] };
// accent is a color like "#4b36d9" and thankYou is the message shown after someone sends the form.
export type Form = {
  id: string; title: string; description: string; createdAt: string; questions: Question[];
  accent?: string; thankYou?: string;
};
export type FormResponse = { id: string; formId: string; submittedAt: string; answers: Record<string, string | number> };
export type Db = { forms: Form[]; responses: FormResponse[] };

// ZOMBIE: the live site (Vercel) can't write to the app folder, so it writes to /tmp instead.
// /tmp is wiped whenever the server restarts, and each server copy keeps its own. Use a real database.
const DB_PATH = process.env.VERCEL
  ? path.join("/tmp", "db.json")
  : path.join(process.cwd(), "data", "db.json");

export async function readDb(): Promise<Db> {
  try {
    return JSON.parse(await fs.readFile(DB_PATH, "utf8")) as Db;
  } catch {
    await writeDb(seed as unknown as Db);
    return structuredClone(seed) as unknown as Db;
  }
}

export async function writeDb(db: Db): Promise<void> {
  await fs.writeFile(DB_PATH, JSON.stringify(db, null, 2));
}

export function newId(): string {
  // ZOMBIE: guessable ids. Anyone can walk the list by trying id+1.
  return String(Date.now());
}
