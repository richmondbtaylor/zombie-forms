type Question = { id: string; type: string; label: string; options: string[] };
type Response = { answers: Record<string, string | number> };

// Counts per choice, average rating, and how many people answered each other question.
export function summarize(questions: Question[], responses: Response[]) {
  return questions.map((q) => {
    const values = responses
      .map((r) => r.answers[q.id])
      .filter((v) => v !== undefined && v !== "");

    if (q.type === "choice") {
      const counts: Record<string, number> = {};
      for (const o of q.options) counts[o] = 0;
      for (const v of values) counts[String(v)] = (counts[String(v)] ?? 0) + 1;
      return { id: q.id, label: q.label, type: q.type, answered: values.length, counts };
    }
    if (q.type === "rating") {
      const nums = values.map(Number).filter((n) => !Number.isNaN(n));
      const average = nums.length ? nums.reduce((a, b) => a + b, 0) / nums.length : null;
      // How many people gave each rating, 1 to 5. Used for the bar chart.
      const distribution: Record<string, number> = { "1": 0, "2": 0, "3": 0, "4": 0, "5": 0 };
      for (const n of nums) if (distribution[String(n)] !== undefined) distribution[String(n)] += 1;
      return { id: q.id, label: q.label, type: q.type, answered: nums.length, average, distribution };
    }
    return { id: q.id, label: q.label, type: q.type, answered: values.length };
  });
}
