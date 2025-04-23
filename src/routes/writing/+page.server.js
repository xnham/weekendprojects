import { createClient } from '@supabase/supabase-js';

// Server-side Supabase client for build-time data fetching
const supabaseUrl = process.env.VITE_SUPABASE_URL || 'https://hazfuihckyddmtfvruud.supabase.co';
const supabaseAnonKey = process.env.VITE_SUPABASE_ANON_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImhhemZ1aWhja3lkZG10ZnZydXVkIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDM2MzIxMDMsImV4cCI6MjA1OTIwODEwM30.YL338Bdt7aXzbWgmIjk5X7mNbPysnSREEYhrJoSYVXc';

// Use a server-side version of the client
const supabase = createClient(supabaseUrl, supabaseAnonKey);

// Force server-side rendering and prerendering for this route
export const ssr = true;
export const prerender = true;

/** @type {import('./$types').PageServerLoad} */
export async function load() {
  console.log('Server-side loading essays for prerendering...');
  
  try {
    // Fetch essays from Supabase
    const { data: essays, error: fetchError } = await supabase
      .from('essays')
      .select(`
        id, title, description, date, published, excerpt, slug,
        like_count, share_count, view_count
      `)
      .eq('published', true)
      .order('date', { ascending: false });
    
    if (fetchError) {
      console.error('Error fetching essays:', fetchError);
      return { 
        essays: [],
        error: 'Failed to load essays during prerendering'
      };
    }
    
    console.log(`Successfully preloaded ${essays.length} essays`);
    
    return {
      essays
    };
  } catch (error) {
    console.error('Server-side error loading essays:', error);
    return {
      essays: [],
      error: 'Unexpected error during prerendering'
    };
  }
} 