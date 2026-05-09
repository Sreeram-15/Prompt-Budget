import { NextResponse } from "next/server";
import { runAudit } from "@/lib/auditEngine";
import { generateSummary } from "@/lib/server/summary";
import { parseAuditInput } from "@/lib/validation";

export async function POST(request: Request) {
  try {
    const audit = runAudit(parseAuditInput(await request.json()));
    const summary = await generateSummary(audit);
    return NextResponse.json({ summary });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Could not generate summary.";
    return NextResponse.json({ error: message }, { status: 400 });
  }
}
