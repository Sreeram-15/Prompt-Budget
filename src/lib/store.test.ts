import { describe, it } from "node:test";
import assert from "node:assert/strict";
import { runAudit } from "./auditEngine";
import { getPublicAudit, saveAudit } from "./server/store";

describe("public audit fallback storage", () => {
  it("saves a shareable public audit without Supabase credentials", async () => {
    const saved = await saveAudit(runAudit({
      teamSize: 2,
      useCase: "coding",
      tools: [{ id: "cursor", tool: "Cursor", plan: "Business", monthlySpend: 80, seats: 2 }]
    }));

    assert.ok(saved.id?.startsWith("r_"));
    assert.ok(saved.id);

    const publicAudit = await getPublicAudit(saved.id);
    assert.equal(publicAudit?.totalMonthlySavings, 40);
    assert.equal(publicAudit?.input.tools[0].tool, "Cursor");
  });
});
