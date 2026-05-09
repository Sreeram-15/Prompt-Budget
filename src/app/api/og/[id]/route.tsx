import { ImageResponse } from "next/og";
import { getPublicAudit } from "@/lib/server/store";

export const runtime = "edge";

export async function GET(_: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const audit = await getPublicAudit(id);
  const savings = audit ? `$${audit.totalMonthlySavings.toLocaleString()}/mo` : "AI Spend Audit";

  return new ImageResponse(
    (
      <div
        style={{
          alignItems: "center",
          background: "#f7f4ed",
          color: "#1f2a24",
          display: "flex",
          flexDirection: "column",
          height: "100%",
          justifyContent: "center",
          padding: 72,
          width: "100%"
        }}
      >
        <div style={{ fontSize: 28, letterSpacing: 2, textTransform: "uppercase" }}>SpendScope</div>
        <div style={{ fontSize: 92, fontWeight: 800, marginTop: 32 }}>{savings}</div>
        <div style={{ color: "#5a665f", fontSize: 38, marginTop: 20 }}>Potential AI spend savings</div>
      </div>
    ),
    { width: 1200, height: 630 }
  );
}
