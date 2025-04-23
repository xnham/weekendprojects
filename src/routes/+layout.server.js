// Force server-side rendering for the entire app
export const ssr = true;

// Standard load function that runs on the server during prerendering
export function load() {
  return {
    // You can include global data here if needed
  };
} 