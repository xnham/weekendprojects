import { writable } from 'svelte/store';

/**
 * @typedef {Object} Metadata
 * @property {string} title
 * @property {string} description
 * @property {string} canonicalUrl
 * @property {string} type
 * @property {string} url
 */

// Create a store with default metadata values
export const metadata = writable({
  title: "Wendy Ham | Software for One",
  description: "Building software for one — personalized, useful, playful projects that solve human-sized problems.",
  canonicalUrl: "https://xnham.com",
  type: "website",
  url: ""
});

/**
 * Helper function to update metadata
 * @param {Object} newMetadata - Partial metadata to update
 * @param {string} [newMetadata.title]
 * @param {string} [newMetadata.description]
 * @param {string} [newMetadata.canonicalUrl]
 * @param {string} [newMetadata.type]
 * @param {string} [newMetadata.url]
 */
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