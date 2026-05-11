# Devlog

## Day 1 - 2026-05-09
**Hours worked:** 6
**What I did:** Read the assignment, chose Next.js + Supabase + Resend, scaffolded the app, and implemented the first audit engine.
**What I learned:** The strongest scoring signal is not just code; the docs and lead-gen thinking are part of the product.
**Blockers / what I'm stuck on:** Needed real Supabase, Resend, Anthropic, and deployment credentials before production verification.
**Plan for tomorrow:** Wire production env vars, deploy, capture screenshots, and expand polish after real user feedback.

## Day 2 - 2026-05-10
**Hours worked:** 1
**What I did:** Re-ran lint, unit tests, and the production Next.js build; reviewed the submission checklist and kept deployment and interview status honest.
**What I learned:** The local app is buildable without production credentials because storage, email, and LLM integrations have local fallbacks or isolated adapters.
**Blockers / what I'm stuck on:** Still needed production deployment checks and founder interview notes.
**Plan for tomorrow:** Deploy with production env vars, capture verification evidence, and interview the first founder.

## Day 3 - 2026-05-11
**Hours worked:** 1
**What I did:** Verified the public GitHub repo, Vercel deployment, `/api/health`, required root files, CI status, local lint, local tests, and production build. Created a deployed QA audit, checked the public report route, and verified the Open Graph PNG endpoint. Cleaned stale template language from the submission docs.
**What I learned:** The production integration check is useful because it confirms the deployed app can see Supabase, Resend, Anthropic, and the configured site URL without exposing secrets. The public report smoke test also proved that saved audits can be shared after submission.
**Blockers / what I'm stuck on:** Real user interviews were not completed, so `USER_INTERVIEWS.md` states that directly instead of inventing research.
**Plan for tomorrow:** If more time is available, complete real interviews and replace the not-completed notes with actual findings.
