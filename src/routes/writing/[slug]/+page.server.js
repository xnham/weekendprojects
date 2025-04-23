import { error } from '@sveltejs/kit';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import matter from 'gray-matter';
import { marked } from 'marked';
import { supabase } from '$lib/supabase';

// Get the directory name in ESM
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const contentDir = path.join(__dirname, '../../../../content/essays');

export async function load({ params }) {
  const { slug } = params;
  
  try {
    console.log(`Loading essay with slug: ${slug} (server-side)`);
    console.log(`Content directory: ${contentDir}`);
    
    // First check if the file exists
    const mdPath = path.join(contentDir, `${slug}.md`);
    console.log(`Checking for markdown file at: ${mdPath}`);
    
    let essay = null;
    let content = null;
    
    // Check if file exists
    if (fs.existsSync(mdPath)) {
      console.log(`Markdown file found at: ${mdPath}`);
      
      // Read and parse the markdown file
      const fileContent = fs.readFileSync(mdPath, 'utf8');
      const { data: metadata, content: mdContent } = matter(fileContent);
      
      console.log(`Parsed frontmatter:`, metadata);
      
      // Convert markdown to HTML
      const htmlContent = marked(mdContent);
      
      // Now look for the essay in Supabase
      const { data: supabaseEssay, error: essayError } = await supabase
        .from('essays')
        .select(`
          id, title, description, date, published, excerpt, slug,
          like_count, share_count, view_count
        `)
        .eq('slug', slug)
        .single();
      
      if (essayError) {
        console.warn(`Error fetching essay from Supabase: ${essayError.message}`);
        
        // Create a mock essay from the markdown if in dev mode or if it's a new essay
        if (process.env.NODE_ENV === 'development' || essayError.code === 'PGRST116') {
          console.log(`Creating mock essay for ${slug} since we're in dev mode or it's a new essay`);
          
          essay = {
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
        } else {
          throw error(404, {
            message: 'Essay not found',
            details: `Error fetching essay from database: ${essayError.message}`
          });
        }
      } else {
        essay = supabaseEssay;
      }
      
      // Use the parsed content
      content = htmlContent;
      
      // Check if essay is published unless in dev mode
      if (essay.published === false && process.env.NODE_ENV !== 'development') {
        console.warn(`Essay ${slug} is marked as unpublished and we're not in dev mode`);
        throw error(404, {
          message: 'Essay not found',
          details: 'This essay is not yet published'
        });
      }
      
      return {
        essay,
        content
      };
    } else {
      console.error(`Markdown file not found at: ${mdPath}`);
      throw error(404, {
        message: 'Essay not found',
        details: `No markdown file found for ${slug}`
      });
    }
  } catch (err) {
    console.error(`Error loading essay ${slug}:`, err);
    
    // Provide more helpful error details
    if (err.status && err.body) {
      // This is already a SvelteKit error, just rethrow it
      throw err;
    }
    
    throw error(500, {
      message: 'Error loading essay',
      details: err.message || 'Unknown error occurred'
    });
  }
}