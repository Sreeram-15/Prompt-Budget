import { fallbackSummary } from "../auditEngine";
import type { AuditResult } from "../types";

export async function generateSummary(audit: AuditResult): Promise<string> {
  if (!process.env.ANTHROPIC_API_KEY) return audit.summary;

  try {
    const response = await fetch("https://api.anthropic.com/v1/messages", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "x-api-key": process.env.ANTHROPIC_API_KEY,
        "anthropic-version": "2023-06-01"
      },
      body: JSON.stringify({
        model: "claude-3-5-haiku-latest",
        max_tokens: 170,
        temperature: 0.3,
        messages: [
          {
            role: "user",
            content: `Write a specific ~100-word audit summary for a startup founder. Do not invent numbers. Mention total monthly savings, annual savings, primary use case, and whether Credex should be consulted.\n\nAudit JSON:\n${JSON.stringify({
              useCase: audit.input.useCase,
              teamSize: audit.input.teamSize,
              totalMonthlySavings: audit.totalMonthlySavings,
              totalAnnualSavings: audit.totalAnnualSavings,
              credexQualified: audit.credexQualified,
              results: audit.results.map((result) => ({
                tool: result.tool,
                action: result.recommendedAction,
                savings: result.monthlySavings,
                reason: result.reason
              }))
            })}`
          }
        ]
      })
    });

    if (!response.ok) throw new Error("Anthropic request failed.");
    const data = (await response.json()) as { content?: Array<{ text?: string }> };
    const text = data.content?.map((item) => item.text).filter(Boolean).join(" ").trim();
    return text || audit.summary;
  } catch {
    return fallbackSummary({
      totalMonthlySavings: audit.totalMonthlySavings,
      toolCount: audit.input.tools.length,
      useCase: audit.input.useCase,
      credexQualified: audit.credexQualified
    });
  }
}
