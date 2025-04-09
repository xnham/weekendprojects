<script lang="ts">
  import { onMount } from 'svelte';
  import { loadEssay } from '../utils/essays';
  import type { SvelteComponent } from 'svelte';
  import type { EssayMetadata } from '../utils/essays';
  import { FontAwesomeIcon } from '@fortawesome/svelte-fontawesome';
  import { fade } from 'svelte/transition';
  import { 
    toggleLike, 
    recordShare,
    recordView,
    ContentType,
    subscribeToInteractions
  } from '../services/interactionService';
  import InteractionButton from './shared/InteractionButton.svelte';
  
  export let slug: string;
  
  let content: typeof SvelteComponent | null = null;
  let metadata: EssayMetadata | null = null;
  let error: string | null = null;
  let loading = true;
  let showFloatingButton = false;
  let buttonVisible = false;
  let hideTimeout: ReturnType<typeof setTimeout> | null = null;
  let isScrolling = false;
  
  // Unified interaction state
  let essayInteractionState = { likes: {}, shares: {}, views: {} };
  
  // Add reactive derived values - use string key matching the ContentType.ESSAY format
  $: essayKey = metadata?.id ? `${ContentType.ESSAY}:${metadata.id}` : '';
  $: isEssayLiked = essayKey ? !!essayInteractionState.likes[essayKey] : false;
  
  // Replace modal state with simple feedback state
  let copyFeedback = "";
  let feedbackTimeout: ReturnType<typeof setTimeout>;
  
  onMount(() => {
    // Load the essay
    loadEssayContent();
    
    // Listen for scroll events
    window.addEventListener('scroll', handleScroll);
    
    // Subscribe to interaction changes (once)
    const unsubscribeFromInteractions = subscribeToInteractions(state => {
      essayInteractionState = state;
    });
    
    // Return cleanup function
    return () => {
      window.removeEventListener('scroll', handleScroll);
      unsubscribeFromInteractions();
      
      if (hideTimeout) {
        clearTimeout(hideTimeout);
      }
      if (feedbackTimeout) {
        clearTimeout(feedbackTimeout);
      }
    };
  });
  
  async function loadEssayContent() {
    try {
      const result = await loadEssay(slug);
      
      if (result.error) {
        error = result.error;
      } else {
        content = result.content;
        metadata = result.metadata;
        
        // Record view when essay is loaded if we have a valid ID
        if (metadata?.id) {
          recordView(ContentType.ESSAY, metadata.id);
        }
      }
    } catch (err) {
      console.error('Error loading essay:', err);
      error = 'An unexpected error occurred loading the essay.';
    } finally {
      loading = false;
    }
  }
  
  function handleLikeToggle() {
    if (!metadata?.id) return;
    toggleLike(ContentType.ESSAY, metadata.id);
  }
  
  function handleShare() {
    if (!metadata?.id) return;
    
    // Get the share URL
    const shareUrl = `${window.location.origin}/writing/${slug}`;
    
    // Copy to clipboard directly 
    navigator.clipboard.writeText(shareUrl)
      .then(() => {
        copyFeedback = "Link copied!";
        
        // Record the share interaction
        recordShare(ContentType.ESSAY, metadata.id);
        
        // Clear feedback after delay
        if (feedbackTimeout) clearTimeout(feedbackTimeout);
        feedbackTimeout = setTimeout(() => {
          copyFeedback = "";
        }, 2000);
      })
      .catch(err => {
        console.error('Failed to copy URL:', err);
        copyFeedback = "Copy failed";
        
        if (feedbackTimeout) clearTimeout(feedbackTimeout);
        feedbackTimeout = setTimeout(() => {
          copyFeedback = "";
        }, 2000);
      });
  }
  
  function handleScroll() {
    // Reset the hide timeout whenever scrolling occurs
    if (hideTimeout) clearTimeout(hideTimeout);
    
    // Control whether the back button should appear at all based on scroll position
    const scrollPosition = window.scrollY;
    const showThreshold = 300;
    showFloatingButton = scrollPosition > showThreshold;
    
    // Set button visibility based on scroll position, not just scroll start
    if (showFloatingButton) {
      isScrolling = true;
      buttonVisible = true;
    } else {
      // If we're below the threshold, ensure button is hidden
      buttonVisible = false;
    }
    
    // Set a new timeout to hide the button after 2 seconds of no scrolling
    hideTimeout = setTimeout(() => {
      isScrolling = false;
      buttonVisible = false;
    }, 2000);
  }
  
  function formatDate(dateString: string) {
    // Simple date formatter that doesn't use the Date object at all
    const [year, month, day] = dateString.split('-');
    
    // Convert month number to name
    const monthNames = [
      'January', 'February', 'March', 'April', 'May', 'June',
      'July', 'August', 'September', 'October', 'November', 'December'
    ];
    
    // Parse month as integer and subtract 1 to get correct index (months are 1-based in the string)
    const monthIndex = parseInt(month, 10) - 1;
    const monthName = monthNames[monthIndex];
    
    // Remove leading zero from day if present
    const dayFormatted = day.startsWith('0') ? day.substring(1) : day;
    
    // Return formatted date string
    return `${monthName} ${dayFormatted}, ${year}`;
  }
  
  // Add this function to manually handle navigation
  function handleBackClick(event) {
    event.preventDefault();
    window.history.pushState({}, '', '/writing');
    
    // Dispatch a custom event to notify App.svelte that navigation occurred
    window.dispatchEvent(new Event('popstate'));
  }
</script>

<!-- Back link -->
<div class="back-button">&lt; 
<a href="/writing" on:click={handleBackClick}>
  <span class="link-text">Back</span>
</a>
</div>

<!-- Floating back button when scrolled -->
<a 
  href="/writing"
  on:click={handleBackClick}
  class="floating-back-button {buttonVisible ? 'visible' : 'hidden'} {!showFloatingButton ? 'instant-hide' : ''}"
  aria-hidden={!buttonVisible}
>
  <span class="arrow">&lt;</span>
  <span class="floating-link-text">Back</span>
</a>

<article>
  {#if loading}
    <div class="loading">Loading essay...</div>
  {:else if error}
    <div class="error">{error}</div>
  {:else if content && metadata}
    <div class="essay-container">
      <div class="essay-header-row">
        <p class="essay-date">{formatDate(metadata.date)}</p>
        <div class="essay-buttons">
          <InteractionButton 
            type="like"
            active={isEssayLiked}
            count={undefined}
            on:click={handleLikeToggle}
          />
          <InteractionButton 
            type="share"
            active={false}
            count={undefined}
            on:click={handleShare}
          />
          {#if copyFeedback}
            <div class="copy-feedback" transition:fade={{ duration: 150 }}>
              {copyFeedback}
            </div>
          {/if}
        </div>
      </div>
      
      <h2 class="essay-title">{metadata.title}</h2>
      <p class="essay-description">{metadata.description}</p>
      
      <div class="content">
        <svelte:component this={content} />
      </div>
    </div>
  {/if}
</article>

<style>
  /* Layout & Container Elements */
  article {
    width: 75%;
    margin: 0;
    padding: 0;
  }

  .essay-container {
    border-top: 1px solid var(--dark-100);
    border-bottom: 1px solid var(--dark-100);
    padding: 14px 0 10px 0;
  }

  .essay-header-row {
    display: flex;
    justify-content: space-between;
    align-items: center;
  }
  
  .content :global(p) {
    margin-top: 0;
    margin-bottom: 1.5rem;
    font-size: 15px;
  }

  /* Typography */
  .essay-date {
    text-transform: uppercase;
    letter-spacing: 0.1rem;
    color: var(--dark-70);
    font-size: 13px;
    font-weight: 400;
  }

  .essay-title {
    margin-bottom: 0.5rem;
  }

  .essay-description {
    font-size: 17px;
    margin-top: 0;
    margin-bottom: 3rem;
  }

  /* Navigation Elements */
  .back-button {
    display: inline-block;
    margin-bottom: 10px;
    text-decoration: none;
    color: var(--dark-70);
    font-size: 14px;
    transition: color 0.3s ease;
  }

  .back-button:hover {
    color: var(--dark-80);
  }
  
  .back-button a {
    color: inherit;
    text-decoration: none;
    transition: color 0.3s ease;
  }

  .link-text {
    text-decoration: underline;
  }
  
  .floating-back-button {
    position: fixed;
    top: 10px;
    left: 10px;
    background-color: var(--light-100);
    color: var(--dark-70);
    padding: 8px 12px;
    font-size: 14px;
    text-decoration: none;
    z-index: 100;
    opacity: 0;
    transition: opacity 1.5s ease, transform 0.3s ease, color 0.3s ease;
    pointer-events: none;
  }
  
  .floating-back-button.visible {
    opacity: 1;
    pointer-events: auto;
  }
  
  .floating-back-button.hidden {
    opacity: 0;
    pointer-events: none;
  }
  
  /* Add this new class for immediate hiding */
  .floating-back-button.instant-hide {
    transition: opacity 0s, transform 0.3s ease, color 0.3s ease;
  }
  
  .floating-back-button:hover {
    transform: scale(1.04);
    color: var(--dark-80);
  }
  
  .floating-back-button .arrow {
    text-decoration: none;
  }
  
  .floating-back-button .floating-link-text {
    text-decoration: underline;
  }

  /* Status Elements */
  .loading, .error {
    text-align: center;
    padding: 2rem;
  }
  
  .error {
    color: #d32f2f;
  }

  /* Interactive Components */
  .essay-buttons {
    display: flex;
    gap: 8px;
    padding-right: 4px;
    position: relative;
  }
  
  .copy-feedback {
    position: absolute;
    top: 100%;
    right: 0;
    transform: none;
    white-space: nowrap;
    font-size: 14px;
    color: var(--dark-80);
    background-color: #F5F6F6;
    padding: 8px 12px;
    border-radius: 4px;
    margin-top: 5px;
    z-index: 100;
    animation: slideUp 0.15s ease-out;
    box-shadow:
      inset 0 1px 1px rgba(0, 0, 0, 0.05),
      0 1px 2px rgba(0, 0, 0, 0.08),
      0 2px 4px rgba(0, 0, 0, 0.08),
      0 4px 6px rgba(0, 0, 0, 0.08),
      0 6px 8px rgba(0, 0, 0, 0.08);
    pointer-events: none;
  }

  @keyframes slideUp {
    from {
      opacity: 0;
      transform: translateY(10px);
    }
    to {
      opacity: 1;
      transform: translateY(0);
    }
  }

  /* Responsive Styles */
  @media (max-width: 1150px) {
    .floating-back-button {
      display: none;
    }
  }
  
  @media (max-width: 768px) {
    article {
      width: 100%;
    }

    .essay-date {
      font-size: 12px;
    }

    .back-button {
      font-size: 12px;
    }
  }
</style>
