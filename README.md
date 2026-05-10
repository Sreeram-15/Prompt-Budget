# SpendScope

SpendScope is a free AI spend audit for startup founders and engineering managers who want a second opinion before paying another AI tools invoice. It accepts current tools, plans, seats, team size, and use case, then returns immediate savings recommendations and a shareable public report.

Live deployed URL: https://spendscope-ten.vercel.app

Public GitHub repo: https://github.com/Sreeram-15/Prompt-Budget

## Screenshots

- Landing and form: _capture from deployed URL before submission_
- Audit results: _capture from deployed URL before submission_
- Public share page / Open Graph preview: _capture from deployed URL before submission_

## Quick Start

```bash
npm install
cp .env.example .env.local
npm run dev
```

Open http://localhost:3000.

To deploy, create the Vercel project, add the environment variables from `.env.example`, run the SQL in `supabase-schema.sql`, and connect the public GitHub repo.

## Decisions

- Next.js App Router: one deployment handles the form, API routes, public report pages, and dynamic Open Graph metadata.
- TypeScript: the audit math is money-sensitive, so typed inputs and outputs reduce silent shape mistakes.
- Deterministic audit engine: plan-fit and savings math are rule-based; the LLM only writes the summary.
- Supabase + Resend: fast real persistence and transactional email without building a separate backend service.
- Email after value: the audit result is shown first, then lead capture asks for email to save or receive the report.

## Environment

`SUPABASE_URL`, `SUPABASE_SERVICE_ROLE_KEY`, `RESEND_API_KEY`, `RESEND_FROM`, `ANTHROPIC_API_KEY`, and `NEXT_PUBLIC_SITE_URL`.

The app runs locally without external keys using in-memory storage and a templated summary. Production should use Supabase and Resend.

Run `supabase-schema.sql` before using production lead capture. The lead table stores `consultation_requested` separately from public audit data.

## Submission Notes

Before submitting the Google Form, replace the screenshot placeholders, add the deployed Vercel URL, fill `USER_INTERVIEWS.md` with three real conversations, and continue honest commits across at least five distinct calendar days.

## Assignment Readiness

Implemented locally and deployed: spend input persistence, deterministic audit engine, AI summary with fallback, post-value lead capture, Supabase/Resend adapters, rate limiting and honeypot abuse protection, public audit URLs, Open Graph image route, root documentation files, and CI.

Still required before final submission: configure real Supabase/Resend/Anthropic production env vars if you want durable backend storage and transactional email, capture three screenshots or a 30-second recording from the live app, complete three real user interviews, and confirm the latest GitHub Actions run is green on `main`.
