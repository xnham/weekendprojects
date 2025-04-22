import { writable } from 'svelte/store';

// Create a store with default metadata values
export const metadata = writable({
  title: "Wendy Ham | Software for One",
  description: "Building software for one — personalized, useful, playful projects that solve human-sized problems.",
  canonicalUrl: "https://xnham.com",
  type: "website",
  url: ""
});

// Helper function to update metadata
export function updateMetadata(newMetadata) {
  metadata.update(current => ({ ...current, ...newMetadata }));
}

// Helper function to reset metadata to defaults
export function resetMetadata() {
  metadata.set({
    title: "Wendy Ham | Software for One",
    description: "Building software for one — personalized, useful, playful projects that solve human-sized problems.",
    canonicalUrl: "https://xnham.com",
    type: "website",
    url: ""
  });
}

export default metadata; 