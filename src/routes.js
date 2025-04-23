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

// Get essay routes - hardcoded since we now store content in Supabase
function getEssayRoutes() {
  // List of essay slugs to prerender
  const essaySlugs = [
    'the-last-mile',
    'software-for-one'
    // Add any other essay slugs here when you add more essays
  ];
  
  console.log(`Using ${essaySlugs.length} hardcoded essay slugs for routes`);
  return essaySlugs.map(slug => `/writing/${slug}`);
}

// All routes combined
export const allRoutes = [...baseRoutes, ...getEssayRoutes()];