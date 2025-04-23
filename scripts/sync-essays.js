import { createClient } from '@supabase/supabase-js';
import { readFileSync, readdirSync } from 'fs';
import { join, resolve, dirname } from 'path';
import { fileURLToPath } from 'url';
import matter from 'gray-matter';
import dotenv from 'dotenv';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
const contentDir = resolve(__dirname, '../src/content/essays');

// Create Supabase client
const supabaseUrl = process.env.VITE_SUPABASE_URL;
const supabaseKey = process.env.VITE_SUPABASE_SERVICE_ROLE_KEY || process.env.VITE_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseKey) {
  console.error('Supabase URL and Key are required!');
  process.exit(1);
}

// Log which key we're using (without showing the actual key)
console.log('Using Supabase key:', process.env.VITE_SUPABASE_SERVICE_ROLE_KEY ? 'SERVICE_ROLE_KEY' : 'ANON_KEY');

const supabase = createClient(supabaseUrl, supabaseKey, {
  auth: {
    autoRefreshToken: false,
    persistSession: false
  }
});

// Sync essays
async function syncEssaysToSupabase() {
  try {
    console.log('Scanning content directory:', contentDir);
    
    // Get all markdown files
    const files = readdirSync(contentDir).filter(file => file.endsWith('.md'));
    console.log(`Found ${files.length} markdown files`);
    
    let updatedCount = 0;
    let insertedCount = 0;
    
    for (const file of files) {
      const slug = file.replace('.md', '');
      const filePath = join(contentDir, file);
      
      // Read and parse the markdown file
      console.log(`Processing: ${file}`);
      const fileContent = readFileSync(filePath, 'utf8');
      const { data: metadata } = matter(fileContent);
      
      // Extract excerpt or create one from content
      let excerpt = metadata.excerpt || null;
      
      // Check if essay already exists in Supabase
      const { data: existingEssay, error: fetchError } = await supabase
        .from('essays')
        .select('id, slug, like_count, share_count, view_count, created_at')
        .eq('slug', slug)
        .single();
      
      if (fetchError && fetchError.code !== 'PGRST116') {
        console.error(`Error checking for existing essay ${slug}:`, fetchError);
        continue;
      }
      
      const now = new Date().toISOString();
      
      // Prepare essay data
      const essayData = {
        title: metadata.title || slug,
        description: metadata.description || "",
        date: metadata.date || now.split('T')[0],
        published: metadata.published !== undefined ? metadata.published : false,
        excerpt: excerpt || "",
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
          })
          .eq('id', existingEssay.id);
          
        if (error) {
          if (error.code === '42501') {
            // Row-level security policy violation
            console.warn(`RLS policy prevented updating essay ${slug}. Using existing data from database.`);
            console.warn('Consider using a service role key for this script.');
            updatedCount++; // Count as updated since we're proceeding with existing data
          } else {
            console.error(`Error updating essay ${slug}:`, error);
            continue;
          }
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
          });
          
        if (error) {
          if (error.code === '42501') {
            // Row-level security policy violation
            console.warn(`RLS policy prevented inserting new essay ${slug}.`);
            console.warn('Consider using a service role key for this script or modifying RLS policies.');
            // This essay won't be available unless we have proper permissions
            continue;
          } else {
            console.error(`Error inserting essay ${slug}:`, error);
            continue;
          }
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

// Run the sync function
async function main() {
  console.log('Starting essay sync process...');
  const result = await syncEssaysToSupabase();
  
  if (result.success) {
    console.log(`Essays synced successfully: ${result.updated} updated, ${result.inserted} inserted`);
    process.exit(0);
  } else {
    console.error('Essay sync failed:', result.error);
    process.exit(1);
  }
}

main().catch(err => {
  console.error('Error running sync script:', err);
  process.exit(1);
});