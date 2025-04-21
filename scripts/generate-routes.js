import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

// Get the current directory
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Path to your essays content directory
const ESSAYS_DIR = path.join(__dirname, '..', 'src', 'content', 'essays');

// Path to the routes file
const ROUTES_FILE = path.join(__dirname, '..', 'src', 'routes.js');

// Get all essay files
const essayFiles = fs.readdirSync(ESSAYS_DIR)
  .filter(file => file.endsWith('.md'));

// Generate routes for each essay
const dynamicRoutes = essayFiles.map(file => {
  const slug = file.replace('.md', '');
  return `/writing/${slug}`;
});

// Static routes
const staticRoutes = [
  '/',
  '/about',
  '/writing',
  '/next',
  '/contact'
];

// Write the routes file
const routesContent = `// Auto-generated file - DO NOT EDIT MANUALLY
export const routes = ${JSON.stringify(staticRoutes, null, 2)};

export const dynamicRoutes = ${JSON.stringify(dynamicRoutes, null, 2)};

export const allRoutes = [...routes, ...dynamicRoutes];
`;

fs.writeFileSync(ROUTES_FILE, routesContent);
console.log(`Generated routes file with ${staticRoutes.length} static routes and ${dynamicRoutes.length} dynamic routes.`);
