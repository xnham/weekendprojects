import { writable } from 'svelte/store';

// Create a store for the SunnyModal open state
export const isSunnyModalOpen = writable(false);

// Helper functions to open and close the modal
export function openSunnyModal() {
  isSunnyModalOpen.set(true);
}

export function closeSunnyModal() {
  isSunnyModalOpen.set(false);
} 