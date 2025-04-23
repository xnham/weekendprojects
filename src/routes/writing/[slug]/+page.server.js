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
const contentDir = path.join(__dirname, '../../../../src/content/essays');

export async function load({ params }) {
  const { slug } = params;
  
  try {
    console.log(`Loading essay with slug: ${slug} (server-side)`);
    
    // First fetch the essay data from Supabase
    const { data: essay, error: essayError } = await supabase
      .from('essays')
      .select(`
        id, title, description, date, published, excerpt, slug,
        like_count, share_count, view_count
      `)
      .eq('slug', slug)
      .single();
    
    // If there's an error fetching from Supabase
    if (essayError) {
      console.warn(`Error fetching essay from Supabase: ${essayError.message}`);
    }
    
    // Check if the file exists
    const mdPath = path.join(contentDir, `${slug}.md`);
    console.log(`Looking for markdown file at: ${mdPath}, exists: ${fs.existsSync(mdPath)}`);
    
    let content = null;
    
    if (fs.existsSync(mdPath)) {
      try {
        // Read and parse the markdown file
        const fileContent = fs.readFileSync(mdPath, 'utf8');
        console.log(`Successfully read file, content length: ${fileContent.length}`);
        
        const { data: metadata, content: mdContent } = matter(fileContent);
        console.log(`Front matter parsed: ${JSON.stringify(metadata)}`);
        
        // Convert markdown to HTML
        content = marked(mdContent);
        console.log(`Markdown converted to HTML, length: ${content.length}`);
      } catch (fileError) {
        console.error(`Error processing markdown file: ${fileError.message}`);
        throw error(500, {
          message: 'Error processing markdown file',
          details: fileError.message
        });
      }
      
      // If there's no essay data from Supabase but we have the markdown file,
      // create a proper essay object with a real UUID for development/testing
      if (!essay) {
        if (process.env.NODE_ENV === 'development') {
          // Generate a proper UUID instead of a mock ID
          const generateUUID = () => {
            // Implementation of RFC4122 version 4 compliant UUID
            return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function(c) {
              const r = Math.random() * 16 | 0;
              const v = c === 'x' ? r : (r & 0x3 | 0x8);
              return v.toString(16);
            });
          };
          
          // Create a proper essay object with a real UUID
          const mockEssay = {
            id: generateUUID(), // Use a real UUID format
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
          
          return {
            essay: mockEssay,
            content
          };
        } else {
          throw error(404, {
            message: 'Essay not found in database',
            details: 'This essay exists as a markdown file but is not registered in the database.'
          });
        }
      }
      
      // Check if essay is published unless in dev mode
      if (essay && essay.published === false && process.env.NODE_ENV !== 'development') {
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
      // If we have essay data but no markdown file
      if (essay) {
        throw error(500, {
          message: 'Essay content not found',
          details: `The essay exists in the database but the markdown file is missing.`
        });
      }
      
      // Neither essay data nor markdown file exists
      throw error(404, {
        message: 'Essay not found',
        details: `No essay found with slug: ${slug}`
      });
    }
  } catch (err) {
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