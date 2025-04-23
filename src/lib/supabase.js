import { createClient } from '@supabase/supabase-js';
import { browser } from '$app/environment';

// In SvelteKit, we need to properly handle client-side environment variables
const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

// Debugging environment variables for client-side
if (browser) {
  console.log('Browser environment detected');
  console.log('Supabase URL available:', !!supabaseUrl);
  console.log('Supabase Anon Key available:', !!supabaseAnonKey);
}

// Check if environment variables are available
if (!supabaseUrl || !supabaseAnonKey) {
  console.warn('Supabase environment variables are missing. Using fallback values for development.');
}

// Create and export the Supabase client - using actual env variable from .env
export const supabase = createClient(
  supabaseUrl || 'https://hazfuihckyddmtfvruud.supabase.co',
  supabaseAnonKey || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImhhemZ1aWhja3lkZG10ZnZydXVkIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDM2MzIxMDMsImV4cCI6MjA1OTIwODEwM30.YL338Bdt7aXzbWgmIjk5X7mNbPysnSREEYhrJoSYVXc'
);
