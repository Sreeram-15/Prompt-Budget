# SpendScope

SpendScope is a free AI spend audit for startup founders and engineering managers who want a second opinion before paying another AI tools invoice. It accepts current tools, plans, seats, team size, and use case, then returns immediate savings recommendations and a shareable public report.

Live deployed URL: _add Vercel URL here after deployment_.

Public GitHub repo: https://github.com/Sreeram-15/Prompt-Budget

## Screenshots

- _Add screenshot: landing and form_
- _Add screenshot: audit results_
- _Add screenshot: public share page_

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
