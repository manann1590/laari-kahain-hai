import "server-only";

export const serverConfig = {
  supabaseServiceRoleKey: process.env.SUPABASE_SERVICE_ROLE_KEY || "",
  adminEmail: process.env.ADMIN_EMAIL || "",
  adminPassword: process.env.ADMIN_PASSWORD || "",
};

export function assertAdminConfigured() {
  const missing = [
    ["ADMIN_EMAIL", serverConfig.adminEmail],
    ["ADMIN_PASSWORD", serverConfig.adminPassword],
    ["SUPABASE_SERVICE_ROLE_KEY", serverConfig.supabaseServiceRoleKey],
  ]
    .filter(([, value]) => !value)
    .map(([key]) => key);

  if (missing.length > 0) {
    throw new Error(`Missing admin environment variables: ${missing.join(", ")}`);
  }
}
