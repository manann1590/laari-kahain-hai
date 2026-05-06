import "server-only";
import { createClient } from "@supabase/supabase-js";
import { appConfig, assertSupabaseConfigured } from "@/lib/config";
import { assertAdminConfigured, serverConfig } from "@/lib/server-config";

export function createServerSupabaseClient() {
  assertSupabaseConfigured();
  return createClient(appConfig.supabaseUrl, appConfig.supabaseAnonKey, {
    auth: {
      persistSession: false,
    },
  });
}

export function createAdminSupabaseClient() {
  assertAdminConfigured();
  return createClient(appConfig.supabaseUrl, serverConfig.supabaseServiceRoleKey, {
    auth: {
      persistSession: false,
      autoRefreshToken: false,
    },
  });
}
