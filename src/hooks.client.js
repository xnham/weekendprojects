/**
 * Client-side hooks for SvelteKit
 * This file processes the URL at startup to support GitHub Pages SPA routing
 */

/** @type {import('@sveltejs/kit').HandleClientError} */
export function handleError({ error, event }) {
  console.error('Client-side error:', error);
  return {
    message: 'An unexpected error occurred',
    code: error?.code || 'UNKNOWN'
  };
}

// This runs before SvelteKit kicks in on the client
/** @type {import('@sveltejs/kit').HandleClientLoad} */
export async function load({ url, fetch }) {
  console.log('Client-side load hook running');
  console.log('URL before processing:', url.toString());
  
  // Run after SvelteKit hydrates
  if (typeof window !== 'undefined') {
    // Check if we should be showing a different route (for GitHub Pages SPA routing)
    if (url.search && url.search.startsWith('?/')) {
      console.log('Detected GitHub Pages SPA routing path:', url.search);
      const path = url.search.substring(2); // Remove the '?/' prefix
      
      // Change the URL to the correct path using the History API
      const newPath = '/' + path;
      console.log('Replacing URL with:', newPath);
      
      try {
        window.history.replaceState(null, '', newPath);
        // Return the updated URL to SvelteKit can handle it correctly
        return { url: new URL(newPath, url.origin) };
      } catch (error) {
        console.error('Error replacing URL:', error);
      }
    }
  }
  
  // Continue with normal routing
  return { url };
} 