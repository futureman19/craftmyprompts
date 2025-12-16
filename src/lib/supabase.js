import { createClient } from '@supabase/supabase-js';

// 1. Configuration
// Replace these placeholders with the values from your Supabase Dashboard
// Settings -> API -> Project URL / anon public key
const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || "https://mozqwjygjkucjcllbyul.supabase.co";
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY || "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im1venF3anlnamt1Y2pjbGxieXVsIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjU4NjA3MjYsImV4cCI6MjA4MTQzNjcyNn0.79d9-y_t-1LRhM5FGv6v9jjbiWNN88GSb43CF2UfuG0";

// 2. Initialize the Client
// This client handles data fetching, real-time subscriptions, and authentication automatically.
export const supabase = createClient(supabaseUrl, supabaseAnonKey);