import { supabase } from '$lib/supabase';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import matter from 'gray-matter';

// Get the directory name in ESM
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const contentDir = path.join(__dirname, '../../../content/essays');

export async function load() {
  console.log('Loading all essays for /writing page');
  console.log(`Content directory: ${contentDir}`);
  
  try {
    let essays = [];
    
    // First check if directory exists
    if (fs.existsSync(contentDir)) {
      // Get all markdown files in the directory
      const files = fs.readdirSync(contentDir)
        .filter(file => file.endsWith('.md'));
        
      console.log(`Found ${files.length} markdown files in the directory`);
      
      // Get essays from Supabase first
      const { data: supabaseEssays, error } = await supabase
        .from('essays')
        .select(`
          id, title, description, date, published, excerpt, slug,
          like_count, share_count, view_count
        `)
        .eq('published', true)
        .order('date', { ascending: false });
        
      if (error) {
        console.warn(`Error fetching essays from Supabase: ${error.message}`);
      } else {
        // Map essays by slug for quick lookup
        const essayMap = supabaseEssays.reduce((map, essay) => {
          map[essay.slug] = essay;
          return map;
        }, {});
        
        // Process each markdown file
        for (const file of files) {
          const slug = file.replace('.md', '');
          const filePath = path.join(contentDir, file);
          
          try {
            // Read and parse the markdown file
            const fileContent = fs.readFileSync(filePath, 'utf8');
            const { data: metadata } = matter(fileContent);
            
            // Check if essay exists in Supabase
            if (essayMap[slug]) {
              // Use the Supabase data
              essays.push(essayMap[slug]);
            } else if (metadata.published || process.env.NODE_ENV === 'development') {
              // Create a mock essay from metadata if it's published or we're in dev mode
              essays.push({
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
              });
            }
          } catch (fileError) {
            console.error(`Error processing file ${file}:`, fileError);
          }
        }
      }
    } else {
      console.error(`Content directory not found: ${contentDir}`);
    }
    
    // Sort essays by date (newest first)
    essays.sort((a, b) => new Date(b.date) - new Date(a.date));
    
    console.log(`Loaded ${essays.length} essays`);
    
    // Add debug information
    const essayInfo = essays.map(essay => ({
      slug: essay.slug,
      title: essay.title,
      published: essay.published
    }));
    
    console.log('Essay details:', JSON.stringify(essayInfo, null, 2));
    
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