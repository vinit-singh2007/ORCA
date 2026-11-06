/**
 * Shared Supabase Browser Client
 * 
 * Sourced directly from ORCA Frontend Handoff §5:
 * - Uses NEXT_PUBLIC_SUPABASE_URL and NEXT_PUBLIC_SUPABASE_ANON_KEY.
 * - Single shared instance for browser auth and session management.
 * - Handles email/password sign-in, token refresh, and auth state changes.
 */

import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://wnnubxknncfbxlsudaec.supabase.co';
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6IndubnVieGtubmNmYnhsc3VkYWVjIiwicm9sZSI6ImFub24iLCJpYXQiOjE3OTM5NTEzODAsImV4cCI6MjEwOTUyNzM4MH0.JZkgS-FwOpIA8BoAyR3OcXr3CBn2Mt0rA1gsBI1UYS4';

export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    persistSession: true,
    autoRefreshToken: true,
    detectSessionInUrl: true,
  },
});

