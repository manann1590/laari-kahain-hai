"use client";

import { createClient } from "@supabase/supabase-js";
import { appConfig } from "@/lib/config";

export function createBrowserSupabaseClient() {
  return createClient(appConfig.supabaseUrl, appConfig.supabaseAnonKey);
}
