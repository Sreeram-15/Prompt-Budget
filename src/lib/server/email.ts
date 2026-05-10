import type { AuditResult, LeadInput } from "../types";
import { siteUrl } from "./env";

export async function sendLeadEmail(lead: LeadInput, audit: AuditResult | null): Promise<void> {
  if (!process.env.RESEND_API_KEY) return;

  const savings = audit ? `$${audit.totalMonthlySavings.toLocaleString()}/mo` : "your audit";
  const consultLine = audit?.credexQualified || lead.consultationRequested
    ? "Your audit shows a material savings opportunity, so Credex may reach out about discounted AI infrastructure credits."
    : "Your audit is saved. We will notify you when new optimizations apply to your stack.";
  const reportUrl = `${siteUrl}/audit/${encodeURIComponent(lead.auditId)}`;

  const response = await fetch("https://api.resend.com/emails", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${process.env.RESEND_API_KEY}`,
      "Content-Type": "application/json"
    },
    body: JSON.stringify({
      from: process.env.RESEND_FROM || "SpendScope <audits@spendscope.local>",
      to: lead.email,
      subject: "Your AI spend audit is ready",
      html: `<p>Your SpendScope audit found <strong>${escapeHtml(savings)}</strong> in potential monthly savings.</p><p>${escapeHtml(consultLine)}</p><p>Public report: <a href="${reportUrl}">${reportUrl}</a></p>`
    })
  });

  if (!response.ok) {
    throw new Error("Could not send lead email.");
  }
}

function escapeHtml(value: string): string {
  return value
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;");
}
