import { sveltekit } from '@sveltejs/kit/vite';
import { defineConfig } from 'vite';
import { fileURLToPath } from 'url';
import path from 'path';
import { normalizePath } from 'vite';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

export default defineConfig({
	plugins: [
		sveltekit(),
		// Add a plugin to handle rewriting URLs for GitHub Pages SPA routing
		{
			name: 'gh-pages-spa-routing',
			configureServer(server) {
				server.middlewares.use((req, res, next) => {
					// Handle GitHub Pages style routing in development
					const url = req.url || '';
					if (url.startsWith('/?/')) {
						const newUrl = url.replace('/?/', '/');
						console.log(`[gh-pages-spa] Rewriting ${url} to ${newUrl}`);
						req.url = newUrl;
					}
					next();
				});
			}
		}
	],
	build: {
		rollupOptions: {
			external: ['archive/**']
		}
	},
	resolve: {
		alias: {
			// Update to use static/content for all content
			$content: normalizePath(path.resolve(__dirname, './static/content')),
			// Additional alias to handle both client and server contexts
			'$essays': normalizePath(path.resolve(__dirname, './static/content/essays'))
		}
	},
	// Allow importing .md files directly
	assetsInclude: ['**/*.md'],
	// Optimize dependencies
	optimizeDeps: {
		include: ['@supabase/supabase-js']
	}
});