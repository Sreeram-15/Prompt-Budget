import { cheapestSameVendorPlan, planCost, pricingData } from "./pricing";
import type { AuditInput, AuditResult, ToolAuditResult, ToolInput } from "./types";

const codingTools = new Set(["Cursor", "GitHub Copilot", "v0"]);
const chatTools = new Set(["Claude", "ChatGPT", "Gemini"]);
const creditCandidateTools = new Set(["Cursor", "Claude", "ChatGPT", "Anthropic API", "OpenAI API", "Gemini"]);

export function runAudit(input: AuditInput): AuditResult {
  const normalized = normalizeInput(input);
  const duplicateCodingTools = normalized.useCase === "coding" || normalized.useCase === "mixed"
    ? normalized.tools.filter((tool) => codingTools.has(tool.tool))
    : [];

  const results = normalized.tools.map((tool) => evaluateTool(tool, normalized, duplicateCodingTools));
  const totalMonthlySpend = sum(results.map((result) => result.currentSpend));
  const totalMonthlySavings = sum(results.map((result) => result.monthlySavings));

  return {
    input: normalized,
    results,
    totalMonthlySpend,
    totalMonthlySavings,
    totalAnnualSavings: totalMonthlySavings * 12,
    status: totalMonthlySavings >= 100 ? "optimize" : "healthy",
    credexQualified: totalMonthlySavings > 500,
    summary: fallbackSummary({
      totalMonthlySavings,
      toolCount: normalized.tools.length,
      useCase: normalized.useCase,
      credexQualified: totalMonthlySavings > 500
    })
  };
}

export function fallbackSummary(args: {
  totalMonthlySavings: number;
  toolCount: number;
  useCase: string;
  credexQualified: boolean;
}): string {
  if (args.totalMonthlySavings < 100) {
    return `Your AI stack is already disciplined for a ${args.useCase} workflow. The audit found only minor optimization potential across ${args.toolCount} tool${args.toolCount === 1 ? "" : "s"}, so the best next step is monitoring new pricing and credit opportunities instead of forcing a downgrade.`;
  }

  const credexLine = args.credexQualified
    ? " Because the savings are material, discounted infrastructure credits are worth a direct Credex review."
    : " The fastest win is to make the recommended plan changes before adding new tools.";
  return `Your current AI stack has about $${args.totalMonthlySavings.toLocaleString()} in monthly savings potential across ${args.toolCount} tool${args.toolCount === 1 ? "" : "s"}. The biggest opportunities come from matching plans to actual team size, removing overlapping subscriptions, and avoiding retail pricing where credits can cover the same usage.${credexLine}`;
}

function evaluateTool(tool: ToolInput, input: AuditInput, duplicateCodingTools: ToolInput[]): ToolAuditResult {
  const currentSpend = dollars(tool.monthlySpend);
  const seats = Math.max(1, tool.seats);
  const listedPlanCost = planCost(tool.tool, tool.plan, seats);
  const isCustomOrApi = listedPlanCost === null;

  let recommendedSpend = currentSpend;
  let action: ToolAuditResult["recommendedAction"] = "keep";
  let confidence: ToolAuditResult["confidence"] = "high";
  let reason = "Current plan looks aligned with team size and use case.";

  if (!isCustomOrApi) {
    const cheaperPlan = cheapestSameVendorPlan(tool.tool, seats, input.teamSize >= 5);
    if (cheaperPlan) {
      const cheaperCost = planCost(tool.tool, cheaperPlan.name, seats);
      if (cheaperCost !== null && cheaperCost + 1 < currentSpend && cheaperPlan.name !== tool.plan) {
        recommendedSpend = cheaperCost;
        action = "downgrade";
        reason = `${cheaperPlan.name} covers this seat count at lower published pricing than the current ${tool.plan} spend.`;
      }
    }
  }

  if (duplicateCodingTools.length > 1 && codingTools.has(tool.tool)) {
    const keepTool = choosePrimaryCodingTool(duplicateCodingTools);
    if (tool.id !== keepTool.id && currentSpend > 0) {
      recommendedSpend = Math.min(recommendedSpend, 0);
      action = "consolidate";
      reason = `${keepTool.tool} already covers the core coding workflow, so this overlapping coding subscription can be removed first.`;
    }
  }

  if ((input.useCase === "writing" || input.useCase === "research") && codingTools.has(tool.tool) && currentSpend > 0) {
    recommendedSpend = Math.min(recommendedSpend, 0);
    action = "switch";
    reason = `${tool.tool} is optimized for coding, while this audit is primarily ${input.useCase}; a general assistant plan is a better fit.`;
  }

  if ((input.useCase === "coding" || input.useCase === "mixed") && chatTools.has(tool.tool) && currentSpend >= seats * 30) {
    const cursorCost = 20 * seats;
    if (cursorCost < recommendedSpend) {
      recommendedSpend = cursorCost;
      action = "switch";
      reason = `For a coding-heavy team, Cursor Pro can cover the main workflow at $20 per seat before adding a second chat subscription.`;
    }
  }

  if (creditCandidateTools.has(tool.tool) && currentSpend >= 300) {
    const creditAdjusted = Math.round(currentSpend * 0.75);
    if (creditAdjusted < recommendedSpend) {
      recommendedSpend = creditAdjusted;
      action = "credits";
      confidence = "medium";
      reason = `This is high enough monthly spend to evaluate discounted AI credits instead of paying the full retail bill.`;
    }
  }

  if (isCustomOrApi && currentSpend === 0) {
    recommendedSpend = 0;
    action = "keep";
    confidence = "low";
    reason = "No current spend was provided, so the audit does not invent savings for custom or API pricing.";
  }

  const monthlySavings = Math.max(0, dollars(currentSpend - recommendedSpend));

  return {
    id: tool.id,
    tool: tool.tool,
    plan: tool.plan,
    currentSpend,
    recommendedAction: action,
    recommendedSpend: dollars(currentSpend - monthlySavings),
    monthlySavings,
    annualSavings: monthlySavings * 12,
    reason,
    confidence
  };
}

function choosePrimaryCodingTool(tools: ToolInput[]): ToolInput {
  const priority = ["Cursor", "GitHub Copilot", "v0"];
  return [...tools].sort((a, b) => priority.indexOf(a.tool) - priority.indexOf(b.tool))[0];
}

function normalizeInput(input: AuditInput): AuditInput {
  return {
    teamSize: Math.max(1, Math.round(Number(input.teamSize) || 1)),
    useCase: input.useCase,
    tools: input.tools
      .filter((tool) => pricingData[tool.tool])
      .map((tool) => ({
        ...tool,
        monthlySpend: dollars(Number(tool.monthlySpend) || 0),
        seats: Math.max(1, Math.round(Number(tool.seats) || 1))
      }))
  };
}

function sum(values: number[]): number {
  return dollars(values.reduce((total, value) => total + value, 0));
}

function dollars(value: number): number {
  return Math.round(value * 100) / 100;
}
