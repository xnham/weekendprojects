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

// Interface to define the shape of imported markdown files
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

// Load a specific essay by slug
export async function loadEssay(slug: string): Promise<EssayLoadResult> {
  console.log(`Loading essay with slug: ${slug}`);
  console.log(`Current working directory: ${process.cwd()}`);
  
  // First try to load the markdown file to ensure it exists
  let mdContent = null;
  let mdError = null;
  
  // DEBUG
  try {
    const fs = await import('fs');
    const path = await import('path');
    const mdPath = path.join(process.cwd(), 'src', 'content', 'essays', `${slug}.md`);
    console.log(`Checking if file exists at path: ${mdPath}`);
    
    if (fs.existsSync(mdPath)) {
      console.log(`File exists at: ${mdPath}`);
      // Try to read the file content
      try {
        const content = fs.readFileSync(mdPath, 'utf-8');
        console.log(`File content: ${content.substring(0, 100)}...`);
      } catch (readError) {
        console.error(`Error reading file: ${readError}`);
      }
    } else {
      console.log(`File does NOT exist at: ${mdPath}`);
    }
  } catch (fsError) {
    console.error(`Error checking file: ${fsError}`);
  }
  // END DEBUG
  
  try {
    console.log(`Trying to load markdown for ${slug}`);
    // Use a try-catch block to load the markdown directly
    // Try both possible paths
    try {
      // First try the alias path (preferred)
      console.log(`Attempting to import using alias path: $content/essays/${slug}.md`);
      mdContent = await import(`$content/essays/${slug}.md`);
      console.log(`Markdown loaded successfully using alias path for ${slug}, content:`, mdContent);
    } catch (aliasError) {
      console.warn(`Failed to load using alias path for ${slug}:`, aliasError);
      console.warn(`Error name: ${aliasError.name}, message: ${aliasError.message}`);
      console.warn(`Falling back to relative path for ${slug}`);
      
      try {
        // Fall back to the relative path
        console.log(`Attempting to import using relative path: ../../content/essays/${slug}.md`);
        mdContent = await import(`../../content/essays/${slug}.md`);
        console.log(`Markdown loaded successfully using relative path for ${slug}, content:`, mdContent);
      } catch (relativeError) {
        // Keep track of this error
        mdError = relativeError;
        console.error(`Failed to load using relative path for ${slug}:`, relativeError);
        console.error(`Error name: ${relativeError.name}, message: ${relativeError.message}`);
        
        // Try one more approach for debugging
        try {
          console.log(`Attempting to import using absolute path...`);
          const dynamicImport = new Function('slug', 'return import("/Users/wendyham/Desktop/Everything/weekendprojects/src/content/essays/" + slug + ".md")');
          mdContent = await dynamicImport(slug);
          console.log(`Markdown loaded successfully using absolute path for ${slug}, content:`, mdContent);
        } catch (absoluteError) {
          console.error(`Failed to load using absolute path for ${slug}:`, absoluteError);
          throw relativeError;
        }
      }
    }
  } catch (error) {
    console.error(`Error loading markdown for ${slug}:`, error);
    console.error(`Error stack: ${error.stack}`);
    
    // If we can't find the markdown at all, we definitely can't show the essay
    return {
      essay: null,
      content: null,
      error: `Markdown not found for ${slug}. Ensure the file exists at src/content/essays/${slug}.md`
    };
  }
  
  try {
    // Now fetch the essay metadata from Supabase
    console.log(`Fetching essay data from Supabase for ${slug}`);
    const { data: essay, error: essayError } = await supabase
      .from('essays')
      .select(`
        id, title, description, date, published, excerpt, slug,
        like_count, share_count, view_count
      `)
      .eq('slug', slug)
      .single();
    
    if (essayError) {
      console.error(`Error fetching essay from Supabase: ${essayError.message}`);
      
      // For development mode: if essay not found in database but markdown exists,
      // create a mock essay object for testing
      if (import.meta.env.DEV) {
        console.log(`Creating mock essay for ${slug} since we're in dev mode`);
        
        // Extract metadata from the markdown module
        const metadata = mdContent.metadata || {};
        
        // Log useful diagnostics
        console.log('Metadata from markdown:', metadata);
        
        const mockEssay = {
          id: `mock-${slug}`,
          slug,
          title: metadata.title || slug,
          description: metadata.description || "No description available",
          date: metadata.date || new Date().toISOString().split('T')[0],
          published: metadata.published !== undefined ? metadata.published : true,
          excerpt: metadata.excerpt || "",
          like_count: 0,
          share_count: 0,
          view_count: 0
        };
        
        console.log('Created mock essay:', mockEssay);
        
        return {
          essay: mockEssay as EssayMetadata,
          content: mdContent
        };
      }
      
      // Provide a more helpful error message depending on the error code
      if (essayError.code === 'PGRST116') {
        throw new Error(`Essay "${slug}" not found in database. Run 'npm run sync-essays' to add it to Supabase.`);
      } else {
        throw new Error(`Error fetching essay from database: ${essayError.message}`);
      }
    }
    
    if (!essay) {
      throw new Error(`Essay not found in database: ${slug}`);
    }
    
    // We've already loaded the markdown content above, so use that
    console.log(`Successfully loaded essay and content for ${slug}`);
    return {
      essay,
      content: mdContent
    };
  } catch (err: unknown) {
    const errorMessage = err instanceof Error ? err.message : 'Unknown error occurred';
    console.error(`Error loading essay (${slug}):`, errorMessage);
    
    // Enhanced error diagnostics
    const diagnosticsMessage = mdError 
      ? `The markdown file could not be loaded. Check that it exists and has the correct format.`
      : `The markdown file was found but there was an error with the database or metadata.`;
      
    return {
      essay: null,
      content: mdContent, // Still return the markdown content if we have it
      error: `${errorMessage}\n\n${diagnosticsMessage}`
    };
  }
}

// Load all published essays
export async function loadEssays(): Promise<EssayMetadata[]> {
  try {
    const { data: essays, error } = await supabase
      .from('essays')
      .select(`
        id, title, description, date, published, excerpt, slug,
        like_count, share_count, view_count
      `)
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

// Sync essays from markdown files to Supabase
export async function syncEssaysToSupabase() {
  try {
    // Import all markdown files from the essays directory
    const essayFiles = import.meta.glob('../../content/essays/*.md');
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
          : (post.default?.render ? post.default.render() : '');
          
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