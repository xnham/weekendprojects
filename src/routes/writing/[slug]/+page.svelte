<script>
  import { page } from '$app/stores';
  import { onMount } from 'svelte';
  import { fade } from 'svelte/transition';
  import { metadata } from '$lib/stores/metadataStore';
  import InteractionButton from '$lib/components/shared/InteractionButton.svelte';
  import { 
    subscribeToInteractions, 
    toggleLike, 
    recordShare, 
    recordView,
    ContentType,
    getEssayInteractionCounts
  } from '$lib/services/essayInteractionService';
  
  // Access the essay data loaded by the page.server.js file
  export let data;
  
  // Interaction state
  let interactionState = { likes: {}, shares: {}, views: {} };
  let likedByUser = false;
  let copyFeedback = "";
  let copyFeedbackTimeout;
  
  // Variables for scroll UI
  let showFloatingButton = false;
  let buttonVisible = false;
  let hideTimeout = null;
  let isScrolling = false;

  // Add smooth scroll behavior
  onMount(async () => {
    // Set metadata for the essay
    if (data.essay) {
      metadata.set({
        title: `${data.essay.title} | Wendy Ham's Weekend Projects`,
        description: data.essay.description || data.essay.excerpt || '',
        canonicalUrl: `https://xnham.com/writing/${$page.params.slug}`,
        type: "article",
        url: window.location.href
      });
      
      // Initialize interactions and record view
      if (data.essay.id) {
        // Set up subscription to interaction state
        const unsubscribe = subscribeToInteractions((state) => {
          interactionState = state;
          
          // Update liked status whenever the interaction state changes
          if (data.essay) {
            const key = `${ContentType.ESSAY}:${data.essay.id}`;
            likedByUser = !!state.likes[key];
          }
        });
        
        // Record view
        await recordView(data.essay.id);
        
        // Get initial counts
        try {
          const counts = await getEssayInteractionCounts(data.essay.id);
          data.essay.like_count = counts.likeCount;
          data.essay.share_count = counts.shareCount;
          data.essay.view_count = counts.viewCount;
        } catch (error) {
          console.error("Error getting initial counts:", error);
        }
        
        // Clean up on component destruction
        return () => {
          unsubscribe();
          window.removeEventListener('scroll', handleScroll);
          if (hideTimeout) clearTimeout(hideTimeout);
          if (copyFeedbackTimeout) clearTimeout(copyFeedbackTimeout);
        };
      }
    }
    
    // Listen for scroll events
    window.addEventListener('scroll', handleScroll);
  });
  
  // Format date helper
  function formatDate(dateString) {
    // Simple date formatter that doesn't use the Date object at all
    // This prevents any timezone conversions
    const [year, month, day] = dateString.split("-");

    // Convert month number to name
    const monthNames = [
      "January", "February", "March", "April", "May", "June",
      "July", "August", "September", "October", "November", "December"
    ];

    // Parse month as integer and subtract 1 to get the correct index (months are 1-based in the string)
    const monthIndex = parseInt(month, 10) - 1;
    const monthName = monthNames[monthIndex];

    // Remove leading zero from day if present
    const dayFormatted = day.startsWith("0") ? day.substring(1) : day;

    // Return formatted date string
    return `${monthName} ${dayFormatted}, ${year}`;
  }
  
  // Go back function for the back button
  function goBack(e) {
    e.preventDefault();
    window.history.back();
  }
  
  // Scroll handling logic
  function handleScroll() {
    if (!isScrolling) {
      isScrolling = true;
      requestAnimationFrame(() => {
        const scrollPosition = window.scrollY;
        
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

  // Handle like button clicks
  async function handleLike() {
    try {
      if (!data.essay || !data.essay.id) return;
      
      // Determine if it's currently liked
      const key = `${ContentType.ESSAY}:${data.essay.id}`;
      const currentlyLiked = interactionState?.likes[key] || false;
      
      // Update the count optimistically
      const increment = !currentlyLiked ? 1 : -1;
      const oldCount = data.essay.like_count || 0;
      const newCount = Math.max(0, oldCount + increment);
      
      // Update UI immediately - needs to be forced with assignment
      data.essay = {
        ...data.essay,
        like_count: newCount
      };
      console.log(`Optimistic update - like count for essay ${data.essay.id}: ${oldCount} → ${newCount}`);
      
      // Also update the UI state optimistically
      likedByUser = !currentlyLiked;
      
      // Toggle the like in the database
      await toggleLike(data.essay.id);
      
      // After toggling, we can update the counts from the database
      // This helps ensure our UI is accurate
      try {
        const counts = await getEssayInteractionCounts(data.essay.id);
        console.log(`Database counts for essay ${data.essay.id}:`, counts);
        
        // Force UI update by creating a new object
        data.essay = {
          ...data.essay,
          like_count: counts.likeCount,
          share_count: counts.shareCount,
          view_count: counts.viewCount
        };
      } catch (error) {
        console.error("Error refreshing essay counts:", error);
      }
    } catch (error) {
      console.error("Error toggling like:", error);
      
      // If there was an error, revert the UI
      if (data.essay) {
        const key = `${ContentType.ESSAY}:${data.essay.id}`;
        const currentlyLiked = interactionState?.likes[key] || false;
        const increment = currentlyLiked ? 1 : -1;
        data.essay.like_count = Math.max(0, (data.essay.like_count || 0) - increment);
        likedByUser = currentlyLiked; // Revert like status
      }
    }
  }

  // Handle share button clicks
  async function handleShare() {
    try {
      if (!data.essay || !data.essay.id) return;
      
      // Create the share URL
      const shareUrl = `${window.location.origin}/writing/${data.essay.slug}`;
      
      // Copy to clipboard
      await navigator.clipboard.writeText(shareUrl);
      
      // Update count optimistically
      const oldShareCount = data.essay.share_count || 0;
      const newShareCount = oldShareCount + 1;
      
      // Update UI immediately with a new object to force reactivity
      data.essay = {
        ...data.essay,
        share_count: newShareCount
      };
      console.log(`Optimistic update - share count for essay ${data.essay.id}: ${oldShareCount} → ${newShareCount}`);
      
      // Show feedback
      copyFeedback = "URL copied to clipboard!";
      
      if (copyFeedbackTimeout) clearTimeout(copyFeedbackTimeout);
      copyFeedbackTimeout = setTimeout(() => {
        copyFeedback = "";
      }, 3000);
      
      // Record the share in the database
      await recordShare(data.essay.id);
      
      // Refresh the counts
      try {
        const counts = await getEssayInteractionCounts(data.essay.id);
        console.log(`Database counts for essay ${data.essay.id}:`, counts);
        
        // Force UI update by creating a new object
        data.essay = {
          ...data.essay,
          like_count: counts.likeCount,
          share_count: counts.shareCount,
          view_count: counts.viewCount
        };
      } catch (error) {
        console.error("Error refreshing essay counts:", error);
      }
    } catch (error) {
      console.error("Error sharing essay:", error);
      copyFeedback = "Failed to copy URL";
      copyFeedbackTimeout = setTimeout(() => {
        copyFeedback = "";
      }, 3000);
      
      // If there was an error, revert the UI
      if (data.essay) {
        // Create a new object to ensure reactivity
        data.essay = {
          ...data.essay,
          share_count: Math.max(0, (data.essay.share_count || 0) - 1)
        };
      }
    }
  }
</script>

<svelte:head>
  {#if data.essay}
    <title>{data.essay.title} | Wendy Ham's Weekend Projects</title>
    <meta name="description" content={data.essay.description || data.essay.excerpt || ''} />
    <link rel="canonical" href={`https://xnham.com/writing/${$page.params.slug}`} />
    
    <!-- Open Graph -->
    <meta property="og:type" content="article" />
    <meta property="og:url" content={window.location.href} />
    <meta property="og:title" content={`${data.essay.title} | Wendy Ham's Weekend Projects`} />
    <meta property="og:description" content={data.essay.description || data.essay.excerpt || ''} />
  {:else}
    <title>Essay Not Found | Wendy Ham's Weekend Projects</title>
  {/if}
</svelte:head>

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
  {#if !data.essay}
    <div class="error">Essay not found</div>
  {:else}
    <div class="essay-container">
      <div class="essay-header-row">
        <p class="essay-date">{formatDate(data.essay.date)}</p>
        <div class="essay-buttons">
          <InteractionButton 
            type="like"
            active={likedByUser}
            count={undefined}
            on:click={handleLike}
          />

          <div class="share-button-container">
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
      </div>
      
      <h2 class="essay-title">{data.essay.title}</h2>
      <p class="essay-description">{data.essay.description}</p>
      
      <div class="content">
        {#if data.content && data.content.default}
          <svelte:component this={data.content.default} />
        {:else}
          <p>Essay content is being loaded...</p>
        {/if}
      </div>
    </div>
    
    <!-- Essay stats -->
    <div class="essay-stats">
      <span class="essay-stat">{data.essay.like_count || 0} {data.essay.like_count === 1 ? 'like' : 'likes'}</span>
      <span class="essay-stat">{data.essay.share_count || 0} {data.essay.share_count === 1 ? 'share' : 'shares'}</span>
      <span class="essay-stat">{data.essay.view_count || 0} {data.essay.view_count === 1 ? 'view' : 'views'}</span>
    </div>
  {/if}
</article>

<style>
  /* Layout & Container Elements */
  article {
    width: 75%;
    margin: 0 auto;
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
    color: var(--dark-60);
    font-size: 12px;
    margin-top: 20px;
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
  .error {
    text-align: center;
    padding: 2rem;
    color: #d32f2f;
  }

  /* Interactive Components */
  .essay-buttons {
    display: flex;
    gap: 8px;
    padding-right: 4px;
    position: relative;
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

  .share-button-container {
    position: relative;
    display: inline-block;
  }

  /* Copy feedback styling */
  .copy-feedback {
    position: absolute;
    bottom: -35px;
    left: 0;
    white-space: nowrap;
    font-size: 14px;
    color: var(--dark-80);
    background-color: #f5f6f6;
    padding: 8px 12px;
    border-radius: 4px;
    z-index: 1000;
    box-shadow:
      inset 0 1px 1px rgba(0, 0, 0, 0.05),
      0 1px 2px rgba(0, 0, 0, 0.08),
      0 2px 4px rgba(0, 0, 0, 0.08),
      0 4px 6px rgba(0, 0, 0, 0.08),
      0 6px 8px rgba(0, 0, 0, 0.08);
    pointer-events: none;
  }
</style>