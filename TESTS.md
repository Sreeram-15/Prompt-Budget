# Tests

Run all tests:

```bash
npm test
```

For Windows PowerShell, `npm.cmd test` avoids noisy access warnings from the npm PowerShell shim on some machines.

## Automated Tests

- `src/lib/auditEngine.test.ts` - downgrade from wasteful team plans, no invented enterprise savings, Credex qualification, healthy-stack honesty, duplicate coding-tool consolidation, API savings capped by current spend, and minimum-seat billing floors.
- `src/lib/validation.test.ts` - honeypot rejection, normal lead normalization, malformed email rejection, audit ID trimming, integer-only team/seats, spend rounding, and audit payload size limits.
- `src/lib/summaryFallback.test.ts` - deterministic fallback summary when the LLM path is unavailable.
- `src/lib/store.test.ts` - local public report fallback saves and reloads a shareable audit without Supabase credentials.

CI runs lint and tests in `.github/workflows/ci.yml`.

## Latest Local Verification

- `npm.cmd run lint` - passed on 2026-05-11.
- `npm.cmd test` - 17 tests passed on 2026-05-11.
- `npm.cmd run build` - production Next.js build passed on 2026-05-11.

## Latest CI Verification

- GitHub Actions workflow `CI` is configured in `.github/workflows/ci.yml` and was green when checked on 2026-05-11.

## Deployed Smoke Test

- `GET https://spendscope-ten.vercel.app` - returned `200 OK` on 2026-05-11.
- `GET https://spendscope-ten.vercel.app/api/health` - returned `ok: true` with Supabase, Resend, and Anthropic configured on 2026-05-11.
- `POST https://spendscope-ten.vercel.app/api/audits` - created audit `3eb53f7c-76e6-4c3b-a4b3-8b6c58012260` with `$312` monthly savings on 2026-05-11.
- `GET /audit/3eb53f7c-76e6-4c3b-a4b3-8b6c58012260` - returned `200 OK` and included expected Cursor/GitHub Copilot recommendations.
- `GET /api/og/3eb53f7c-76e6-4c3b-a4b3-8b6c58012260` - returned `200 OK` with `Content-Type: image/png`.
- `POST /api/leads` for audit `3eb53f7c-76e6-4c3b-a4b3-8b6c58012260` - returned `{ "ok": true }`, confirming the backend path for "Email me the report" on 2026-05-11.
