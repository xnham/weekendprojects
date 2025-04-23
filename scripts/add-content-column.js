import { createClient } from '@supabase/supabase-js';
import { readFileSync } from 'fs';
import { join, resolve, dirname } from 'path';
import { fileURLToPath } from 'url';
import matter from 'gray-matter';
import dotenv from 'dotenv';
import { marked } from 'marked';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
const contentDir = resolve(__dirname, '../static/content/essays');

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

// Add content column and migrate content from markdown files
async function addContentColumnAndMigrateData() {
  try {
    console.log('Starting migration process...');
    
    // First, check if the content column already exists
    const { data: columns, error: columnsError } = await supabase
      .from('essays')
      .select('content')
      .limit(1);
    
    const columnExists = !columnsError;
    console.log(`Content column exists: ${columnExists}`);
    
    // Loop through all essays in the database 
    const { data: essays, error: essaysError } = await supabase
      .from('essays')
      .select('id, slug');
      
    if (essaysError) {
      console.error('Error fetching essays:', essaysError);
      process.exit(1);
    }
    
    console.log(`Found ${essays.length} essays to process`);
    
    let updatedCount = 0;
    let errorCount = 0;
    
    for (const essay of essays) {
      try {
        // Get markdown file path
        const mdFilePath = join(contentDir, `${essay.slug}.md`);
        console.log(`Processing ${essay.slug} from ${mdFilePath}`);
        
        // Read the markdown file
        const markdownContent = readFileSync(mdFilePath, 'utf-8');
        
        // Parse front matter and content
        const { data: metadata, content: mdContent } = matter(markdownContent);
        
        // Convert markdown to HTML for better presentation
        // This preserves heading structure (h1, h2, etc) which is what you need
        const htmlContent = marked(mdContent);
        
        // Update the essay in Supabase with the content
        const { error: updateError } = await supabase
          .from('essays')
          .update({ content: htmlContent })
          .eq('id', essay.id);
          
        if (updateError) {
          console.error(`Error updating ${essay.slug}:`, updateError);
          errorCount++;
          continue;
        }
        
        console.log(`Updated ${essay.slug} with ${htmlContent.length} characters of content`);
        updatedCount++;
      } catch (error) {
        console.error(`Error processing ${essay.slug}:`, error);
        errorCount++;
      }
    }
    
    console.log(`Migration complete! Updated ${updatedCount} essays, ${errorCount} errors`);
    return { success: true, updated: updatedCount, errors: errorCount };
  } catch (error) {
    console.error('Error in migration process:', error);
    return { success: false, error };
  }
}

// Run the migration
async function main() {
  console.log('Starting content migration to Supabase...');
  const result = await addContentColumnAndMigrateData();
  
  if (result.success) {
    console.log(`Migration successful: ${result.updated} essays updated`);
    process.exit(0);
  } else {
    console.error('Migration failed:', result.error);
    process.exit(1);
  }
}

main().catch(err => {
  console.error('Unexpected error:', err);
  process.exit(1);
});