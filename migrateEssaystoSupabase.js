import dotenv from 'dotenv';
import { createClient } from '@supabase/supabase-js';
import fs from 'fs/promises';
import path from 'path';
import { v4 as uuidv4 } from 'uuid';
import { fileURLToPath } from 'url';
import matter from 'gray-matter'; // You need to install this package

// Load environment variables from .env file
dotenv.config();

// Get Supabase credentials from environment variables
const supabaseUrl = process.env.VITE_SUPABASE_URL;
const supabaseKey = process.env.VITE_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseKey) {
  console.error('Missing Supabase credentials in environment variables!');
  process.exit(1);
}

// Create Supabase client
const supabase = createClient(supabaseUrl, supabaseKey);

// Get current directory (ES modules don't have __dirname)
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Path to essay markdown files
const ESSAYS_DIR = path.join(__dirname, 'src', 'content', 'essays');

// Function to extract metadata from markdown using front matter
async function extractMetadataFromMarkdown(filePath) {
  const content = await fs.readFile(filePath, 'utf-8');
  
  // Use gray-matter to parse front matter
  const { data, content: markdownContent } = matter(content);
  
  // Extract excerpt from content if not specified in front matter
  let excerpt = data.excerpt;
  if (!excerpt && markdownContent) {
    // Simple excerpt generation: first 150 chars of content
    excerpt = markdownContent.trim().replace(/\s+/g, ' ').slice(0, 150);
    if (markdownContent.length > 150) excerpt += '...';
  }
  
  return {
    title: data.title || '',
    description: data.description || '',
    date: data.date || new Date().toISOString().split('T')[0],
    published: data.published !== undefined ? data.published : false,
    excerpt: excerpt || null
  };
}

async function migrateEssaysToSupabase() {
  console.log('Starting migration of essays to Supabase...');
  console.log(`Reading essays from: ${ESSAYS_DIR}`);
  
  // Track success and failures
  let successCount = 0;
  let failureCount = 0;
  const now = new Date().toISOString();
  
  try {
    // Read the essays directory
    const files = await fs.readdir(ESSAYS_DIR);
    console.log(`Found ${files.length} files in directory`);
    
    // Process each markdown file
    for (const file of files) {
      if (!file.endsWith('.md')) continue;
      
      try {
        // Extract slug from filename (remove .md extension)
        const slug = file.replace('.md', '');
        const filePath = path.join(ESSAYS_DIR, file);
        
        console.log(`Processing ${file}...`);
        
        // Extract metadata
        const metadata = await extractMetadataFromMarkdown(filePath);
        
        // Check if essay already exists
        const { data: existingEssay } = await supabase
          .from('essays')
          .select('id, like_count, share_count, view_count, created_at')
          .eq('slug', slug)
          .single();
        
        if (existingEssay) {
          // Update existing essay, preserving interaction counts and creation date
          const { error } = await supabase
            .from('essays')
            .update({
              title: metadata.title,
              description: metadata.description,
              date: metadata.date,
              published: metadata.published,
              excerpt: metadata.excerpt,
              slug,
              updated_at: now
            })
            .eq('id', existingEssay.id);
            
          if (error) {
            console.error(`Error updating essay ${slug}:`, error);
            failureCount++;
          } else {
            console.log(`Updated essay: ${slug}`);
            successCount++;
          }
        } else {
          // Insert new essay with all required fields
          const { error } = await supabase
            .from('essays')
            .insert({
              id: uuidv4(),
              title: metadata.title,
              description: metadata.description,
              date: metadata.date,
              published: metadata.published,
              excerpt: metadata.excerpt,
              slug,
              like_count: 0,
              share_count: 0,
              view_count: 0,
              created_at: now,
              updated_at: now
            });
            
          if (error) {
            console.error(`Error inserting essay ${slug}:`, error);
            failureCount++;
          } else {
            console.log(`Inserted new essay: ${slug}`);
            successCount++;
          }
        }
      } catch (err) {
        console.error(`Error processing essay ${file}:`, err);
        failureCount++;
      }
    }
  } catch (err) {
    console.error('Error reading essays directory:', err);
  }
  
  console.log(`Migration complete: ${successCount} succeeded, ${failureCount} failed`);
}

// Run the migration
migrateEssaysToSupabase()
  .then(() => {
    console.log('Migration script finished');
    process.exit(0);
  })
  .catch(err => {
    console.error('Unhandled error in migration script:', err);
    process.exit(1);
  });
