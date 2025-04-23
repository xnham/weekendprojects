// Force server-side rendering and prerendering for this route
export const ssr = true;
export const prerender = true;

// Server-side load function for the /next page
export function load() {
  // Put any server-side data loading here
  return {
    // Any data your page needs
  };
} 