import { sveltekit } from '@sveltejs/kit/vite';
import { defineConfig } from 'vite';
import { fileURLToPath } from 'url';
import path from 'path';
import { normalizePath } from 'vite';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

export default defineConfig({
	plugins: [sveltekit()],
	build: {
		rollupOptions: {
			external: ['archive/**']
		}
	},
	resolve: {
		alias: {
			$content: normalizePath(path.resolve(__dirname, './src/content'))
		}
	},
	// Allow importing .md files directly
	assetsInclude: ['**/*.md'],
	// Optimize dependencies
	optimizeDeps: {
		include: ['@supabase/supabase-js']
	}
});