// Force server-side rendering and prerendering for this route
export const ssr = true;
export const prerender = true;

// Server-side load function for the /about page
export function load() {
  // This page doesn't need to fetch dynamic data,
  // but we're ensuring it gets prerendered
  return {};
} 