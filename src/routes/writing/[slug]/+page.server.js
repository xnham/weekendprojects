import { error } from '@sveltejs/kit';
import { loadEssay } from '$lib/utils/essays';

export async function load({ params }) {
  const { slug } = params;
  
  try {
    const result = await loadEssay(slug);
    
    if (result.error) {
      throw error(404, result.error);
    }
    
    // Check if essay is published, only show unpublished in dev mode
    if (!result.essay.published && import.meta.env.MODE !== 'development') {
      throw error(404, 'Essay not found');
    }
    
    return {
      essay: result.essay,
      content: result.content
    };
  } catch (err) {
    console.error('Error loading essay:', err);
    throw error(404, 'Essay not found');
  }
} 