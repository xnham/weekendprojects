import { supabase } from '../supabase';

// Load a specific essay by slug
export async function loadEssay(slug) {
  try {
    // Fetch the essay metadata from Supabase
    const { data: essay, error: essayError } = await supabase
      .from('essays')
      .select('*')
      .eq('slug', slug)
      .single();
    
    if (essayError) {
      throw new Error(`Error fetching essay: ${essayError.message}`);
    }
    
    if (!essay) {
      throw new Error('Essay not found');
    }
    
    // For now, return just the metadata
    // In a real implementation, you'd also load the content
    return {
      essay,
      content: null
    };
  } catch (err) {
    console.error('Error loading essay:', err);
    return {
      error: err.message
    };
  }
}

// Load all published essays
export async function loadEssays() {
  try {
    const { data: essays, error } = await supabase
      .from('essays')
      .select('*')
      .eq('published', true)
      .order('date', { ascending: false });
    
    if (error) {
      throw new Error(`Error fetching essays: ${error.message}`);
    }
    
    return essays || [];
  } catch (err) {
    console.error('Error loading essays:', err);
    return [];
  }
}

// Define the essay metadata type for TypeScript/JSDoc
/**
 * @typedef {Object} EssayMetadata
 * @property {string} id - Unique identifier
 * @property {string} slug - URL slug
 * @property {string} title - Essay title
 * @property {string} description - Short description
 * @property {string} [excerpt] - Optional excerpt
 * @property {string} date - Publication date
 * @property {boolean} published - Whether essay is published
 */ 