import type { AuditInput, AuditResult, LeadInput } from "./types";

export async function createAudit(input: AuditInput): Promise<AuditResult> {
  const response = await fetch("/api/audits", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(input)
  });
  if (!response.ok) throw new Error((await response.json()).error ?? "Could not create audit.");
  return response.json();
}

export async function captureLead(input: LeadInput): Promise<void> {
  const response = await fetch("/api/leads", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(input)
  });
  if (!response.ok) throw new Error((await response.json()).error ?? "Could not capture lead.");
}
