import { describe, it } from "node:test";
import assert from "node:assert/strict";
import { fallbackSummary } from "./auditEngine";

describe("fallbackSummary", () => {
  it("produces a useful healthy-stack fallback", () => {
    const summary = fallbackSummary({
      totalMonthlySavings: 20,
      toolCount: 1,
      useCase: "writing",
      credexQualified: false
    });

    assert.match(summary, /spending well|disciplined/);
  });
});
