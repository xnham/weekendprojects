<script lang="ts">
  import { onMount, createEventDispatcher } from 'svelte';
  import { fade } from 'svelte/transition';
  import InteractionButton from '$lib/components/shared/InteractionButton.svelte';
  import { 
    subscribeToInteractions, 
    toggleLike, 
    recordShare, 
    recordView,
    isLiked,
    initializeInteractions,
    ContentType,
    getEssayInteractionCounts
  } from '$lib/services/essayInteractionService';
  
  // Set up event dispatcher for errors
  const dispatch = createEventDispatcher<{
    error: any;
  }>();
  
  // Access the essay and content data passed from parent
  export let essay: any;
  export let content: any;
  
  // Interaction state
  let interactionState = { likes: {}, shares: {}, views: {} };
  let likedByUser = false;
  let copyFeedback = "";
  let copyFeedbackTimeout: ReturnType<typeof setTimeout> | null = null;
  
  // Optimistic count tracking
  let optimisticLikeCount = 0;
  let optimisticShareCount = 0;
  let optimisticViewCount = 0;
  let isOptimistic = false;
  let hasInitialisedCounts = false;
  
  // Update when essay data changes
  $: if (essay && !hasInitialisedCounts) {
    optimisticLikeCount = essay.like_count || 0;
    optimisticShareCount = essay.share_count || 0;
    // For view count, we'll add 1 since we're viewing it now
    optimisticViewCount = (essay.view_count || 0) + 1;
    isOptimistic = true;
    hasInitialisedCounts = true;
  }
  
  // Scroll UI variables
  let showFloatingButton = false;
  let buttonVisible = false;
  let hideTimeout: ReturnType<typeof setTimeout> | null = null;
  let isScrolling = false;
  
  // Separate async function for initializing the page
  async function initializePage() {
    try {
      // Initialize interaction system first
      console.log('Initializing interactions on Essay component');
      const deviceId = await initializeInteractions();
      console.log('Interactions initialized on Essay with device ID:', deviceId);
      
      if (!deviceId) {
        console.error('Failed to initialize interactions on Essay - no device ID returned');
        dispatch('error', new Error('Failed to initialize interactions'));
        return;
      }
      
      // Set up interaction checks
      if (essay && essay.id) {
        const isAlreadyLiked = isLiked(essay.id);
        console.log(`Essay ${essay.id} already liked:`, isAlreadyLiked);
        likedByUser = isAlreadyLiked;
        
        // Record view with optimistic UI update
        try {
          await recordView(essay.id);
          console.log(`View recorded for essay ${essay.id}`);
          
          // We're already using optimistic view count from the reactive statement
          // that runs when essay changes, so no need to update here
        } catch (viewError) {
          console.error(`Error recording view for essay ${essay.id}:`, viewError);
          // Even if there's an error, we'll keep the optimistic view count
          // since the user did view the essay
        }
      }
    } catch (error) {
      console.error('Error during Essay interaction initialization:', error);
      dispatch('error', error);
    }
  }
  
  onMount(() => {
    let unsubscribe: () => void = () => {};
    let initTimer: ReturnType<typeof setTimeout> | null = null;
    
    try {
      // Add a small delay before initializing interactions to allow SPA routing to complete
      initTimer = setTimeout(async () => {
        try {
          await initializePage();
          
          // Subscribe to interaction state changes
          unsubscribe = subscribeToInteractions((state) => {
            interactionState = state;
            
            // Update liked status whenever the interaction state changes
            if (essay && essay.id) {
              const key = `${ContentType.ESSAY}:${essay.id}`;
              likedByUser = !!state.likes[key];
            }
          });
        } catch (error) {
          console.error('Error during delayed Essay initialization:', error);
          dispatch('error', error);
        }
      }, 300); // 300ms delay to ensure SPA routing is complete
      
      // Listen for scroll events
      window.addEventListener('scroll', handleScroll);
      
      // Clean up on component destruction
      return () => {
        if (unsubscribe) unsubscribe();
        if (initTimer) clearTimeout(initTimer);
        window.removeEventListener('scroll', handleScroll);
        if (hideTimeout) clearTimeout(hideTimeout);
        if (copyFeedbackTimeout) clearTimeout(copyFeedbackTimeout);
      };
    } catch (error) {
      console.error('Error setting up Essay component:', error);
      dispatch('error', error);
      return () => {
        if (unsubscribe) unsubscribe();
        if (initTimer) clearTimeout(initTimer);
        window.removeEventListener('scroll', handleScroll);
        if (hideTimeout) clearTimeout(hideTimeout);
        if (copyFeedbackTimeout) clearTimeout(copyFeedbackTimeout);
      };
    }
  });

  // Format date helper
  function formatDate(dateString: string) {
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
  
  // Scroll handling logic
  function handleScroll() {
    // Only run in browser context
    if (typeof window === 'undefined') return;
    
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
    console.log('Essay handleLike called');
    if (!essay || !essay.id) {
      console.error("Cannot like: Missing essay ID");
      return;
    }
    
    try {
      console.log(`Toggling like for essay ID: ${essay.id}`);
      
      // Apply optimistic update to count and UI
      const newLikedState = !likedByUser;
      const increment = newLikedState ? 1 : -1;
      
      // Directly update the optimistic count variable to trigger reactivity
      optimisticLikeCount = Math.max(0, optimisticLikeCount + increment);
      isOptimistic = true;
      
      // Also update the UI state optimistically
      likedByUser = newLikedState;
      
      // Force a Svelte update
      optimisticLikeCount = optimisticLikeCount;
      
      // Toggle the like in the database
      const result = await toggleLike(essay.id);
      console.log(`Toggle like result: ${result}`);
    } catch (error) {
      console.error("Error toggling like:", error);
      dispatch('error', error);
      
      // Revert optimistic updates on error
      const revertIncrement = likedByUser ? -1 : 1;
      optimisticLikeCount = Math.max(0, optimisticLikeCount + revertIncrement);
      likedByUser = !likedByUser;
      isOptimistic = false;
    }
  }

  // Handle share button clicks
  async function handleShare() {
    try {
      if (!essay || !essay.id) {
        console.error("Cannot share: Missing essay ID");
        return;
      }
      
      console.log(`Sharing essay ID: ${essay.id}`);
      
      // Create the share URL (this only runs on client side so window is safe to use here)
      const shareUrl = `${window.location.origin}/writing/${essay.slug}`;
      
      // Apply optimistic update to count BEFORE we attempt to access the clipboard
      optimisticShareCount += 1;
      isOptimistic = true;
      // Force a Svelte update
      optimisticShareCount = optimisticShareCount;
      
      // Copy to clipboard
      await navigator.clipboard.writeText(shareUrl);
      
      // Show feedback
      copyFeedback = "URL copied to clipboard!";
      
      if (copyFeedbackTimeout) clearTimeout(copyFeedbackTimeout);
      copyFeedbackTimeout = setTimeout(() => {
        copyFeedback = "";
      }, 3000);
      
      // Record the share in the database
      const result = await recordShare(essay.id);
      console.log(`Share recorded: ${result}`);
    } catch (error) {
      console.error("Error sharing essay:", error);
      dispatch('error', error);
      
      copyFeedback = "Failed to copy URL";
      copyFeedbackTimeout = setTimeout(() => {
        copyFeedback = "";
      }, 3000);
      
      // Revert optimistic update on error
      optimisticShareCount = Math.max(0, optimisticShareCount - 1);
      isOptimistic = false;
    }
  }
  
  // Helpers to use optimistic counts when available
  function getEssayLikes() {
    return isOptimistic ? optimisticLikeCount : (essay?.like_count || 0);
  }
  
  function getEssayShares() {
    return isOptimistic ? optimisticShareCount : (essay?.share_count || 0);
  }
  
  function getEssayViews() {
    // For views, increment the initial count by 1 to show the current view
    const baseViewCount = essay?.view_count || 0;
    // Use optimistic count if it's been updated, otherwise use base count + 1
    return isOptimistic ? optimisticViewCount : (baseViewCount + 1);
  }
</script>

<div class="essay-container">
  <div class="essay-header-row">
    <p class="essay-date">{formatDate(essay.date)}</p>
    <div class="essay-buttons">
      <InteractionButton 
        type="like"
        active={likedByUser}
        count={undefined}
        on:click={(e) => {
          console.log('Like button clicked in single essay view');
          handleLike();
        }}
      />

      <div class="share-button-container">
        <InteractionButton 
          type="share"
          active={false}
          count={undefined}
          on:click={(e) => {
            console.log('Share button clicked in single essay view');
            handleShare();
          }}
        />
        
        {#if copyFeedback}
          <div class="copy-feedback" transition:fade={{ duration: 150 }}>
            {copyFeedback}
          </div>
        {/if}
      </div>
    </div>
  </div>
  
  <h2 class="essay-title">{essay.title}</h2>
  <p class="essay-description">{essay.description}</p>
  
  <div class="content">
    {#if content === null}
      <!-- Loading state - content not yet available -->
      <div class="loading-container">
        <p class="loading">
          Content not available.
        </p>
        
        <slot name="content-actions"></slot>
      </div>
    {:else if content}
      <!-- Render the HTML content from Supabase -->
      <div class="essay-content">{@html content}</div>
    {:else}
      <!-- Content loading failed -->
      <p class="loading error">
        Essay content could not be loaded. Please try again later.
      </p>
      <details>
        <summary>View details</summary>
        <pre>{JSON.stringify(essay, null, 2)}</pre>
      </details>
    {/if}
  </div>
</div>

<!-- Essay stats with reactive counts -->
<div class="essay-stats">
  <span class="essay-stat">{optimisticLikeCount} {optimisticLikeCount === 1 ? 'like' : 'likes'}</span>
  <span class="essay-stat">{optimisticShareCount} {optimisticShareCount === 1 ? 'share' : 'shares'}</span>
  <span class="essay-stat">{optimisticViewCount} {optimisticViewCount === 1 ? 'view' : 'views'}</span>
</div>

<style>
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
  
  /* Content styling - using :global to target elements inside the HTML content */
  .content :global(p) {
    color: var(--dark-85);
    margin-top: 0;
    margin-bottom: 1.5rem;
    font-size: 15px;
  }
  
  /* Styling for headings in essay content */
  .content :global(h1) {}
  
  .content :global(h2) {}
  
  .content :global(h3) {}
  
  /* Essay content styles */
  .essay-content {
    width: 100%;
    font-size: 15px;
    line-height: 1.6;
    color: var(--dark-100);
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
    margin-top: 4px;
  }

  /* Status Elements */
  .loading-container {
    text-align: center;
    padding: 2rem;
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: 1rem;
  }
  
  .loading, .error {
    text-align: center;
    padding: 1rem;
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
  
  .share-button-container {
    position: relative;
    display: inline-block;
  }

  /* Copy feedback styling */
  .copy-feedback {
    position: absolute;
    top: 100%;
    right: 0;
    transform: none;
    white-space: nowrap;
    font-size: 14px;
    color: var(--dark-80);
    background-color: #f5f6f6;
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
    .essay-header-row {
      margin-bottom: 30px;
    }
  }
  
  @media (max-width: 768px) {
    .essay-date {
      font-size: 12px;
    }

    .essay-header-row {
      margin-bottom: 40px;
    }
  }
</style> 