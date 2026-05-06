const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3000";

export const appConfig = {
  appName: "FoodRadar",
  siteUrl,
  supabaseUrl: process.env.NEXT_PUBLIC_SUPABASE_URL || "",
  supabaseAnonKey: process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || "",
};

export function getMissingPublicConfig() {
  return [
    ["NEXT_PUBLIC_SUPABASE_URL", appConfig.supabaseUrl],
    ["NEXT_PUBLIC_SUPABASE_ANON_KEY", appConfig.supabaseAnonKey],
  ]
    .filter(([, value]) => !value)
    .map(([key]) => key);
}

export function assertSupabaseConfigured() {
  const missing = [
    ["NEXT_PUBLIC_SUPABASE_URL", appConfig.supabaseUrl],
    ["NEXT_PUBLIC_SUPABASE_ANON_KEY", appConfig.supabaseAnonKey],
  ]
    .filter(([, value]) => !value)
    .map(([key]) => key);

  if (missing.length > 0) {
    throw new Error(`Missing Supabase environment variables: ${missing.join(", ")}`);
  }
}
