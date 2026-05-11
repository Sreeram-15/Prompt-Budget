# Reflection

## 1. Hardest Bug

The hardest bug so far was keeping the public audit page useful without leaking private lead data. My first storage model was too simple: save one record containing the audit, the email, and the optional company details, then read it back for both the private follow-up flow and the public share URL. That would have made the implementation faster, but it was wrong for the product. The public URL is supposed to be viral; users should feel safe sharing it, and a leaked email or company name would break that trust immediately.

I debugged it by tracing the data from form submit to `/api/audits`, then from `/audit/:id` back through `getPublicAudit`. My first hypothesis was that I could strip fields in the React page, but that still meant private data would be available to server-rendered code and any future API consumer. The better boundary was at persistence. I split the model so `audits` stores only public-safe report data and `leads` stores email, company, role, team size, and consultation intent. I then checked the public route and the Supabase payload shape to make sure the share page only receives tool names, plans, seats, and savings numbers. That fix made the data boundary explicit instead of relying on UI discipline.

## 2. Decision Reversed

I initially considered making the LLM responsible for ranking recommendations because it would sound more personalized and would have been faster to demo. The rough version of that idea was to send the full stack to the model and ask it to return downgrade, switch, consolidate, or credit recommendations. I reversed that decision after reading the assignment more carefully and thinking about how a finance-minded reviewer would judge the output. A recommendation that changes a startup's tool spend needs arithmetic, sourceable pricing, and stable behavior. If the model guessed a price or exaggerated a savings opportunity, the whole audit would feel like marketing copy.

The reversed design is stricter. The audit engine owns all numbers, plan comparisons, duplicate-tool detection, use-case fit, and credit recommendations. Pricing is stored in `pricing.ts` and cited in `PRICING_DATA.md`, while tests cover the cases most likely to create bad advice: custom plans with no spend, duplicate coding tools, API spend, and minimum-seat billing floors. Anthropic is now used only for the personalized summary paragraph after the deterministic result exists. If the API fails, the app falls back to a templated summary using the same computed totals. That trade-off gives up some free-form cleverness, but it makes the product easier to defend.

## 3. Week 2 Build

In week 2 I would add benchmark mode, because the current product answers only one half of the founder's question. It can say "you can save X dollars," but it cannot yet say whether the company is unusually expensive compared with similar teams. A founder with a $900 monthly AI bill may be fine at 25 engineers and very wasteful at 4 engineers. The benchmark feature would collect anonymized spend per seat, bucket it by team size and primary use case, and show a percentile comparison such as "your coding-tool spend is 1.8x the median for teams of 6-10."

I would implement this carefully rather than pretending to have a large dataset on day one. The first version would label benchmarks as early-sample estimates and show confidence based on sample size. I would also separate personal/team identifying data from benchmark records, because the viral share page should not expose private company information. Product-wise, benchmark mode strengthens both user value and Credex lead qualification. A high absolute bill is less meaningful than high spend relative to peers. If the app can identify "small team, high per-seat retail spend, credit-eligible tools," Credex gets a warmer lead and the user gets a clearer reason to book a consultation.

## 4. AI Usage

I used AI assistance for planning, code review, copy drafting, and implementation scaffolding. The useful parts were fast iteration on the shape of the app, catching missing tests, and turning the assignment into a checklist of concrete deliverables. I also used AI to help write concise product copy, but I treated those drafts as starting points because the project needs to sound like a real Credex lead-generation tool, not a generic SaaS landing page. The code I trusted least from AI was anything involving money, pricing, or privacy boundaries.

One specific AI mistake I caught was overconfident recommendation logic for custom and API plans. The draft logic wanted to apply savings whenever a tool looked expensive, even when the user entered zero spend for an enterprise or API-direct plan. That would manufacture savings and violate the assignment's instruction to be honest for already-optimal or unknown cases. I changed the engine so custom/API plans with no current spend get a low-confidence keep recommendation and zero invented savings. I also kept vendor prices in a typed pricing file and documented official source URLs separately. The principle was simple: AI can help with wording and structure, but deterministic code must own the financial claims.

## 5. Self Rating

Discipline: 7/10 - the repo has the required structure, tests, CI, and devlog format, but the final score depends on continuing honest work across multiple calendar days instead of compressing the whole assignment into one push.

Code quality: 8/10 - the core audit path is typed, covered by focused tests, and split into small modules for pricing, validation, audit math, persistence, email, and summary generation. The main remaining engineering risk is production hardening around rate-limit atomicity and deployed observability.

Design sense: 7/10 - the UI is clear, responsive, and oriented around the savings result rather than decorative marketing. I verified the deployed landing page, public report route, and Open Graph endpoint from production, but I would still want manual browser screenshots across mobile and desktop before calling the design polished enough for launch.

Problem-solving: 8/10 - the strongest technical choices were separating deterministic math from LLM prose, storing public-safe audits separately from private leads, and refusing to invent savings when data is missing. Those choices make the app more trustworthy even if they reduce flashiness.

Entrepreneurial thinking: 7/10 - the product has a coherent lead-generation loop for Credex: value first, report capture second, consultation intent for high-savings users. The unresolved proof is the real interview work. Three specific conversations could still change positioning, required inputs, and what the first distribution channel should be.
