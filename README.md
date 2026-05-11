# SpendScope

SpendScope is a free AI spend audit for startup founders and engineering managers who want a second opinion before paying another AI tools invoice. It accepts current tools, plans, seats, team size, and use case, then returns immediate savings recommendations and a shareable public report.

Live deployed URL: https://spendscope-ten.vercel.app

Public GitHub repo: https://github.com/Sreeram-15/Prompt-Budget

## Verification Links

- Landing and form: https://spendscope-ten.vercel.app
- Health check: https://spendscope-ten.vercel.app/api/health
- Verified public report: https://spendscope-ten.vercel.app/audit/3eb53f7c-76e6-4c3b-a4b3-8b6c58012260
- Verified Open Graph image: https://spendscope-ten.vercel.app/api/og/3eb53f7c-76e6-4c3b-a4b3-8b6c58012260
- Public GitHub repo: https://github.com/Sreeram-15/Prompt-Budget

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

After deployment, `/api/health` reports whether Supabase, Resend, and Anthropic keys are configured. It only returns booleans, never secret values.

## Assignment Readiness

Implemented locally and deployed: spend input persistence, deterministic audit engine, AI summary with fallback, post-value lead capture, Supabase/Resend adapters, rate limiting and honeypot abuse protection, public audit URLs, Open Graph image route, root documentation files, and CI.

Verified on 2026-05-11: the public repo is reachable, the Vercel deployment returns `200 OK`, `/api/health` reports Supabase, Resend, and Anthropic configured, a deployed audit can be created, the public report renders expected savings content, the "Email me the report" backend path returns success, the Open Graph endpoint returns a PNG, GitHub Actions CI is green on the latest commit, and local lint, tests, and production build pass.

Known limitation: real user interviews were not completed before this checkpoint; `USER_INTERVIEWS.md` documents that honestly.
