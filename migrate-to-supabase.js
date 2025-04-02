import { createClient } from '@supabase/supabase-js';
import { projects } from './src/data/projects.js';
import dotenv from 'dotenv';

// Load environment variables
dotenv.config();

// Initialize Supabase client
const supabaseUrl = process.env.SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SERVICE_KEY; // Use service key for admin privileges during migration
const supabase = createClient(supabaseUrl, supabaseKey);

async function migrateProjects() {
  console.log(`Starting migration of ${projects.length} projects...`);
  
  for (const project of projects) {
    // Format the project data for Supabase by explicitly selecting only the fields in our schema
    const formattedProject = {
      id: project.id,
      title: project.title,
      status: project.status,
      value: project.value,
      beneficiary: project.beneficiary,
      shortDescription: project.shortDescription,
      longDescription: project.longDescription,
      impact: project.impact,
      extraContent: project.extraContent,
      linkText: project.linkText,
      extraContentLinkText: project.extraContentLinkText,
      launchDate: project.launchDate ? project.launchDate.toISOString() : null,
      image: project.image,
      tools: Array.isArray(project.tools) ? project.tools : [],
      timeSaved: project.timeSaved || null,
      moneySaved: project.moneySaved || null,
      likes: project.likes || 0,
      follows: project.follows || 0,
      show: project.show !== undefined ? project.show : true,
      beforeImpact: project.beforeImpact || null,
      afterImpact: project.afterImpact || null
    };

    // Insert the project into Supabase
    const { data, error } = await supabase
      .from('projects')
      .upsert(formattedProject, { 
        onConflict: 'id',
        returning: 'minimal' 
      });

    if (error) {
      console.error(`Error migrating project ${project.id} (${project.title}):`, error);
    } else {
      console.log(`Successfully migrated project: ${project.title}`);
    }
    
    // Small delay to avoid rate limits
    await new Promise(resolve => setTimeout(resolve, 100));
  }
  
  console.log('Migration completed!');
}

migrateProjects().catch(console.error);