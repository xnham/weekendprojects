import { supabase } from '../lib/supabase';

export interface EssayMetadata {
  id?: string;
  title: string;
  description: string;
  date: string;
  published?: boolean;
  slug: string;
  excerpt?: string;
  like_count?: number;
  share_count?: number;
  view_count?: number;
}

interface EssayLoadResult {
  content: any;
  metadata: EssayMetadata | null;
  error: string | null;
}

// Add this interface to define the shape of imported markdown files
interface MarkdownModule {
  default: any;
  metadata?: {
    title?: string;
    description?: string;
    date?: string;
    published?: boolean;
    excerpt?: string;
  };
}

/**
 * Load an essay by slug
 * @param {string} slug - The essay slug
 */
export async function loadEssay(slug: string): Promise<EssayLoadResult> {
  try {
    // First fetch the metadata from Supabase
    const { data: essay, error } = await supabase
      .from('essays')
      .select(`
        id, title, description, date, published, excerpt, slug,
        like_count, share_count, view_count
      `)
      .eq('slug', slug)
      .single();
    
    if (error) throw error;
    
    // Then load the markdown content
    const post = await import(`../content/essays/${slug}.md`) as MarkdownModule;
    
    // Create the metadata object
    const essayMetadata: EssayMetadata = {
      id: essay.id,
      title: essay.title,
      description: essay.description,
      date: essay.date,
      slug: essay.slug,
      published: essay.published,
      excerpt: essay.excerpt || undefined,
      like_count: essay.like_count,
      share_count: essay.share_count,
      view_count: essay.view_count
    };
    
    // Increment view count
    incrementViewCount(essay.id);
    
    return {
      content: post.default,
      metadata: essayMetadata,
      error: null
    };
  } catch (e) {
    console.error(`Could not find essay ${slug}`, e);
    return { 
      content: null,
      metadata: null,
      error: `Could not find essay ${slug}`
    };
  }
}

/**
 * Get all available essays
 */
export async function getAllEssays(): Promise<EssayMetadata[]> {
  try {
    // Fetch all published essays from Supabase
    const { data: essays, error } = await supabase
      .from('essays')
      .select(`
        id, title, description, date, published, excerpt, slug,
        like_count, share_count, view_count
      `)
      .eq('published', true)
      .order('date', { ascending: false });
    
    if (error) throw error;
    
    // Process the essays
    return essays.map(essay => {
      return {
        id: essay.id,
        title: essay.title,
        description: essay.description,
        date: essay.date,
        slug: essay.slug,
        published: essay.published,
        excerpt: essay.excerpt || undefined,
        like_count: essay.like_count,
        share_count: essay.share_count,
        view_count: essay.view_count
      };
    });
  } catch (error) {
    console.error("Error loading essays:", error);
    return [];
  }
}

// Increment view count for an essay
async function incrementViewCount(essayId: string) {
  try {
    await supabase.rpc('increment_view_count', { essay_id: essayId });
  } catch (error) {
    console.error("Error incrementing view count:", error);
  }
}

// Sync essays from markdown files to Supabase
export async function syncEssaysToSupabase() {
  try {
    // Import all markdown files from the essays directory
    const essayFiles = import.meta.glob('../content/essays/*.md');
    let updatedCount = 0;
    let insertedCount = 0;
    
    for (const [path, loader] of Object.entries(essayFiles)) {
      // Extract slug from path
      const slug = path.split('/').pop()?.replace('.md', '') || '';
      
      // Load the markdown file
      const post = await loader() as MarkdownModule;
      const metadata = post.metadata || {};
      
      // Check if essay already exists in Supabase
      const { data: existingEssay } = await supabase
        .from('essays')
        .select('id, slug, like_count, share_count, view_count, created_at')
        .eq('slug', slug)
        .single();
      
      // Get excerpt
      const excerpt = metadata.excerpt || null;
      
      // Convert content to string to extract a default excerpt if none exists
      let defaultExcerpt = null;
      if (!excerpt) {
        const content = typeof post.default === 'string' 
          ? post.default 
          : (post.default.render ? post.default.render() : '');
          
        if (content) {
          defaultExcerpt = content.toString()
            .replace(/<[^>]*>/g, '')  // Remove HTML tags
            .replace(/\s+/g, ' ')     // Normalize whitespace
            .slice(0, 150);           // Take first 150 chars
            
          if (content.length > 150) defaultExcerpt += '...';
        }
      }
      
      const now = new Date().toISOString();
      
      // Prepare essay data
      const essayData = {
        title: metadata.title || slug,
        description: metadata.description || "",
        date: metadata.date || now.split('T')[0],
        published: metadata.published !== undefined ? metadata.published : false,
        excerpt: excerpt || defaultExcerpt,
        slug,
        updated_at: now
      };
      
      if (existingEssay) {
        // Update existing essay, preserve interaction counts and creation date
        const { error } = await supabase
          .from('essays')
          .update({
            ...essayData,
            like_count: existingEssay.like_count,
            share_count: existingEssay.share_count,
            view_count: existingEssay.view_count
            // created_at is managed by Supabase and shouldn't be updated
          })
          .eq('id', existingEssay.id);
          
        if (error) {
          console.error(`Error updating essay ${slug}:`, error);
        } else {
          console.log(`Updated essay: ${slug}`);
          updatedCount++;
        }
      } else {
        // Insert new essay with default counts
        const { error } = await supabase
          .from('essays')
          .insert({
            ...essayData,
            id: crypto.randomUUID(), // Generate a UUID for new essays
            like_count: 0,
            share_count: 0,
            view_count: 0
            // created_at and updated_at will be set automatically by Supabase
          });
          
        if (error) {
          console.error(`Error inserting essay ${slug}:`, error);
        } else {
          console.log(`Inserted new essay: ${slug}`);
          insertedCount++;
        }
      }
    }
    
    console.log(`Essays synced to Supabase! Updated: ${updatedCount}, Inserted: ${insertedCount}`);
    return { success: true, updated: updatedCount, inserted: insertedCount };
  } catch (error) {
    console.error('Error syncing essays to Supabase:', error);
    return { success: false, error };
  }
}
