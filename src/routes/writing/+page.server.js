import { loadEssays } from '$lib/utils/essays';

export async function load() {
  const essays = await loadEssays();
  
  return {
    essays
  };
} 