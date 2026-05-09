# Prompts

## Personalized Audit Summary

```text
Write a specific ~100-word audit summary for a startup founder. Do not invent numbers. Mention total monthly savings, annual savings, primary use case, and whether Credex should be consulted.

Audit JSON:
{...computed audit facts...}
```

The prompt is intentionally narrow: the audit engine computes all numbers first, and the model only turns verified facts into readable prose. The fallback is a deterministic template so the product still works when Anthropic is unavailable, slow, or over quota.

What did not work: asking the model to decide savings recommendations. That produced plausible but non-auditable advice and sometimes invented pricing assumptions.
