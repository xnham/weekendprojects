/**
 * Root layout load function that runs on both client and server
 */

// Enable prerendering for all routes
export const prerender = true;

/** @type {import('./$types').LayoutLoad} */
export function load({ url, params }) {
  // Handle GitHub Pages SPA routing if we detect a search parameter that looks like a path
  if (typeof window !== 'undefined' && url.search && url.search.startsWith('?/')) {
    const path = url.search.substring(2); // Remove the '?/' prefix
    
    // Redirect to the real path using JavaScript
    console.log('Redirecting to', path);
    const newUrl = '/' + path;
    
    // Only do this if we're in the browser
    try {
      window.history.replaceState(null, '', newUrl);
    } catch (e) {
      console.error('Failed to update URL:', e);
    }
  }
  
  // Return the current URL path for components to use
  return {
    currentPath: url.pathname
  };
} 