export const tools = [
  "Cursor",
  "GitHub Copilot",
  "Claude",
  "ChatGPT",
  "Anthropic API",
  "OpenAI API",
  "Gemini",
  "v0"
] as const;

export type ToolName = (typeof tools)[number];

export const useCases = ["coding", "writing", "data", "research", "mixed"] as const;

export type UseCase = (typeof useCases)[number];

export type ToolInput = {
  id: string;
  tool: ToolName;
  plan: string;
  monthlySpend: number;
  seats: number;
};

export type AuditInput = {
  teamSize: number;
  useCase: UseCase;
  tools: ToolInput[];
};

export type RecommendationAction =
  | "keep"
  | "downgrade"
  | "consolidate"
  | "switch"
  | "credits";

export type ToolAuditResult = {
  id: string;
  tool: ToolName;
  plan: string;
  currentSpend: number;
  recommendedAction: RecommendationAction;
  recommendedSpend: number;
  monthlySavings: number;
  annualSavings: number;
  reason: string;
  confidence: "high" | "medium" | "low";
};

export type AuditResult = {
  id?: string;
  createdAt?: string;
  input: AuditInput;
  results: ToolAuditResult[];
  totalMonthlySpend: number;
  totalMonthlySavings: number;
  totalAnnualSavings: number;
  status: "optimize" | "healthy";
  credexQualified: boolean;
  summary: string;
};

export type LeadInput = {
  auditId: string;
  email: string;
  companyName?: string;
  role?: string;
  teamSize?: number;
  website?: string;
};
