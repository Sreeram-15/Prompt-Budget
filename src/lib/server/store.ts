import { hasSupabase } from "./env";
import type { AuditResult, LeadInput } from "../types";

const memoryAudits = new Map<string, AuditResult>();
const memoryLeads: LeadInput[] = [];
const memoryLimits = new Map<string, { count: number; resetAt: number }>();

export async function saveAudit(audit: AuditResult): Promise<AuditResult> {
  const createdAt = new Date().toISOString();
  const id = crypto.randomUUID();
  const record = { ...audit, id, createdAt };

  if (hasSupabase()) {
    const response = await supabaseFetch("/rest/v1/audits", {
      method: "POST",
      body: JSON.stringify({
        id,
        created_at: createdAt,
        audit_input: record.input,
        audit_result: stripPublicAudit(record),
        total_monthly_spend: record.totalMonthlySpend,
        total_monthly_savings: record.totalMonthlySavings,
        total_annual_savings: record.totalAnnualSavings,
        use_case: record.input.useCase,
        team_size: record.input.teamSize
      }),
      headers: { Prefer: "return=minimal" }
    });
    if (!response.ok) throw new Error("Could not save audit.");
  } else {
    const publicRecord = stripPublicAudit(record);
    publicRecord.id = encodePublicAudit(publicRecord);
    memoryAudits.set(publicRecord.id, publicRecord);
    return publicRecord;
  }

  return record;
}

export async function getPublicAudit(id: string): Promise<AuditResult | null> {
  if (hasSupabase()) {
    const response = await supabaseFetch(`/rest/v1/audits?id=eq.${encodeURIComponent(id)}&select=audit_result`, {
      method: "GET"
    });
    if (!response.ok) return null;
    const rows = (await response.json()) as Array<{ audit_result: AuditResult }>;
    return rows[0]?.audit_result ?? null;
  }

  return memoryAudits.get(id) ?? decodePublicAudit(id);
}

export async function saveLead(lead: LeadInput): Promise<void> {
  if (hasSupabase()) {
    const response = await supabaseFetch("/rest/v1/leads", {
      method: "POST",
      body: JSON.stringify({
        audit_id: lead.auditId,
        email: lead.email,
        company_name: lead.companyName ?? null,
        role: lead.role ?? null,
        team_size: lead.teamSize ?? null,
        consultation_requested: Boolean(lead.consultationRequested)
      }),
      headers: { Prefer: "return=minimal" }
    });
    if (!response.ok) throw new Error("Could not save lead.");
  } else {
    memoryLeads.push(lead);
  }
}

export async function enforceRateLimit(key: string, limit = 12, windowMs = 60_000): Promise<boolean> {
  const now = Date.now();
  const hash = await sha256(key);
  const windowStart = new Date(now - (now % windowMs)).toISOString();

  if (hasSupabase()) {
    const current = await supabaseFetch(
      `/rest/v1/rate_limits?key_hash=eq.${hash}&window_start=eq.${encodeURIComponent(windowStart)}&select=count`,
      { method: "GET" }
    );
    const rows = current.ok ? ((await current.json()) as Array<{ count: number }>) : [];
    const count = rows[0]?.count ?? 0;
    if (count >= limit) return false;

    const response = await supabaseFetch("/rest/v1/rate_limits?on_conflict=key_hash,window_start", {
      method: "POST",
      body: JSON.stringify({ key_hash: hash, window_start: windowStart, count: count + 1 }),
      headers: { Prefer: "resolution=merge-duplicates,return=minimal" }
    });
    return response.ok;
  }

  const existing = memoryLimits.get(hash);
  if (!existing || existing.resetAt < now) {
    memoryLimits.set(hash, { count: 1, resetAt: now + windowMs });
    return true;
  }
  existing.count += 1;
  return existing.count <= limit;
}

export function stripPublicAudit(audit: AuditResult): AuditResult {
  return {
    ...audit,
    input: {
      ...audit.input,
      tools: audit.input.tools.map((tool) => ({
        id: tool.id,
        tool: tool.tool,
        plan: tool.plan,
        monthlySpend: tool.monthlySpend,
        seats: tool.seats
      }))
    }
  };
}

async function supabaseFetch(path: string, init: RequestInit): Promise<Response> {
  const url = `${process.env.SUPABASE_URL}${path}`;
  return fetch(url, {
    ...init,
    headers: {
      apikey: process.env.SUPABASE_SERVICE_ROLE_KEY ?? "",
      Authorization: `Bearer ${process.env.SUPABASE_SERVICE_ROLE_KEY}`,
      "Content-Type": "application/json",
      ...(init.headers ?? {})
    }
  });
}

async function sha256(value: string): Promise<string> {
  const bytes = new TextEncoder().encode(value);
  const digest = await crypto.subtle.digest("SHA-256", bytes);
  return Array.from(new Uint8Array(digest))
    .map((byte) => byte.toString(16).padStart(2, "0"))
    .join("");
}

function encodePublicAudit(audit: AuditResult): string {
  const json = JSON.stringify({ ...audit, id: undefined });
  const bytes = new TextEncoder().encode(json);
  const binary = Array.from(bytes, (byte) => String.fromCharCode(byte)).join("");
  return `r_${btoa(binary).replace(/\+/g, "-").replace(/\//g, "_").replace(/=+$/g, "")}`;
}

function decodePublicAudit(id: string): AuditResult | null {
  if (!id.startsWith("r_")) return null;

  try {
    const padded = id.slice(2).replace(/-/g, "+").replace(/_/g, "/").padEnd(Math.ceil((id.length - 2) / 4) * 4, "=");
    const binary = atob(padded);
    const bytes = Uint8Array.from(binary, (char) => char.charCodeAt(0));
    const audit = JSON.parse(new TextDecoder().decode(bytes)) as AuditResult;
    return { ...audit, id };
  } catch {
    return null;
  }
}
