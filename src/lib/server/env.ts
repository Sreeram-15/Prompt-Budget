export const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3000";

export function hasSupabase(): boolean {
  return Boolean(process.env.SUPABASE_URL && process.env.SUPABASE_SERVICE_ROLE_KEY);
}
