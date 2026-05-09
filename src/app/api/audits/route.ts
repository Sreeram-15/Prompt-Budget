import { NextRequest, NextResponse } from "next/server";
import { runAudit } from "@/lib/auditEngine";
import { generateSummary } from "@/lib/server/summary";
import { enforceRateLimit, saveAudit } from "@/lib/server/store";
import { parseAuditInput } from "@/lib/validation";

export async function POST(request: NextRequest) {
  try {
    const ip = request.headers.get("x-forwarded-for") ?? "local";
    const allowed = await enforceRateLimit(`audit:${ip}`, 10);
    if (!allowed) return NextResponse.json({ error: "Too many audits. Try again in a minute." }, { status: 429 });

    const input = parseAuditInput(await request.json());
    const audit = runAudit(input);
    const summary = await generateSummary(audit);
    const saved = await saveAudit({ ...audit, summary });

    return NextResponse.json(saved, { status: 201 });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Could not create audit.";
    return NextResponse.json({ error: message }, { status: 400 });
  }
}
