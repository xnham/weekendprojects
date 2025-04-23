import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

// Base routes to always prerender
const baseRoutes = [
  '/',
  '/about',
  '/contact',
  '/writing'
];

// Get essay routes automatically from content folder
function getEssayRoutes() {
  try {
    // Look in the static/content/essays directory
    const contentFolder = path.resolve(process.cwd(), 'static/content/essays');
    console.log(`Looking for essays in: ${contentFolder}`);
    
    if (!fs.existsSync(contentFolder)) {
      console.warn(`Essays directory not found: ${contentFolder}`);
      return [];
    }
    
    const essays = fs.readdirSync(contentFolder)
      .filter(file => file.endsWith('.md'))
      .map(file => file.replace('.md', ''));
      
    console.log(`Found ${essays.length} essays`);
    return essays.map(slug => `/writing/${slug}`);
  } catch (err) {
    console.warn('Error reading essay directory:', err);
    return [];
  }
}

// All routes combined
export const allRoutes = [...baseRoutes, ...getEssayRoutes()];