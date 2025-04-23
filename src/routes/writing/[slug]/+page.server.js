import { error } from '@sveltejs/kit';
import { supabase } from '$lib/supabase';

// Helper function to generate UUID
function generateUUID() {
  return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function(c) {
    const r = Math.random() * 16 | 0;
    const v = c === 'x' ? r : (r & 0x3 | 0x8);
    return v.toString(16);
  });
}

export async function load({ params }) {
  const { slug } = params;
  
  console.log(`Loading essay with slug: ${slug} (server-side)`);
  
  try {
    // Fetch the essay data INCLUDING content from Supabase
    const { data: essay, error: essayError } = await supabase
      .from('essays')
      .select(`
        id, title, description, date, published, excerpt, slug,
        like_count, share_count, view_count, content
      `)
      .eq('slug', slug)
      .single();
    
    // If there's an error fetching from Supabase
    if (essayError) {
      console.warn(`Error fetching essay from Supabase: ${essayError.message}`);
      
      if (essayError.code === 'PGRST116') {
        throw error(404, `No essay found with slug: ${slug}`);
      }
    }
    
    // If no essay was found
    if (!essay) {
      throw error(404, `No essay found with slug: ${slug}`);
    }
    
    // Extract content from the essay data
    const content = essay.content || null;
    
    // Log content status
    if (content) {
      console.log(`Content loaded for ${slug}, length: ${content.length} chars`);
    } else {
      console.warn(`No content found for essay ${slug}`);
    }
    
    // Check if essay is published unless in dev mode
    if (essay.published === false && process.env.NODE_ENV !== 'development') {
      throw error(404, 'This essay is not yet published');
    }
    
    // Return both the essay metadata and the content
    return {
      essay,
      content
    };
  } catch (err) {
    // Provide more helpful error details
    console.error(`Error in load function: ${err instanceof Error ? err.message : String(err)}`);
    if (err instanceof Error) {
      console.error(err.stack);
    }
    
    if (err && typeof err === 'object' && 'status' in err && 'body' in err) {
      // This is already a SvelteKit error, just rethrow it
      throw err;
    }
    
    console.error('Error occurred, but returning partial data to avoid 500 error');
    
    // Create a mock essay as a fallback
    const mockEssay = {
      id: generateUUID(),
      slug,
      title: slug,
      description: "Error loading essay. Please try again.",
      date: new Date().toISOString().split('T')[0],
      published: true,
      excerpt: "There was an error loading this essay. Please try refreshing the page or navigating back to the writing page.",
      like_count: 0,
      share_count: 0,
      view_count: 0
    };
    
    return {
      essay: mockEssay,
      content: null,
      error: err instanceof Error ? err.message : 'Unknown error occurred'
    };
  }
}