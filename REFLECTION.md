# Reflection

## 1. Hardest Bug

The hardest bug so far was keeping the public audit page useful without leaking private lead data. My first model was tempted to store the whole submission in one record, but that would mix email capture details with the viral share URL. I split the storage path into an `audits` table for public-safe report data and a `leads` table for email, company, and role. I tested this by reading the public audit route and checking that it only renders tool names, plans, seats, and savings numbers.

## 2. Decision Reversed

I initially considered making the LLM responsible for ranking recommendations because it would sound more personalized. I reversed that quickly because the assignment explicitly rewards defensible finance logic. The audit engine now produces numbers and actions deterministically. Anthropic only writes a summary paragraph from those already-computed facts, and failures fall back to a template.

## 3. Week 2 Build

In week 2 I would add benchmark mode. The current product can say "you can save X dollars," but a founder also wants to know whether their spend per developer is abnormal. I would collect anonymous spend-per-seat data, bucket it by team size and use case, and show a percentile comparison. That would also improve Credex lead qualification because a high absolute bill is less interesting than a high bill relative to team size.

## 4. AI Usage

I used AI assistance for planning, copy drafting, and implementation scaffolding. I did not trust AI with pricing truth or savings math without explicit source links because small pricing errors would undermine the whole audit. A specific AI mistake I caught was the tendency to over-specify recommendations without enough spend data; the engine now avoids inventing savings for custom enterprise or API plans when the user enters zero spend.

## 5. Self Rating

Discipline: 7/10 - the implementation is structured, but the real seven-day commit history still needs to be built honestly.  
Code quality: 8/10 - the audit engine is typed and tested, with integrations isolated behind small adapters.  
Design sense: 7/10 - the UI is clear and shareable, with room for more visual refinement after screenshots.  
Problem-solving: 8/10 - the product separates deterministic math from LLM prose and keeps public/private data apart.  
Entrepreneurial thinking: 7/10 - the lead-gen flow is coherent, but the interviews and real distribution work are still the key proof.
