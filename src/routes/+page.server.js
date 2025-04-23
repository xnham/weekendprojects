import { createClient } from '@supabase/supabase-js';

// Server-side Supabase client for build-time data fetching
const supabaseUrl = process.env.VITE_SUPABASE_URL || 'https://hazfuihckyddmtfvruud.supabase.co';
const supabaseAnonKey = process.env.VITE_SUPABASE_ANON_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImhhemZ1aWhja3lkZG10ZnZydXVkIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDM2MzIxMDMsImV4cCI6MjA1OTIwODEwM30.YL338Bdt7aXzbWgmIjk5X7mNbPysnSREEYhrJoSYVXc';

// Use a server-side version of the client
const supabase = createClient(supabaseUrl, supabaseAnonKey);

/** @type {import('./$types').PageServerLoad} */
export async function load() {
  console.log('Server-side loading projects for prerendering...');
  
  try {
    // Fetch completed projects from Supabase
    const { data: projects, error: projectsError } = await supabase
      .from('projects')
      .select('*')
      .eq('status', 'completed')
      .eq('show', true)
      .order('order', { ascending: false });
    
    if (projectsError) {
      console.error('Error fetching projects:', projectsError);
      return { 
        projects: [],
        error: 'Failed to load projects during prerendering'
      };
    }
    
    // Process the projects data (similar to client-side processing)
    const processedProjects = projects.map(project => ({
      ...project,
      launchDate: project.launchDate ? new Date(project.launchDate).toISOString() : null,
      impact: typeof project.impact === 'string' ? project.impact === 'true' : Boolean(project.impact)
    }));
    
    console.log(`Successfully preloaded ${processedProjects.length} projects`);
    
    return {
      projects: processedProjects
    };
  } catch (error) {
    console.error('Server-side error loading projects:', error);
    return {
      projects: [],
      error: 'Unexpected error during prerendering'
    };
  }
} 