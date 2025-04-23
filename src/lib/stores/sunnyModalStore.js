import { writable } from 'svelte/store';

// Create a store for the SunnyModal open state
export const isSunnyModalOpen = writable(false);

// Helper functions to open and close the modal
export function openSunnyModal() {
  console.log("Opening Sunny Modal");
  isSunnyModalOpen.set(true);
}

export function closeSunnyModal() {
  console.log("Closing Sunny Modal");
  isSunnyModalOpen.set(false);
} 