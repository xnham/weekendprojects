<script>
  import { onMount, onDestroy } from 'svelte';
  import InteractionButton from '../shared/InteractionButton.svelte';
  import { initializeInteractions, toggleLike, recordView, recordShare, subscribeToInteractions } from '$lib/services/projectInteractionService';
  
  // Props
  export let project;
  
  // Interaction state
  let interactions = {
    likes: 0,
    views: 0,
    shares: 0,
    liked: false
  };
  
  let unsubscribe;
  
  // Handle interaction updates
  function handleInteractionUpdate(newState) {
    interactions = newState;
  }
  
  // Toggle like
  async function handleLike() {
    const newLikedStatus = await toggleLike(project.id);
    interactions.liked = newLikedStatus;
  }
  
  // Handle share
  async function handleShare() {
    // Create share URL
    const shareUrl = `${window.location.origin}/#project-${project.id}`;
    
    // Try to use the Web Share API if available
    if (navigator.share) {
      try {
        await navigator.share({
          title: project.title,
          text: project.description,
          url: shareUrl
        });
        
        // Record share in database
        await recordShare(project.id);
      } catch (error) {
        if (error.name !== 'AbortError') {
          console.error('Error sharing project:', error);
          // Fallback to copy to clipboard
          copyToClipboard(shareUrl);
        }
      }
    } else {
      // Fallback for browsers that don't support Web Share API
      copyToClipboard(shareUrl);
    }
  }
  
  // Copy URL to clipboard
  function copyToClipboard(text) {
    navigator.clipboard.writeText(text)
      .then(() => {
        // Show success message (you could implement a toast notification here)
        alert('Link copied to clipboard!');
        // Record share
        recordShare(project.id);
      })
      .catch(err => {
        console.error('Failed to copy: ', err);
      });
  }
  
  onMount(async () => {
    // Initialize interactions
    await initializeInteractions();
    
    // Record view
    await recordView(project.id);
    
    // Subscribe to interaction updates
    unsubscribe = await subscribeToInteractions(project.id, handleInteractionUpdate);
  });
  
  onDestroy(() => {
    // Clean up subscription
    if (unsubscribe) unsubscribe();
  });
</script>

<div class="showcase">
  <div class="showcase-header">
    <div class="showcase-header-content">
      <h3>{project.title}</h3>
      <p class="description">{project.description}</p>
    </div>
    
    {#if project.icon}
      <div class="showcase-icon">
        <img src={project.icon} alt="{project.title} icon" />
      </div>
    {/if}
  </div>
  
  <div class="showcase-body">
    <slot>
      <!-- Default implementation for when no specific component is provided -->
      <div class="impact-content">
        <p class="impact-statement">{project.impact_statement || 'This project impacts me in multiple ways.'}</p>
      </div>
    </slot>
  </div>
  
  <div class="showcase-footer">
    <div class="interaction-buttons">
      <InteractionButton 
        type="like" 
        count={interactions.likes} 
        active={interactions.liked} 
        onClick={handleLike}
      />
      
      <InteractionButton 
        type="view" 
        count={interactions.views} 
        disabled={true}
      />
      
      <InteractionButton 
        type="share" 
        count={interactions.shares} 
        onClick={handleShare}
      />
    </div>
  </div>
</div>

<style>
  .showcase {
    display: flex;
    flex-direction: column;
    height: 100%;
    border-radius: 12px;
    overflow: hidden;
    box-shadow: 0 4px 8px rgba(0, 0, 0, 0.05);
    background-color: var(--pure-white-100);
  }
  
  .showcase-header {
    padding: 1.5rem;
    display: flex;
    align-items: flex-start;
    justify-content: space-between;
    gap: 1rem;
    border-bottom: 1px solid var(--dark-10);
  }
  
  .showcase-header-content {
    flex: 1;
  }
  
  h3 {
    margin: 0 0 0.5rem 0;
    font-size: 1.5rem;
    font-weight: 600;
    color: var(--dark-100);
  }
  
  .description {
    margin: 0;
    color: var(--dark-70);
    font-size: 0.95rem;
    line-height: 1.5;
  }
  
  .showcase-icon {
    width: 48px;
    height: 48px;
    flex-shrink: 0;
    display: flex;
    align-items: center;
    justify-content: center;
  }
  
  .showcase-icon img {
    max-width: 100%;
    max-height: 100%;
  }
  
  .showcase-body {
    padding: 1.5rem;
    flex: 1;
  }
  
  .impact-content {
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    text-align: center;
    height: 100%;
    min-height: 150px;
  }
  
  .impact-statement {
    font-size: 1.1rem;
    color: var(--dark-80);
    line-height: 1.6;
    margin: 0;
  }
  
  .showcase-footer {
    padding: 1rem 1.5rem;
    border-top: 1px solid var(--dark-10);
    background-color: var(--dark-2);
  }
  
  .interaction-buttons {
    display: flex;
    gap: 0.75rem;
  }
</style> 