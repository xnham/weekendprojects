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
    subscribeToInteractions,
    isLiked
  } from '../services/interactionService';
  import InteractionButton from './shared/InteractionButton.svelte';
  import { supabase } from '../lib/supabase';
  
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
  let interactionState = { likes: {}, shares: {}, views: {} };
  
  // Add reactive derived values
  $: essayKey = metadata?.id ? `${ContentType.ESSAY}:${metadata.id}` : '';
  $: isEssayLiked = essayKey ? !!interactionState.likes[essayKey] : false;
  
  // Replace modal state with simple feedback state
  let copyFeedback = "";
  let feedbackTimeout: ReturnType<typeof setTimeout>;
  
  onMount(() => {
    // Load the essay
    loadEssayContent();
    
    // Listen for scroll events
    window.addEventListener('scroll', handleScroll);
    
    // Subscribe to interaction changes
    const unsubscribeFromInteractions = subscribeToInteractions(state => {
      interactionState = state;
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
      loading = true;
      const result = await loadEssay(slug);
      
      if (result.error) {
        error = result.error;
      } else {
        metadata = result.metadata;
        content = result.content;
        
        // Record view once we have the essay ID
        if (metadata?.id) {
          await recordView(ContentType.ESSAY, metadata.id);
          // Refresh metadata to get updated counts
          await refreshEssayMetadata();
        }
      }
    } catch (e) {
      error = 'Failed to load essay';
      console.error('Error loading essay:', e);
    } finally {
      loading = false;
    }
  }
  
  // Add this function to refresh essay data after interactions
  async function refreshEssayMetadata() {
    if (!metadata?.id) return;
    
    try {
      const { data, error } = await supabase
        .from('essays')
        .select('like_count, share_count, view_count')
        .eq('id', metadata.id)
        .single();
        
      if (error) throw error;
      
      if (data) {
        // Update only the counts, preserving other metadata
        metadata = {
          ...metadata,
          like_count: data.like_count,
          share_count: data.share_count,
          view_count: data.view_count
        };
      }
    } catch (e) {
      console.error('Failed to refresh essay counts:', e);
    }
  }
  
  // Call this after successful interactions
  async function handleLike() {
    if (!metadata?.id) return;
    
    try {
      await toggleLike(ContentType.ESSAY, metadata.id);
      // Refresh metadata to get updated counts
      await refreshEssayMetadata();
    } catch (e) {
      console.error('Failed to toggle like:', e);
    }
  }
  
  async function handleShare() {
    if (!metadata?.id) return;
    
    try {
      // Copy URL to clipboard
      await navigator.clipboard.writeText(window.location.href);
      
      // Show feedback
      copyFeedback = "URL copied to clipboard!";
      if (feedbackTimeout) clearTimeout(feedbackTimeout);
      feedbackTimeout = setTimeout(() => {
        copyFeedback = "";
      }, 3000);
      
      // Record share in database
      await recordShare(ContentType.ESSAY, metadata.id);
      
      // Refresh metadata to get updated counts
      await refreshEssayMetadata();
    } catch (e) {
      console.error('Failed to share essay:', e);
      copyFeedback = "Failed to copy URL";
      feedbackTimeout = setTimeout(() => {
        copyFeedback = "";
      }, 3000);
    }
  }
  
  // Scroll handling logic
  function handleScroll() {
    if (!isScrolling) {
      isScrolling = true;
      requestAnimationFrame(() => {
        const scrollPosition = window.scrollY;
        const windowHeight = window.innerHeight;
        const documentHeight = document.documentElement.scrollHeight;
        
        // Show floating back button when scrolled down a bit
        showFloatingButton = scrollPosition > 300;
        
        // Make button visible when we need it
        if (showFloatingButton && !buttonVisible) {
          buttonVisible = true;
        } else if (!showFloatingButton && buttonVisible) {
          // Remove the timeout delay and update immediately when scrolling up
          buttonVisible = false;
          if (hideTimeout) {
            clearTimeout(hideTimeout);
            hideTimeout = null;
          }
        }
        
        isScrolling = false;
      });
    }
  }
  
  // Go back function for the back button
  function goBack(e: MouseEvent) {
    e.preventDefault();
    window.history.pushState({}, '', '/writing');
    // Dispatch a custom event that App.svelte can listen for
    window.dispatchEvent(new CustomEvent('spanavigate'));
  }

  // Add this formatDate function inside the <script> section
  function formatDate(dateString: string) {
    // Simple date formatter that doesn't use the Date object at all
    // This prevents any timezone conversions
    const [year, month, day] = dateString.split("-");

    // Convert month number to name
    const monthNames = [
      "January",
      "February",
      "March",
      "April",
      "May",
      "June",
      "July",
      "August",
      "September",
      "October",
      "November",
      "December",
    ];

    // Parse month as integer and subtract 1 to get the correct index (months are 1-based in the string)
    const monthIndex = parseInt(month, 10) - 1;
    const monthName = monthNames[monthIndex];

    // Remove leading zero from day if present
    const dayFormatted = day.startsWith("0") ? day.substring(1) : day;

    // Return formatted date string
    return `${monthName} ${dayFormatted}, ${year}`;
  }

  // Update these helpers to access counts from Supabase data
  function getEssayLikes(): number {
    return metadata?.like_count || 0;
  }
  
  function getEssayShares(): number {
    return metadata?.share_count || 0;
  }
  
  function getEssayViews(): number {
    return metadata?.view_count || 0;
  }
</script>

<!-- Back link -->
<div class="back-button">&lt; 
  <a href="/writing" on:click={goBack}>
    <span class="link-text">Back</span>
  </a>
</div>

<!-- Floating back button when scrolled -->
<a 
  href="/writing"
  on:click={goBack}
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
            on:click={handleLike}
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

<!-- Update your counters in the UI to use these functions -->
<div class="essay-stats">
    <span class="essay-stat">{getEssayLikes()} {getEssayLikes() === 1 ? 'like' : 'likes'}</span>
    <span class="essay-stat">{getEssayShares()} {getEssayShares() === 1 ? 'share' : 'shares'}</span>
    <span class="essay-stat">{getEssayViews()} {getEssayViews() === 1 ? 'view' : 'views'}</span>
</div>

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
    letter-spacing: 0.07rem;
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
    color: var(--dark-60);
    font-weight: 400;
  }

  .essay-stats {
    display: flex;
    justify-content: flex-start;
    gap: 20px;
    color: var(--light-100);
    font-size: 12px;
    /* display: none; */
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
    background-color: transparent;
    color: var(--dark-70);
    padding: 8px 0 8px 20px;
    font-size: 14px;
    text-decoration: none;
    z-index: 50;
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

    .essay-header-row {
      margin-bottom: 30px;
    }
  }
  
  @media (max-width: 768px) {
    article {
      width: 100%;
    }

    .essay-date {
      font-size: 12px;
    }

    .essay-header-row {
      margin-bottom: 40px;
    }

    .back-button {
      font-size: 12px;
    }
  }
</style>
