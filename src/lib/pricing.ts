import type { ToolName } from "./types";

export type PlanPrice = {
  name: string;
  monthlyPerSeat?: number;
  monthlyFlat?: number;
  custom?: boolean;
  source: string;
};

export const pricingData: Record<ToolName, PlanPrice[]> = {
  Cursor: [
    { name: "Hobby", monthlyFlat: 0, source: "https://cursor.com/pricing" },
    { name: "Pro", monthlyPerSeat: 20, source: "https://cursor.com/pricing" },
    { name: "Business", monthlyPerSeat: 40, source: "https://cursor.com/pricing" },
    { name: "Enterprise", custom: true, source: "https://cursor.com/pricing" }
  ],
  "GitHub Copilot": [
    { name: "Individual", monthlyPerSeat: 10, source: "https://github.com/features/copilot/plans" },
    { name: "Business", monthlyPerSeat: 19, source: "https://github.com/features/copilot/plans" },
    { name: "Enterprise", monthlyPerSeat: 39, source: "https://github.com/features/copilot/plans" }
  ],
  Claude: [
    { name: "Free", monthlyFlat: 0, source: "https://www.anthropic.com/pricing" },
    { name: "Pro", monthlyPerSeat: 20, source: "https://www.anthropic.com/pricing" },
    { name: "Max", monthlyPerSeat: 100, source: "https://www.anthropic.com/pricing" },
    { name: "Team", monthlyPerSeat: 30, source: "https://www.anthropic.com/pricing" },
    { name: "Enterprise", custom: true, source: "https://www.anthropic.com/pricing" },
    { name: "API direct", custom: true, source: "https://docs.anthropic.com/en/docs/about-claude/pricing" }
  ],
  ChatGPT: [
    { name: "Plus", monthlyPerSeat: 20, source: "https://openai.com/chatgpt/pricing" },
    { name: "Team", monthlyPerSeat: 30, source: "https://openai.com/chatgpt/pricing" },
    { name: "Enterprise", custom: true, source: "https://openai.com/chatgpt/pricing" },
    { name: "API direct", custom: true, source: "https://openai.com/api/pricing/" }
  ],
  "Anthropic API": [
    { name: "API direct", custom: true, source: "https://docs.anthropic.com/en/docs/about-claude/pricing" }
  ],
  "OpenAI API": [
    { name: "API direct", custom: true, source: "https://openai.com/api/pricing/" }
  ],
  Gemini: [
    { name: "Pro", monthlyPerSeat: 19.99, source: "https://one.google.com/about/google-ai-plans/" },
    { name: "Ultra", monthlyPerSeat: 249.99, source: "https://one.google.com/about/google-ai-plans/" },
    { name: "API", custom: true, source: "https://ai.google.dev/gemini-api/docs/pricing" }
  ],
  v0: [
    { name: "Free", monthlyFlat: 0, source: "https://v0.dev/docs/pricing" },
    { name: "Premium", monthlyPerSeat: 20, source: "https://v0.dev/docs/pricing" },
    { name: "Team", monthlyPerSeat: 30, source: "https://v0.dev/docs/pricing" },
    { name: "Business", monthlyPerSeat: 100, source: "https://v0.dev/docs/pricing" },
    { name: "Enterprise", custom: true, source: "https://v0.dev/docs/pricing" }
  ]
};

export function planCost(tool: ToolName, planName: string, seats: number): number | null {
  const plan = pricingData[tool].find((item) => item.name.toLowerCase() === planName.toLowerCase());
  if (!plan || plan.custom) return null;
  return Math.round(((plan.monthlyFlat ?? 0) + (plan.monthlyPerSeat ?? 0) * seats) * 100) / 100;
}

export function cheapestSameVendorPlan(tool: ToolName, seats: number, allowTeam = false): PlanPrice | undefined {
  return pricingData[tool]
    .filter((plan) => !plan.custom)
    .filter((plan) => (plan.monthlyFlat ?? 0) + (plan.monthlyPerSeat ?? 0) > 0)
    .filter((plan) => allowTeam || !["Team", "Business", "Enterprise"].includes(plan.name))
    .sort((a, b) => planValue(a, seats) - planValue(b, seats))[0];
}

function planValue(plan: PlanPrice, seats: number): number {
  return (plan.monthlyFlat ?? 0) + (plan.monthlyPerSeat ?? 0) * seats;
}
