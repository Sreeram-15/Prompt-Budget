"use client";

import { FormEvent, useState } from "react";
import { captureLead } from "@/lib/api";
import type { AuditResult } from "@/lib/types";

export default function ResultsView({ audit, publicMode = false }: { audit: AuditResult; publicMode?: boolean }) {
  const [email, setEmail] = useState("");
  const [companyName, setCompanyName] = useState("");
  const [role, setRole] = useState("");
  const [website, setWebsite] = useState("");
  const [consultationRequested, setConsultationRequested] = useState(audit.credexQualified);
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(false);

  const shareUrl = typeof window !== "undefined" && audit.id ? `${window.location.origin}/audit/${audit.id}` : "";

  async function submitLead(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!audit.id) return;
    setLoading(true);
    setMessage("");
    try {
      await captureLead({
        auditId: audit.id,
        email,
        companyName,
        role,
        teamSize: audit.input.teamSize,
        consultationRequested,
        website
      });
      setMessage("Report saved. Check your email for the confirmation.");
    } catch (error) {
      setMessage(error instanceof Error ? error.message : "Could not save report.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <section className="results">
      <div className="savings-hero">
        <div>
          <p className="eyebrow">{audit.status === "healthy" ? "Healthy spend" : "Optimization found"}</p>
          <h2>${audit.totalMonthlySavings.toLocaleString()} monthly savings</h2>
          <p>${audit.totalAnnualSavings.toLocaleString()} annualized savings from ${audit.totalMonthlySpend.toLocaleString()} in current monthly spend.</p>
        </div>
        <div className={audit.credexQualified ? "credex-card active" : "credex-card"}>
          <strong>{audit.credexQualified ? "Credex fit" : "Monitor fit"}</strong>
          <span>
            {audit.credexQualified
              ? "Savings exceed $500/mo. Discounted infrastructure credits should be part of the next conversation."
              : audit.totalMonthlySavings < 100
                ? "You are spending well. Capture the report to get notified when new optimizations apply."
                : "Make plan changes first, then re-audit before buying new seats."}
          </span>
        </div>
      </div>

      <p className="summary">{audit.summary}</p>

      <div className="breakdown">
        {audit.results.map((result) => (
          <article className="result-row" key={result.id}>
            <div>
              <strong>{result.tool}</strong>
              <span>{result.plan} / {result.recommendedAction}</span>
            </div>
            <div className="money-line">
              <span>${result.currentSpend.toLocaleString()}</span>
              <span>to</span>
              <span>${result.recommendedSpend.toLocaleString()}</span>
            </div>
            <p>{result.reason}</p>
            <b>${result.monthlySavings.toLocaleString()}/mo saved</b>
          </article>
        ))}
      </div>

      {!publicMode ? (
        <form className="lead-form" onSubmit={submitLead}>
          <div>
            <h3>{audit.credexQualified ? "Send me the report and consultation next steps" : "Save this audit"}</h3>
            <p>Email capture happens after the audit, so the value is visible first.</p>
          </div>
          <input aria-label="Website" className="honeypot" tabIndex={-1} autoComplete="off" value={website} onChange={(event) => setWebsite(event.target.value)} />
          <div className="form-row">
            <label>
              Email
              <input required type="email" value={email} onChange={(event) => setEmail(event.target.value)} />
            </label>
            <label>
              Company
              <input value={companyName} onChange={(event) => setCompanyName(event.target.value)} />
            </label>
            <label>
              Role
              <input value={role} onChange={(event) => setRole(event.target.value)} />
            </label>
          </div>
          {audit.credexQualified ? (
            <label className="checkbox-line">
              <input
                type="checkbox"
                checked={consultationRequested}
                onChange={(event) => setConsultationRequested(event.target.checked)}
              />
              Ask Credex to follow up about discounted AI credits
            </label>
          ) : null}
          <button className="primary-button" type="submit" disabled={loading || !audit.id}>{loading ? "Saving..." : "Email me the report"}</button>
          {shareUrl ? <a className="secondary-link" href={shareUrl}>Open public report</a> : null}
          {message ? <p className="status-message">{message}</p> : null}
        </form>
      ) : null}
    </section>
  );
}
