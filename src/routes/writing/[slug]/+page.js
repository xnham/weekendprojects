// Client-side only page - data loading happens in the Essay component
export function load({ params }) {
  return {
    slug: params.slug
  };
} 