# Zombie Forms

> A half-built copy of **Typeform**. It runs, it kind of works, and it is not ready for real users.
> Your job tonight: bring it back to life.

**Replaces:** Typeform (about $39 per user per month) <!-- Source: https://www.typeform.com/pricing, Basic plan, monthly billing toggle, checked 2026-10-29. The comparison table on that page showed $29, the plan card showed $39 USD/mo; the plan card was used. -->

**Live demo:** https://zombie-forms.vercel.app (a shared demo: data resets whenever the server restarts)

## Run it (2 minutes)

You need [Node.js 20 or newer](https://nodejs.org).

```bash
npm install
npm run dev
```

Open http://localhost:3108.

## What works

- Build a form: title, description and questions. Question types: short text, long text, email, multiple choice and rating 1 to 5.
- Mark questions as required and move them up and down with the Up and Down buttons.
- A home page (`/`) with each form as a card: response count, time of the last response, and a "Copy link" button.
- A theme for each form: pick an accent color and write your own thank-you message. The public form uses both.
- A public page for each form at `/f/<id>` that collects answers.
- A "One question at a time" switch on the public form, with Next and Back buttons and a progress bar.
- A responses table for each form. Click a response to see all the answers from that one person, or delete it.
- A summary with charts: bars for each choice, and a 1 to 5 bar chart plus the average for each rating question.
- A pricing page with two plans.
- Fake data: 4 forms and 22 responses. All names and emails are made up.

## What's broken

See [ZOMBIE.md](ZOMBIE.md). That's the to-do list for the night. Short version: "required" is only checked in the browser, email answers are not checked on the server, anyone can edit any form or read any answers, in one-question-at-a-time mode the Back button throws away your answer, deleting a response has no "are you sure?" and no undo, and logic jumps, CSV export, webhooks and file upload are not built.

## How we build tonight

- **Mel** ([openmel.dev](https://openmel.dev)) does the building. Open this folder in Mel and give it tasks from ZOMBIE.md.
- **Prompt Anything** ([promptanything.io](https://www.promptanything.io)) writes the prompts. Use it inside Mel for features, agents, customer success flows, code fixes and reading this repo.
- **MEL.md** in this folder tells Mel's agents what this project is and how to work on it.

## Submit

Fork this repo, push your work, and send your link through the submission form before the deadline.
Many people can pick the same app. The one that actually works wins.

## License

MIT. Use it, ship it, share it.
