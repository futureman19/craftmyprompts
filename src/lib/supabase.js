import { createClient } from '@supabase/supabase-js';

// 1. Configuration
// We now strictly pull from Environment Variables.
// These must be set in your Vercel Dashboard (or .env.local for local dev).
const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

// 2. Safety Check (Fail Fast)
if (!supabaseUrl || !supabaseAnonKey) {
    console.error(
        "CRITICAL ERROR: Supabase environment variables are missing.\n" +
        "Please check your .env file or Vercel Project Settings.\n" +
        "Required: VITE_SUPABASE_URL, VITE_SUPABASE_ANON_KEY"
    );
}

// 3. Initialize the Client
export const supabase = createClient(
    supabaseUrl || "", // Fallback empty string prevents crash on build time, but runtime will fail if missing
    supabaseAnonKey || ""
);