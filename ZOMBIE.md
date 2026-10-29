# 🧟 ZOMBIE.md: what's broken

This app is a zombie on purpose. Pick items off this list. Every box you tick gets it closer to a product we can all use and stop paying for Typeform.

Search the code for `ZOMBIE:` to find every planted problem.

## 1. Make it work

- [ ] "Required" is only checked in the browser (`app/f/[id]/page.tsx`). The API (`app/api/forms/[id]/responses/route.ts`) accepts empty answers. Check it on the server too.
- [ ] Email answers are not checked on the server. Reject answers that are not real email addresses.
- [ ] Logic jumps (show a question only if an earlier answer matches) show "not built yet".
- [ ] "Export CSV" shows "not built yet". Build it.
- [ ] "Webhook on submit" shows "not built yet". Build it (save a URL per form, post each new response to it).
- [ ] The "File upload" question type is listed but turned off. Build file storage, size and type checks.
- [ ] In "One question at a time" mode, the Back button loses your answer (`back` in `app/f/[id]/page.tsx`). It clears the answer you typed and the one you go back to. Keep every answer and only change the step.
- [ ] Deleting a response has no "are you sure?" and no undo (`app/api/forms/[id]/responses/[rid]/route.ts` and the Delete buttons on the responses pages). Ask first, mark it deleted instead of removing it, and let the user restore it.

## 2. Make it secure

- [ ] There is no login. Anyone can edit any form or read any responses if they know the id. Add accounts (Supabase Auth, Clerk, Auth.js...) and check the form belongs to the signed-in user.
- [ ] Every API route trusts whatever it's sent. Validate input on the server (lengths, types, allowed choices, rating 1 to 5).
- [ ] Ids are guessable (`lib/db.ts`). Use random ids.
- [ ] Anyone with the ids can read or delete one response (`app/api/forms/[id]/responses/[rid]/route.ts`). Only the form owner should be able to. Write a line to an audit log for every delete.
- [ ] Data lives in `data/db.json` on disk. Move it to a real database.
- [ ] No spam protection. There is no captcha and no rate limit, so a script can post thousands of fake answers (try Cloudflare Turnstile and a rate limit).
- [ ] Keep it free of XSS. React escapes text on its own and this app never uses `dangerouslySetInnerHTML`. Do not add it. If you ever show answers as HTML, clean them first.

## 3. Make it compliant

- [ ] Answers can hold personal data (names, emails) and there is no consent checkbox and no privacy notice. GDPR (EU and UK visitors) needs a clear reason, a lawful basis and a link to your privacy policy. CCPA/CPRA (California) needs a notice at collection.
- [ ] People can ask to see or delete their answers (GDPR rights, CCPA rights). Build a way to find and delete one person's responses.
- [ ] Do not collect data from children under 13 without a parent's OK (COPPA in the US).
- [ ] If your forms collect health, payment or other sensitive data, extra rules apply (HIPAA, PCI DSS). Warn users, or block those questions.
- [ ] If you email respondents, follow the CAN-SPAM Act.
- [ ] No privacy policy or terms page.
- [ ] No way for a user to export or delete their account data.

## 4. Connect Stripe

- [ ] `app/api/checkout/route.ts` returns a 501. Create a Stripe Checkout Session (test mode is fine).
- [ ] Add a webhook route that marks the account as paid.
- [ ] Lock the paid features behind the plan (response limits per month, number of users).

## 5. Ship it

- [ ] Deploy it (Vercel, Netlify, Railway...). The JSON file database will not survive this, so do section 2 first.
- [ ] Put the live link in your README.

## What "done" looks like

Someone who has never seen it can sign up, pay, use the main feature end to end, and come back tomorrow to find their data still there.
