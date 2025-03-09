export interface EssayMetadata {
  title: string;
  description: string;
  date: string;
  published?: boolean;
  image?: string;
  tags?: string[];
  slug: string;
  excerpt?: string;
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
    image?: string;
    tags?: string[];
    excerpt?: string;
  };
}

/**
 * Load an essay by slug
 * @param {string} slug - The essay slug
 */
export async function loadEssay(slug: string): Promise<EssayLoadResult> {
  try {
    const post = await import(`../content/essays/${slug}.md`) as MarkdownModule;
    
    // Extract metadata from frontmatter
    const metadata = post.metadata || {};
    
    // Start with required properties
    const essayMetadata: EssayMetadata = {
      title: metadata.title || "",
      description: metadata.description || "",
      date: metadata.date || "",
      slug
    };
    
    // Only add optional properties if they exist
    if (metadata.published !== undefined) essayMetadata.published = metadata.published;
    if (metadata.image) essayMetadata.image = metadata.image;
    if (metadata.tags) essayMetadata.tags = metadata.tags;
    if (metadata.excerpt) essayMetadata.excerpt = metadata.excerpt;
    
    return {
      content: post.default,
      metadata: essayMetadata,
      error: null
    };
  } catch (e) {
    console.error(`Could not find essay ${slug}`);
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
    // Import all markdown files from the essays directory
    const essayFiles = import.meta.glob('../content/essays/*.md');
    const essays = await Promise.all(
      Object.entries(essayFiles).map(async ([path, loader]) => {
        // Load the file
        const post = await loader() as MarkdownModule;
        
        // Extract slug from path
        const slug = path.split('/').pop()?.replace('.md', '') || '';
        
        // Get metadata from frontmatter or use defaults
        const metadata = post.metadata || {};
        
        // Create base object with required properties
        const essayMetadata: EssayMetadata = {
          title: metadata.title || "",
          description: metadata.description || "",
          date: metadata.date || "",
          slug
        };
        
        // Only add optional properties if they exist
        if (metadata.published !== undefined) essayMetadata.published = metadata.published;
        if (metadata.image) essayMetadata.image = metadata.image;
        if (metadata.tags) essayMetadata.tags = metadata.tags;
        if (metadata.excerpt) essayMetadata.excerpt = metadata.excerpt;
        
        return essayMetadata;
      })
    );
    
    // Filter out unpublished essays and sort by date
    return essays
      .filter(essay => essay.published !== false)
      .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
  } catch (error) {
    console.error("Error loading essays:", error);
    return [];
  }
}
