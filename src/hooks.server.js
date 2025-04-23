/**
 * Server-side hooks for SvelteKit
 */

/** @type {import('@sveltejs/kit').HandleServerError} */
export function handleError({ error, event }) {
  console.error('Server-side error:', error);
  
  // Return a structured error response with only valid properties
  return {
    message: 'An unexpected error occurred on the server'
  };
} 