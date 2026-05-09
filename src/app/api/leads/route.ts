import { NextRequest, NextResponse } from "next/server";
import { sendLeadEmail } from "@/lib/server/email";
import { enforceRateLimit, getPublicAudit, saveLead } from "@/lib/server/store";
import { parseLeadInput } from "@/lib/validation";

export async function POST(request: NextRequest) {
  try {
    const ip = request.headers.get("x-forwarded-for") ?? "local";
    const allowed = await enforceRateLimit(`lead:${ip}`, 5);
    if (!allowed) return NextResponse.json({ error: "Too many signups. Try again later." }, { status: 429 });

    const lead = parseLeadInput(await request.json());
    const audit = await getPublicAudit(lead.auditId);
    if (!audit) return NextResponse.json({ error: "Audit not found." }, { status: 404 });

    await saveLead(lead);
    await sendLeadEmail(lead, audit);

    return NextResponse.json({ ok: true });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Could not save lead.";
    return NextResponse.json({ error: message }, { status: 400 });
  }
}
