import { supabase } from '../supabase';

// Define the essay metadata type
export interface EssayMetadata {
  id: string;
  slug: string;
  title: string;
  description: string;
  excerpt?: string;
  date: string;
  published: boolean;
  like_count?: number;
  share_count?: number;
  view_count?: number;
}

interface EssayLoadResult {
  essay: EssayMetadata | null;
  content: any;
  error?: string;
}

// Load a specific essay by slug
export async function loadEssay(slug: string): Promise<EssayLoadResult> {
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
    
    // Try to dynamically import the essay content
    let content = null;
    try {
      // In SvelteKit, we need to use a different approach to import markdown
      // This will depend on your setup and how you're storing/retrieving essay content
      content = { default: null }; // Placeholder - replace with actual content loading
    } catch (contentError) {
      console.error('Error loading essay content:', contentError);
    }
    
    return {
      essay,
      content
    };
  } catch (err: unknown) {
    console.error('Error loading essay:', err);
    return {
      essay: null,
      content: null,
      error: err instanceof Error ? err.message : 'Unknown error occurred'
    };
  }
}

// Load all published essays
export async function loadEssays(): Promise<EssayMetadata[]> {
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
  } catch (err: unknown) {
    console.error('Error loading essays:', err);
    return [];
  }
}

// Add additional functions from old essays.ts as needed

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