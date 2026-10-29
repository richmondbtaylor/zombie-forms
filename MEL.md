# MEL.md

This is a hackathon project: a half-built copy of Typeform (a form builder) that we are turning into a real SaaS product the whole group can use.

## The stack

- Next.js (App Router) + TypeScript + React. Plain CSS in `app/globals.css`, no Tailwind.
- Data: `lib/db.ts` reads and writes `data/db.json`. `data/seed.json` is the starting data. This is temporary.
- Summary math (counts per choice, average rating, rating 1 to 5 counts) lives in `lib/summary.ts`. Small shared pieces (page header, stat card, empty state, time format) are in `app/components/ui.tsx`.
- API routes: `app/api/forms` (list, create), `app/api/forms/[id]` (read, edit, including the accent color and thank-you message), `app/api/forms/[id]/responses` (list with summary, submit) and `app/api/forms/[id]/responses/[rid]` (read one, delete one).
- Pages: `/` (form list), `/forms/[id]` (builder), `/forms/[id]/responses`, `/forms/[id]/responses/[rid]` (one response), `/f/[id]` (public form, with a one-question-at-a-time switch), `/pricing`.
- Payments: `app/api/checkout/route.ts` is a stub. Stripe is not connected.
- Runs on port 3108.

## The job

Work through `ZOMBIE.md` in order: make it work, make it secure, make it compliant, connect Stripe, ship it.
Every planted problem in the code is marked with a `ZOMBIE:` comment.

## Rules for agents

- Keep it running. Run `npm run build` after each change and fix what breaks.
- Never commit secrets. Keys go in `.env.local` (it is git-ignored).
- Use Stripe test mode keys only.
- Never use `dangerouslySetInnerHTML` for answers or labels.
- Never hard delete responses. Ask first, allow undo, keep an audit log.
- In one-question-at-a-time mode, never throw away an answer when the user goes Back.
- When you fix a `ZOMBIE:` item, delete its comment and tick its box in `ZOMBIE.md`.
- Small commits with plain messages.
