import { NextResponse } from "next/server";
import { hasSupabase, siteUrl } from "@/lib/server/env";

export async function GET() {
  return NextResponse.json({
    ok: true,
    siteUrl,
    integrations: {
      supabase: hasSupabase(),
      resend: Boolean(process.env.RESEND_API_KEY),
      anthropic: Boolean(process.env.ANTHROPIC_API_KEY)
    }
  });
}
