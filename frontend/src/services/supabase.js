import { createClient } from "@supabase/supabase-js";

const supabaseUrl = process.env.REACT_APP_SUPABASE_URL;
const supabaseKey = process.env.REACT_APP_SUPABASE_PUBLISHABLE_KEY;

if (!supabaseUrl || !supabaseKey) {
  // Keep startup errors obvious in development when env vars are missing.
  console.warn("Supabase environment variables are missing. Customer auth and booking flows will not work.");
}

export const supabase = createClient(supabaseUrl || "https://example.supabase.co", supabaseKey || "missing-key", {
  auth: {
    autoRefreshToken: true,
    persistSession: true,
    detectSessionInUrl: true,
  },
});
