import { pricingData } from "./pricing";
import { tools, useCases, type AuditInput, type LeadInput, type ToolInput } from "./types";

const maxToolsPerAudit = 12;
const maxTeamSize = 10_000;
const maxSeats = 10_000;
const maxMonthlySpend = 1_000_000;
const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export function parseAuditInput(value: unknown): AuditInput {
  const body = value as Partial<AuditInput>;
  if (!body || typeof body !== "object") throw new Error("Invalid request body.");
  if (!useCases.includes(body.useCase as AuditInput["useCase"])) throw new Error("Choose a valid primary use case.");

  if (Array.isArray(body.tools) && body.tools.length > maxToolsPerAudit) {
    throw new Error(`Add no more than ${maxToolsPerAudit} AI tools.`);
  }
  const parsedTools = Array.isArray(body.tools) ? body.tools.map(parseToolInput) : [];
  if (parsedTools.length === 0) throw new Error("Add at least one AI tool.");

  return {
    teamSize: wholeNumber(body.teamSize, "team size", { max: maxTeamSize }),
    useCase: body.useCase as AuditInput["useCase"],
    tools: parsedTools
  };
}

export function parseLeadInput(value: unknown): LeadInput {
  const body = value as Partial<LeadInput>;
  if (!body || typeof body !== "object") throw new Error("Invalid request body.");
  if (typeof body.website === "string" && body.website.trim()) throw new Error("Spam submission rejected.");
  const auditId = cleanRequired(body.auditId, "audit id");
  const email = cleanRequired(body.email, "email").toLowerCase();
  if (!emailPattern.test(email)) throw new Error("Enter a valid email.");

  return {
    auditId,
    email,
    companyName: cleanOptional(body.companyName),
    role: cleanOptional(body.role),
    teamSize: body.teamSize ? wholeNumber(body.teamSize, "team size", { max: maxTeamSize }) : undefined,
    consultationRequested: Boolean(body.consultationRequested)
  };
}

function parseToolInput(value: unknown): ToolInput {
  const tool = value as Partial<ToolInput>;
  if (!tools.includes(tool.tool as ToolInput["tool"])) throw new Error("Choose a supported AI tool.");
  if (!tool.plan || typeof tool.plan !== "string") throw new Error("Choose a plan for every tool.");
  const selectedTool = tool.tool as ToolInput["tool"];
  if (!pricingData[selectedTool].some((plan) => plan.name === tool.plan)) {
    throw new Error(`Choose a valid ${selectedTool} plan.`);
  }

  return {
    id: typeof tool.id === "string" && tool.id ? tool.id : crypto.randomUUID(),
    tool: selectedTool,
    plan: tool.plan,
    monthlySpend: moneyAmount(tool.monthlySpend, "monthly spend"),
    seats: wholeNumber(tool.seats, "seats", { max: maxSeats })
  };
}

function moneyAmount(value: unknown, label: string): number {
  const number = Number(value);
  if (!Number.isFinite(number) || number < 0 || number > maxMonthlySpend) {
    throw new Error(`Enter a valid ${label}.`);
  }
  return Math.round(number * 100) / 100;
}

function wholeNumber(value: unknown, label: string, options: { max: number }): number {
  const number = Number(value);
  if (!Number.isSafeInteger(number) || number < 1 || number > options.max) {
    throw new Error(`Enter a valid ${label}.`);
  }
  return number;
}

function cleanRequired(value: unknown, label: string): string {
  if (typeof value !== "string" || !value.trim()) throw new Error(`Missing ${label}.`);
  return value.trim();
}

function cleanOptional(value: unknown): string | undefined {
  return typeof value === "string" && value.trim() ? value.trim().slice(0, 120) : undefined;
}
