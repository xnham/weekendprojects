import { writable } from 'svelte/store';

interface MetadataState {
  title: string;
  description: string;
  image?: string;
  url?: string;
  type?: string;
  twitterCard?: string;
}

// Default/global metadata
const defaultMetadata: MetadataState = {
  title: "Wendy Ham's Weekend Projects",
  description: "Experiments in creating bespoke 'software for one' using AI tools. A look into the rising accessibility of hyperpersonal software for supercharging life tasks.",
  image: "/images/og-image.png", // Default og-image
  type: "website",
  twitterCard: "summary_large_image"
};

// Create the writable store with default values
const metadata = writable<MetadataState>(defaultMetadata);

// Helper function to update metadata
export function updateMetadata(newMetadata: Partial<MetadataState>) {
  metadata.update(current => ({ ...current, ...newMetadata }));
}

// Helper function to reset to default metadata
export function resetMetadata() {
  metadata.set(defaultMetadata);
}

export default metadata; 