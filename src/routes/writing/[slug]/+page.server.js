import { createClient } from '@supabase/supabase-js';
import { error } from '@sveltejs/kit';

// Server-side Supabase client for build-time data fetching
const supabaseUrl = process.env.VITE_SUPABASE_URL || 'https://hazfuihckyddmtfvruud.supabase.co';
const supabaseAnonKey = process.env.VITE_SUPABASE_ANON_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImhhemZ1aWhja3lkZG10ZnZydXVkIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDM2MzIxMDMsImV4cCI6MjA1OTIwODEwM30.YL338Bdt7aXzbWgmIjk5X7mNbPysnSREEYhrJoSYVXc';

// Use a server-side version of the client
const supabase = createClient(supabaseUrl, supabaseAnonKey);

// Force server-side rendering and prerendering for this route
export const ssr = true;
export const prerender = true;

/**
 * Generate all possible essay routes at build time
 * This is needed for prerendering dynamic routes
 */
export async function entries() {
  console.log('Generating entries for all essay slugs...');
  try {
    // Fetch all published essays to generate routes
    const { data: essays, error: fetchError } = await supabase
      .from('essays')
      .select('slug, title')
      .eq('published', true);
      
    if (fetchError) {
      console.error('Error fetching essay slugs for entries:', fetchError);
      return [];
    }
    
    console.log(`Generated ${essays.length} essay entries for prerendering:`);
    essays.forEach(essay => console.log(`- ${essay.slug}: ${essay.title}`));
    
    // Return an array of entry objects with the slug parameter
    return essays.map(essay => ({
      slug: essay.slug
    }));
  } catch (err) {
    console.error('Error generating essay entries:', err);
    return [];
  }
}

/** @type {import('./$types').PageServerLoad} */
export async function load({ params }) {
  console.log(`Server-side loading essay with slug: ${params.slug}`);
  
  try {
    // Fetch the specific essay by slug with all necessary data for rendering
    const { data: essay, error: essayError } = await supabase
      .from('essays')
      .select(`
        id, title, description, date, published, excerpt, slug, content,
        like_count, share_count, view_count
      `)
      .eq('slug', params.slug)
      .single();
    
    if (essayError) {
      console.error(`Error fetching essay with slug ${params.slug}:`, essayError);
      throw error(500, `Failed to load essay: ${essayError.message}`);
    }
    
    if (!essay) {
      console.error(`No essay found with slug: ${params.slug}`);
      throw error(404, 'Essay not found');
    }
    
    // Check if essay is published (except in development)
    if (essay.published === false && process.env.NODE_ENV !== 'development') {
      console.warn(`Attempted to access unpublished essay: ${params.slug}`);
      throw error(403, 'This essay is not yet published');
    }
    
    console.log(`Successfully preloaded essay: ${essay.title}`);
    
    // Add SEO-friendly metadata for this specific essay
    const currentPath = `/writing/${params.slug}`;
    
    return {
      essay,
      slug: params.slug,
      currentPath
    };
  } catch (err) {
    // If it's already a SvelteKit error, rethrow it
    if (err && typeof err === 'object' && 'status' in err && 'body' in err) {
      throw err;
    }
    
    // Otherwise create a generic error
    console.error(`Server-side error loading essay ${params.slug}:`, err);
    throw error(500, 'Unexpected error during prerendering');
  }
} 