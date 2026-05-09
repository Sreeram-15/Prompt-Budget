# Architecture

```mermaid
flowchart TD
  A[Visitor] --> B[Next.js landing + form]
  B --> C[/api/audits]
  C --> D[Deterministic audit engine]
  D --> E[Anthropic summary API]
  E --> F[Templated fallback if needed]
  D --> G[Supabase audits table]
  B --> H[Results view]
  H --> I[/api/leads]
  I --> J[Honeypot + rate limit]
  I --> K[Supabase leads table]
  I --> L[Resend email]
  G --> M[/audit/:id public page]
  M --> N[Open Graph image route]
```

## Data Flow

The browser stores form state in `localStorage` as the user edits it. On submit, `/api/audits` validates the payload, rate-limits the request by hashed IP key, runs deterministic audit rules, asks Anthropic for a short summary, falls back to a template on failure, and saves a public-safe audit record. The results page then offers email capture; `/api/leads` rejects honeypot submissions, rate-limits again, stores private lead fields separately, and sends a Resend confirmation email.

## Stack Choice

Next.js + TypeScript was chosen because the assignment needs full-stack routes, dynamic public pages, Open Graph metadata, and Vercel deployment in one codebase. Supabase gives a real database with simple REST writes. Resend covers transactional email. Anthropic is used only for the personalized paragraph because audit math must remain auditable.

## Abuse Protection

The lead form includes a hidden `website` honeypot. API routes also call a rate limiter keyed by hashed IP and action. Local development uses an in-memory limiter; production is intended to use the Supabase `rate_limits` table from `supabase-schema.sql`.

## 10k Audits Per Day

For 10k audits/day, move rate limiting to Upstash Redis or Supabase RPC with atomic increments, add queue-backed email delivery, cache pricing data separately from code, store LLM summary jobs asynchronously, add dashboard monitoring for audit completions and lead conversion, and split public audit reads behind a CDN-friendly route.
