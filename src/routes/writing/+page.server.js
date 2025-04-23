import { supabase } from '$lib/supabase';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import matter from 'gray-matter';

// Get the directory name in ESM (for debugging purposes)
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
// Use the static directory for content
const contentDir = path.resolve(process.cwd(), 'static/content/essays');

// Helper function to generate proper UUIDs
function generateUUID() {
  // Implementation of RFC4122 version 4 compliant UUID
  return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function(c) {
    const r = Math.random() * 16 | 0;
    const v = c === 'x' ? r : (r & 0x3 | 0x8);
    return v.toString(16);
  });
}

export async function load() {
  // Log content directory for debugging purposes
  console.log(`Content directory: ${contentDir} exists: ${fs.existsSync(contentDir)}`);
  console.log('Loading all essays for /writing page');
  
  try {
    console.log('Supabase client available in server:', !!supabase);
    
    // Directly load essays from Supabase
    const { data: supabaseEssays, error } = await supabase
      .from('essays')
      .select(`
        id, title, description, date, published, excerpt, slug,
        like_count, share_count, view_count
      `)
      .eq('published', true)
      .order('date', { ascending: false });
      
    // Log result for debugging
    if (error) {
      console.error('Error fetching essays from Supabase in server:', error);
    } else {
      console.log(`Successfully loaded ${supabaseEssays?.length || 0} essays from Supabase in server`);
    }
      
    if (error) {
      console.error(`Error fetching essays from Supabase: ${error.message}`);
      return {
        essays: [],
        error: error.message
      };
    }
    
    // Map Supabase essays to ensure ID consistency
    let essays = (supabaseEssays || []).map(essay => ({
      ...essay,
      // Make sure ID is a proper UUID (it should be already, but just to be safe)
      id: essay.id
    }));
    
    // In development mode, if the directory exists, add any missing essays from markdown files
    if (process.env.NODE_ENV === 'development' && fs.existsSync(contentDir)) {
      const files = fs.readdirSync(contentDir).filter(file => file.endsWith('.md'));
      
      // Create a map of already loaded essays by slug
      const essaysBySlug = essays.reduce((map, essay) => {
        map[essay.slug] = true;
        return map;
      }, {});
      
      // Add any essays from markdown files that aren't in Supabase
      for (const file of files) {
        const slug = file.replace('.md', '');
        
        // Skip if we already have this essay
        if (essaysBySlug[slug]) continue;
        
        try {
          // Read and parse the markdown file
          const filePath = path.join(contentDir, file);
          const fileContent = fs.readFileSync(filePath, 'utf8');
          const { data: metadata } = matter(fileContent);
          
          if (metadata.published !== false) {
            // Add the essay with a proper UUID
            essays.push({
              id: generateUUID(), // Proper UUID format
              slug,
              title: metadata.title || slug,
              description: metadata.description || "No description available",
              date: metadata.date || new Date().toISOString().split('T')[0],
              published: true,
              excerpt: metadata.excerpt || "",
              like_count: 0,
              share_count: 0,
              view_count: 0
            });
          }
        } catch (fileError) {
          console.error(`Error processing file ${file}:`, fileError);
        }
      }
      
      // Re-sort the combined list by date
      essays.sort((a, b) => new Date(b.date) - new Date(a.date));
    }
    
    console.log(`Loaded ${essays.length} essays with proper UUIDs`);
    
    return {
      essays,
      loadedAt: new Date().toISOString()
    };
  } catch (error) {
    console.error('Error loading essays:', error);
    return {
      essays: [],
      error: error.message
    };
  }
}