import { createClient } from '@supabase/supabase-js';

// Retrieve Supabase URL and Anon Key from environment variables.
// Users must configure these in their environment or .env file.
const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || '';
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY || '';

if (!supabaseUrl || !supabaseAnonKey) {
  console.warn(
    'Supabase credentials are not set. Please ensure VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY are in your environment.'
  );
}

export const supabase = createClient(
  supabaseUrl || 'https://placeholder.supabase.co',
  supabaseAnonKey || 'placeholder-key'
);
