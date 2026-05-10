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

  it("rejects malformed email addresses", () => {
    assert.throws(() => parseLeadInput({
      auditId: "audit",
      email: "founder@example"
    }), /valid email/);
  });

  it("trims audit ids before saving leads", () => {
    const lead = parseLeadInput({
      auditId: " audit ",
      email: "founder@example.com"
    });

    assert.equal(lead.auditId, "audit");
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

  it("rejects fractional team size and seats", () => {
    assert.throws(() => parseAuditInput({
      teamSize: 2.5,
      useCase: "coding",
      tools: [{ id: "cursor", tool: "Cursor", plan: "Pro", monthlySpend: 20, seats: 1 }]
    }), /valid team size/);

    assert.throws(() => parseAuditInput({
      teamSize: 2,
      useCase: "coding",
      tools: [{ id: "cursor", tool: "Cursor", plan: "Pro", monthlySpend: 20, seats: 1.5 }]
    }), /valid seats/);
  });

  it("rounds monthly spend to cents", () => {
    const input = parseAuditInput({
      teamSize: 2,
      useCase: "coding",
      tools: [{ id: "cursor", tool: "Cursor", plan: "Pro", monthlySpend: 20.129, seats: 1 }]
    });

    assert.equal(input.tools[0].monthlySpend, 20.13);
  });

  it("limits audit payload size", () => {
    assert.throws(() => parseAuditInput({
      teamSize: 2,
      useCase: "coding",
      tools: Array.from({ length: 13 }, (_, index) => ({
        id: `cursor-${index}`,
        tool: "Cursor",
        plan: "Pro",
        monthlySpend: 20,
        seats: 1
      }))
    }), /no more than 12/);
  });
});
