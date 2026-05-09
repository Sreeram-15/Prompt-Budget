import { describe, it } from "node:test";
import assert from "node:assert/strict";
import { parseAuditInput, parseLeadInput } from "./validation";

describe("parseLeadInput", () => {
  it("rejects honeypot submissions", () => {
    assert.throws(() => parseLeadInput({
      auditId: "audit",
      email: "founder@example.com",
      website: "spam.example"
    }), /Spam/);
  });

  it("accepts a normal lead", () => {
    const lead = parseLeadInput({
      auditId: "audit",
      email: "Founder@Example.com",
      companyName: "Example AI",
      consultationRequested: true
    });

    assert.equal(lead.email, "founder@example.com");
    assert.equal(lead.consultationRequested, true);
  });
});

describe("parseAuditInput", () => {
  it("rejects invalid plan names for supported tools", () => {
    assert.throws(() => parseAuditInput({
      teamSize: 2,
      useCase: "coding",
      tools: [{ id: "bad", tool: "Cursor", plan: "Imaginary", monthlySpend: 20, seats: 1 }]
    }), /valid Cursor plan/);
  });
});
