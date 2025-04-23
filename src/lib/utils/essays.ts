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
    
    // Check in the static directory first
    const staticPath = path.resolve(process.cwd(), 'static', 'content', 'essays', `${slug}.md`);
    console.log(`Checking if file exists at static path: ${staticPath}`);
    
    if (fs.existsSync(staticPath)) {
      console.log(`File exists at static path: ${staticPath}`);
      // Try to read the file content
      try {
        const content = fs.readFileSync(staticPath, 'utf-8');
        console.log(`File content from static path: ${content.substring(0, 100)}...`);
      } catch (readError) {
        console.error(`Error reading file from static path: ${readError}`);
      }
    } else {
      console.log(`File does NOT exist at static path: ${staticPath}`);
      
      // We've removed the files from src/content, so just log this
      console.log(`Note: Files have been moved from src/content/essays to static/content/essays`);
      console.log(`All essays should be loaded from static/content/essays`);
      
      // Check static path again for confirmation
      if (!fs.existsSync(staticPath)) {
        console.error(`ERROR: Essay ${slug} is missing from static/content/essays`);
      }
    }
  } catch (fsError) {
    console.error(`Error checking file: ${fsError}`);
  }
  // END DEBUG
  
  try {
    console.log(`Trying to load markdown for ${slug}`);
    
    // Check if we're in the browser or on the server
    const isBrowser = typeof window !== 'undefined';
    
    if (isBrowser) {
      // In the browser, use fetch to get the content
      try {
        console.log(`Browser detected, using fetch for ${slug}`);
        const response = await fetch(`/content/essays/${slug}.md`);
        
        if (!response.ok) {
          throw new Error(`HTTP error ${response.status}: ${response.statusText}`);
        }
        
        const text = await response.text();
        console.log(`Successfully fetched markdown for ${slug}, length: ${text.length}`);
        
        // Parse markdown with gray-matter if available
        try {
          const matter = await import('gray-matter');
          const { data, content } = matter.default(text);
          
          mdContent = {
            default: content,
            metadata: data
          };
        } catch (matterError) {
          // Fall back to plain text if gray-matter not available
          mdContent = {
            default: text,
            metadata: {}
          };
        }
      } catch (fetchError) {
        mdError = fetchError;
        console.error(`Failed to fetch markdown for ${slug}:`, fetchError);
        throw fetchError;
      }
    } else {
      // On the server, use fs to read the file directly
      try {
        console.log(`Server detected, using fs for ${slug}`);
        const fs = await import('fs');
        const path = await import('path');
        const matter = await import('gray-matter');
        
        const staticPath = path.resolve(process.cwd(), 'static', 'content', 'essays', `${slug}.md`);
        console.log(`Looking for file at: ${staticPath}`);
        
        if (!fs.existsSync(staticPath)) {
          throw new Error(`File not found: ${staticPath}`);
        }
        
        const text = fs.readFileSync(staticPath, 'utf-8');
        console.log(`Successfully read markdown for ${slug}, length: ${text.length}`);
        
        const { data, content } = matter.default(text);
        
        mdContent = {
          default: content,
          metadata: data
        };
      } catch (fsError) {
        mdError = fsError;
        console.error(`Failed to read markdown for ${slug}:`, fsError);
        throw fsError;
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
    // Import all markdown files from the static essays directory
    const essayFiles = import.meta.glob('../../../static/content/essays/*.md');
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