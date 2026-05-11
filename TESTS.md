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
