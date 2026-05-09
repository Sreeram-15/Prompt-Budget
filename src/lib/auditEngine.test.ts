import { describe, it } from "node:test";
import assert from "node:assert/strict";
import { runAudit } from "./auditEngine";
import type { AuditInput } from "./types";

function audit(overrides: Partial<AuditInput>): AuditInput {
  return {
    teamSize: 2,
    useCase: "coding",
    tools: [
      {
        id: "tool-1",
        tool: "Cursor",
        plan: "Business",
        monthlySpend: 80,
        seats: 2
      }
    ],
    ...overrides
  };
}

describe("runAudit", () => {
  it("recommends a downgrade when a team plan is wasteful for two seats", () => {
    const result = runAudit(audit({}));

    assert.equal(result.results[0].recommendedAction, "downgrade");
    assert.equal(result.results[0].recommendedSpend, 40);
    assert.equal(result.results[0].monthlySavings, 40);
  });

  it("does not invent savings for custom enterprise spend when no spend is provided", () => {
    const result = runAudit(audit({
      tools: [{ id: "enterprise", tool: "Claude", plan: "Enterprise", monthlySpend: 0, seats: 10 }]
    }));

    assert.equal(result.results[0].monthlySavings, 0);
    assert.equal(result.results[0].confidence, "low");
  });

  it("qualifies Credex when monthly savings exceed 500 dollars", () => {
    const result = runAudit(audit({
      teamSize: 20,
      useCase: "mixed",
      tools: [
        { id: "openai", tool: "OpenAI API", plan: "API direct", monthlySpend: 1800, seats: 20 },
        { id: "anthropic", tool: "Anthropic API", plan: "API direct", monthlySpend: 900, seats: 20 }
      ]
    }));

    assert.ok(result.totalMonthlySavings > 500);
    assert.equal(result.credexQualified, true);
  });

  it("returns a healthy status for an already optimized stack", () => {
    const result = runAudit(audit({
      teamSize: 1,
      useCase: "writing",
      tools: [{ id: "chatgpt", tool: "ChatGPT", plan: "Plus", monthlySpend: 20, seats: 1 }]
    }));

    assert.equal(result.status, "healthy");
    assert.ok(result.totalMonthlySavings < 100);
  });

  it("surfaces consolidation savings for duplicate coding tools", () => {
    const result = runAudit(audit({
      useCase: "coding",
      tools: [
        { id: "cursor", tool: "Cursor", plan: "Pro", monthlySpend: 40, seats: 2 },
        { id: "copilot", tool: "GitHub Copilot", plan: "Business", monthlySpend: 38, seats: 2 }
      ]
    }));

    const copilot = result.results.find((item) => item.tool === "GitHub Copilot");
    assert.equal(copilot?.recommendedAction, "consolidate");
    assert.equal(copilot?.monthlySavings, 38);
  });

  it("never recommends API savings above the user-provided spend", () => {
    const result = runAudit(audit({
      tools: [{ id: "api", tool: "OpenAI API", plan: "API direct", monthlySpend: 320, seats: 1 }]
    }));

    assert.ok(result.results[0].monthlySavings <= 320);
    assert.ok(result.results[0].recommendedSpend >= 0);
  });
});
