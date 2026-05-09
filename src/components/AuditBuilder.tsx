"use client";

import { FormEvent, useEffect, useMemo, useState } from "react";
import ResultsView from "./ResultsView";
import { createAudit } from "@/lib/api";
import { pricingData } from "@/lib/pricing";
import { tools, useCases, type AuditInput, type AuditResult, type ToolInput, type ToolName } from "@/lib/types";

const storageKey = "spendscope-audit-form";

const emptyTool = (): ToolInput => ({
  id: crypto.randomUUID(),
  tool: "Cursor",
  plan: "Pro",
  monthlySpend: 20,
  seats: 1
});

const defaultInput: AuditInput = {
  teamSize: 4,
  useCase: "coding",
  tools: [emptyTool()]
};

export default function AuditBuilder() {
  const [input, setInput] = useState<AuditInput>(defaultInput);
  const [audit, setAudit] = useState<AuditResult | null>(null);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const saved = window.localStorage.getItem(storageKey);
    if (saved) setInput(JSON.parse(saved) as AuditInput);
  }, []);

  useEffect(() => {
    window.localStorage.setItem(storageKey, JSON.stringify(input));
  }, [input]);

  const totalSpend = useMemo(
    () => input.tools.reduce((total, tool) => total + Number(tool.monthlySpend || 0), 0),
    [input.tools]
  );

  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError("");
    setLoading(true);
    try {
      const result = await createAudit(input);
      setAudit(result);
      window.history.replaceState(null, "", result.id ? `/audit/${result.id}` : "/");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Could not run audit.");
    } finally {
      setLoading(false);
    }
  }

  function updateTool(id: string, patch: Partial<ToolInput>) {
    setInput((current) => ({
      ...current,
      tools: current.tools.map((tool) => {
        if (tool.id !== id) return tool;
        const nextTool = { ...tool, ...patch };
        if (patch.tool) {
          const firstPlan = pricingData[patch.tool].find((plan) => !plan.custom) ?? pricingData[patch.tool][0];
          nextTool.plan = firstPlan.name;
          nextTool.monthlySpend = (firstPlan.monthlyFlat ?? 0) + (firstPlan.monthlyPerSeat ?? 0) * nextTool.seats;
        }
        return nextTool;
      })
    }));
  }

  return (
    <main>
      <section className="hero">
        <nav className="topbar">
          <span className="brand">SpendScope</span>
          <a className="secondary-link" href="#audit">Run audit</a>
        </nav>
        <div className="hero-grid">
          <div>
            <p className="eyebrow">Free AI spend audit</p>
            <h1>Find the AI bill hiding in your stack.</h1>
            <p className="hero-copy">
              Enter your AI tools, plans, seats, and current monthly spend. SpendScope shows savings immediately, then lets you save or share the report.
            </p>
          </div>
          <div className="hero-panel" aria-label="example audit result">
            <span>Total stack entered</span>
            <strong>${totalSpend.toLocaleString()}</strong>
            <small>Potential savings appear after the audit runs.</small>
          </div>
        </div>
      </section>

      <section className="workspace" id="audit">
        <form className="audit-form" onSubmit={submit}>
          <div className="section-heading">
            <h2>AI stack</h2>
            <button
              className="ghost-button"
              type="button"
              onClick={() => setInput((current) => ({ ...current, tools: [...current.tools, emptyTool()] }))}
            >
              Add tool
            </button>
          </div>

          <div className="form-row">
            <label>
              Team size
              <input
                min="1"
                type="number"
                value={input.teamSize}
                onChange={(event) => setInput({ ...input, teamSize: Number(event.target.value) })}
              />
            </label>
            <label>
              Primary use case
              <select
                value={input.useCase}
                onChange={(event) => setInput({ ...input, useCase: event.target.value as AuditInput["useCase"] })}
              >
                {useCases.map((useCase) => (
                  <option key={useCase} value={useCase}>{useCase}</option>
                ))}
              </select>
            </label>
          </div>

          <div className="tool-list">
            {input.tools.map((tool) => (
              <div className="tool-row" key={tool.id}>
                <label>
                  Tool
                  <select value={tool.tool} onChange={(event) => updateTool(tool.id, { tool: event.target.value as ToolName })}>
                    {tools.map((name) => <option key={name} value={name}>{name}</option>)}
                  </select>
                </label>
                <label>
                  Plan
                  <select value={tool.plan} onChange={(event) => updateTool(tool.id, { plan: event.target.value })}>
                    {pricingData[tool.tool].map((plan) => <option key={plan.name} value={plan.name}>{plan.name}</option>)}
                  </select>
                </label>
                <label>
                  Monthly spend
                  <input min="0" type="number" value={tool.monthlySpend} onChange={(event) => updateTool(tool.id, { monthlySpend: Number(event.target.value) })} />
                </label>
                <label>
                  Seats
                  <input min="1" type="number" value={tool.seats} onChange={(event) => updateTool(tool.id, { seats: Number(event.target.value) })} />
                </label>
                <button
                  className="icon-button"
                  type="button"
                  aria-label={`Remove ${tool.tool}`}
                  disabled={input.tools.length === 1}
                  onClick={() => setInput((current) => ({ ...current, tools: current.tools.filter((item) => item.id !== tool.id) }))}
                >
                  x
                </button>
              </div>
            ))}
          </div>

          {error ? <p className="error">{error}</p> : null}
          <button className="primary-button" type="submit" disabled={loading}>{loading ? "Auditing..." : "Run free audit"}</button>
        </form>

        {audit ? <ResultsView audit={audit} /> : null}
      </section>
    </main>
  );
}
