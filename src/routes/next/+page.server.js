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
  console.log('Server-side loading future projects for prerendering...');
  
  try {
    // Fetch future projects from Supabase
    const { data: projects, error: projectsError } = await supabase
      .from('projects')
      .select('*')
      .eq('status', 'future')
      .eq('show', true)
      .order('order', { ascending: true });
    
    if (projectsError) {
      console.error('Error fetching future projects:', projectsError);
      return { 
        futureProjects: [],
        error: 'Failed to load future projects during prerendering'
      };
    }
    
    console.log(`Successfully preloaded ${projects.length} future projects`);
    
    return {
      futureProjects: projects
    };
  } catch (error) {
    console.error('Server-side error loading future projects:', error);
    return {
      futureProjects: [],
      error: 'Unexpected error during prerendering'
    };
  }
} 