import { loadEssays } from '$lib/utils/essays.js';

export async function load() {
  const essays = await loadEssays();
  
  return {
    essays
  };
} 