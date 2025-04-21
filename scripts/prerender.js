import puppeteer from 'puppeteer';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { allRoutes } from '../src/routes.js';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const DIST_FOLDER = path.resolve(__dirname, '../dist');
const PORT = 5173;

async function prerender() {
  console.log('Starting prerendering process...');
  
  // Start the dev server (you can also use 'preview' if already built)
  const { createServer } = await import('vite');
  const server = await createServer({
    configFile: path.resolve(__dirname, '../vite.config.js'),
    root: path.resolve(__dirname, '..'),
    base: '/',
    server: {
      port: PORT
    }
  });
  await server.listen();
  console.log(`Server started at http://localhost:${PORT}`);
  
  const browser = await puppeteer.launch();
  const page = await browser.newPage();
  
  try {
    for (const route of allRoutes) {
      console.log(`Prerendering route: ${route}`);
      
      // Navigate to the page
      await page.goto(`http://localhost:${PORT}${route}`, {
        waitUntil: 'networkidle0'
      });
      
      // Get the HTML
      const html = await page.content();
      
      // Create directory if needed
      const targetDir = route === '/' 
        ? DIST_FOLDER 
        : path.join(DIST_FOLDER, route.substring(1));
        
      if (route !== '/' && !fs.existsSync(targetDir)) {
        fs.mkdirSync(targetDir, { recursive: true });
      }
      
      // Write the HTML file
      const filePath = path.join(targetDir, 'index.html');
      fs.writeFileSync(filePath, html);
      console.log(`Created: ${filePath}`);
    }
  } catch (error) {
    console.error('Error during prerendering:', error);
  } finally {
    await browser.close();
    await server.close();
    console.log('Prerendering complete!');
  }
}

prerender();
