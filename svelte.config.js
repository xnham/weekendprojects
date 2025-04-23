import adapter from '@sveltejs/adapter-static';
import { vitePreprocess } from '@sveltejs/vite-plugin-svelte';
import { mdsvex } from 'mdsvex';

/** @type {import('@sveltejs/kit').Config} */
const config = {
	// Consult https://svelte.dev/docs/kit/integrations
	// for more information about preprocessors
	preprocess: [
		vitePreprocess(),
		mdsvex({
			extensions: ['.md'],
			smartypants: {
				dashes: 'oldschool'
			}
		})
	],
	
	extensions: ['.svelte', '.md'],

	kit: {
		// adapter-auto only supports some environments, see https://svelte.dev/docs/kit/adapter-auto for a list.
		// If your environment is not supported, or you settled on a specific environment, switch out the adapter.
		// See https://svelte.dev/docs/kit/adapters for more information about adapters.
		adapter: adapter({
			pages: 'build',
			assets: 'build',
			fallback: '404.html',
			precompress: false
		}),
		
		// Enable prerendering for all routes
		prerender: {
			// The entries will be set at build time via the prerender.js script
			crawl: true,
			handleMissingId: 'warn',
			handleHttpError: ({ path, referrer, message }) => {
				// Log the error but don't fail the build for missing content
				console.warn(`[prerender] Warning: ${message} at ${path}${referrer ? ` (referrer: ${referrer})` : ''}`);
				return;
			}
		},
		// Set this to your repo name if you're not using a custom domain
		// Example: paths: { base: '/my-repo-name' }
		paths: {
			base: ''  // Empty for custom domain (xnham.com)
		},
		// Use the correct format for configuring file paths
		files: {
			lib: 'src/lib',
			routes: 'src/routes',
			assets: 'static' 
		}
	}
};

export default config;