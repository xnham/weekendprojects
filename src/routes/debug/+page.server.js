import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

// Get the directory name in ESM
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const projectRoot = path.resolve(__dirname, '../../../..');
const srcContentDir = path.join(projectRoot, 'src/content/essays');
const rootContentDir = path.join(projectRoot, 'content/essays');
const staticContentDir = path.join(projectRoot, 'static/content/essays');

export async function load() {
  // Check if directories exist
  const srcContentExists = fs.existsSync(srcContentDir);
  const rootContentExists = fs.existsSync(rootContentDir);
  const staticContentExists = fs.existsSync(staticContentDir);
  
  // List files if directories exist
  const srcContentFiles = srcContentExists ? fs.readdirSync(srcContentDir) : [];
  const rootContentFiles = rootContentExists ? fs.readdirSync(rootContentDir) : [];
  const staticContentFiles = staticContentExists ? fs.readdirSync(staticContentDir) : [];
  
  // Check environment variables
  const envVars = {
    NODE_ENV: process.env.NODE_ENV || 'unknown',
    hasSupabaseUrl: !!process.env.VITE_SUPABASE_URL,
    hasSupabaseAnonKey: !!process.env.VITE_SUPABASE_ANON_KEY
  };
  
  return {
    paths: {
      projectRoot,
      srcContentDir,
      rootContentDir,
      staticContentDir,
      srcContentExists,
      rootContentExists,
      staticContentExists
    },
    files: {
      srcContentFiles,
      rootContentFiles,
      staticContentFiles
    },
    env: envVars,
    timestamp: new Date().toISOString()
  };
}