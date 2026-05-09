import { tools, useCases, type AuditInput, type LeadInput, type ToolInput } from "./types";

export function parseAuditInput(value: unknown): AuditInput {
  const body = value as Partial<AuditInput>;
  if (!body || typeof body !== "object") throw new Error("Invalid request body.");
  if (!useCases.includes(body.useCase as AuditInput["useCase"])) throw new Error("Choose a valid primary use case.");

  const parsedTools = Array.isArray(body.tools) ? body.tools.map(parseToolInput) : [];
  if (parsedTools.length === 0) throw new Error("Add at least one AI tool.");

  return {
    teamSize: positiveNumber(body.teamSize, "team size"),
    useCase: body.useCase as AuditInput["useCase"],
    tools: parsedTools
  };
}

export function parseLeadInput(value: unknown): LeadInput {
  const body = value as Partial<LeadInput>;
  if (!body || typeof body !== "object") throw new Error("Invalid request body.");
  if (typeof body.website === "string" && body.website.trim()) throw new Error("Spam submission rejected.");
  if (!body.auditId || typeof body.auditId !== "string") throw new Error("Missing audit id.");
  if (!body.email || typeof body.email !== "string" || !body.email.includes("@")) throw new Error("Enter a valid email.");

  return {
    auditId: body.auditId,
    email: body.email.trim().toLowerCase(),
    companyName: cleanOptional(body.companyName),
    role: cleanOptional(body.role),
    teamSize: body.teamSize ? positiveNumber(body.teamSize, "team size") : undefined,
    consultationRequested: Boolean(body.consultationRequested)
  };
}

function parseToolInput(value: unknown): ToolInput {
  const tool = value as Partial<ToolInput>;
  if (!tools.includes(tool.tool as ToolInput["tool"])) throw new Error("Choose a supported AI tool.");
  if (!tool.plan || typeof tool.plan !== "string") throw new Error("Choose a plan for every tool.");

  return {
    id: typeof tool.id === "string" && tool.id ? tool.id : crypto.randomUUID(),
    tool: tool.tool as ToolInput["tool"],
    plan: tool.plan,
    monthlySpend: positiveNumber(tool.monthlySpend, "monthly spend", true),
    seats: positiveNumber(tool.seats, "seats")
  };
}

function positiveNumber(value: unknown, label: string, allowZero = false): number {
  const number = Number(value);
  if (!Number.isFinite(number) || number < (allowZero ? 0 : 1)) {
    throw new Error(`Enter a valid ${label}.`);
  }
  return number;
}

function cleanOptional(value: unknown): string | undefined {
  return typeof value === "string" && value.trim() ? value.trim().slice(0, 120) : undefined;
}
