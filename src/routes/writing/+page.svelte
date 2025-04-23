<script>
  import { onMount } from "svelte";
  import { metadata } from "$lib/stores/metadataStore";
  import { fade } from "svelte/transition";
  import InteractionButton from "$lib/components/shared/InteractionButton.svelte";
  import { 
    subscribeToInteractions, 
    toggleLike, 
    recordShare, 
    isLiked,
    initializeInteractions,
    ContentType,
    getEssayInteractionCounts
  } from "$lib/services/essayInteractionService";

  // Essays data loaded from +page.server.js
  export let data;

  // Variables for user feedback
  let copyFeedback = "";
  let copyFeedbackEssayId = "";
  let feedbackTimeout;
  
  // Interaction state
  let interactionState = { likes: {}, shares: {}, views: {} };
  let essayLikedStatus = {};
  
  // Derived value to compute liked status for each essay
  $: essayLikedStatus = data.essays?.reduce((acc, essay) => {
    if (essay.id) {
      const key = `${ContentType.ESSAY}:${essay.id}`;
      acc[essay.id] = interactionState?.likes[key] || false;
    }
    return acc;
  }, {}) || {};

  onMount(async () => {
    metadata.set({
      title: "Writing | Wendy Ham's Weekend Projects",
      description:
        "Thoughts about creating software that quietly complements our lives.",
      canonicalUrl: "https://xnham.com/writing",
      type: "website",
      url: window.location.href,
    });

    // Initialize interaction system with try/catch to identify issues
    try {
      console.log('Initializing interactions on writing list page');
      const deviceId = await initializeInteractions();
      console.log('Interactions initialized with device ID:', deviceId);
      
      if (!deviceId) {
        console.error('Failed to initialize interactions - no device ID returned');
      }
      
      // Subscribe to interaction state changes
      const unsubscribe = subscribeToInteractions((state) => {
        console.log('Interaction state updated', state);
        interactionState = state;
      });
    } catch (error) {
      console.error('Error during interaction initialization:', error);
    }
    
    // Add global ESC key handler for feedback dialog
    const handleKeydown = (e) => {
      if (e.key === "Escape") {
        copyFeedback = "";
        copyFeedbackEssayId = "";
      }
    };
    
    window.addEventListener("keydown", handleKeydown);
    
    return () => {
      unsubscribe();
      window.removeEventListener("keydown", handleKeydown);
      if (feedbackTimeout) clearTimeout(feedbackTimeout);
    };
  });

  // Handle like button clicks
  async function handleLike(essayId) {
    console.log('handleLike called with essayId:', essayId);
    try {
      // Find the essay
      const essay = data.essays.find(e => e.id === essayId);
      if (!essay) return;
      
      // Determine if it's currently liked
      const key = `${ContentType.ESSAY}:${essayId}`;
      const currentlyLiked = interactionState?.likes[key] || false;
      
      // Update the count optimistically
      const increment = !currentlyLiked ? 1 : -1;
      const oldCount = essay.like_count || 0;
      const newCount = Math.max(0, oldCount + increment);
      
      // Update UI immediately - needs to be forced with assignment
      essay.like_count = newCount;
      console.log(`Optimistic update - like count for essay ${essayId}: ${oldCount} → ${newCount}`);
      
      // Toggle the like in the database
      await toggleLike(essayId);
      
      // After toggling, we can update the counts from the database
      // This helps ensure our UI is accurate
      try {
        const counts = await getEssayInteractionCounts(essayId);
        console.log(`Database counts for essay ${essayId}:`, counts);
        // Force UI update by creating a new object
        data.essays = data.essays.map(e => {
          if (e.id === essayId) {
            return {
              ...e,
              like_count: counts.likeCount,
              share_count: counts.shareCount,
              view_count: counts.viewCount
            };
          }
          return e;
        });
      } catch (error) {
        console.error("Error refreshing essay counts:", error);
      }
    } catch (error) {
      console.error("Error toggling like:", error);
      
      // If there was an error, we can revert the UI
      const essay = data.essays.find(e => e.id === essayId);
      if (essay) {
        const key = `${ContentType.ESSAY}:${essayId}`;
        const currentlyLiked = interactionState?.likes[key] || false;
        const increment = currentlyLiked ? 1 : -1;
        essay.like_count = Math.max(0, (essay.like_count || 0) - increment);
      }
    }
  }

  // Handle share button clicks
  async function handleShare(essay) {
    try {
      if (!essay.id) return;
      
      // Create the share URL
      const shareUrl = `${window.location.origin}/writing/${essay.slug}`;
      
      // Copy to clipboard
      await navigator.clipboard.writeText(shareUrl);
      
      // Update count optimistically
      const oldShareCount = essay.share_count || 0;
      const newShareCount = oldShareCount + 1;
      
      // Update UI immediately
      essay.share_count = newShareCount;
      console.log(`Optimistic update - share count for essay ${essay.id}: ${oldShareCount} → ${newShareCount}`);
      
      // Show feedback
      copyFeedback = "URL copied to clipboard!";
      copyFeedbackEssayId = essay.id;
      
      if (feedbackTimeout) clearTimeout(feedbackTimeout);
      feedbackTimeout = setTimeout(() => {
        copyFeedback = "";
        copyFeedbackEssayId = "";
      }, 3000);
      
      // Record the share in the database
      await recordShare(essay.id);
      
      // Refresh the counts
      try {
        const counts = await getEssayInteractionCounts(essay.id);
        console.log(`Database counts for essay ${essay.id}:`, counts);
        
        // Force UI update by creating a new object
        data.essays = data.essays.map(e => {
          if (e.id === essay.id) {
            return {
              ...e,
              like_count: counts.likeCount,
              share_count: counts.shareCount,
              view_count: counts.viewCount
            };
          }
          return e;
        });
      } catch (error) {
        console.error("Error refreshing essay counts:", error);
      }
    } catch (error) {
      console.error("Error sharing essay:", error);
      copyFeedback = "Failed to copy URL";
      copyFeedbackEssayId = essay.id;
      feedbackTimeout = setTimeout(() => {
        copyFeedback = "";
        copyFeedbackEssayId = "";
      }, 3000);
      
      // If there was an error, revert the UI
      if (essay) {
        essay.share_count = Math.max(0, (essay.share_count || 0) - 1);
      }
    }
  }

  // Format date helper - copied from original Essays.svelte
  function formatDate(dateString) {
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
  
  // Helper to format the counters string
  function formatCounters(essay) {
    const likes = essay.like_count || 0;
    const shares = essay.share_count || 0;
    
    // No likes or shares
    if (likes === 0 && shares === 0) {
      return "";
    }
    
    // Only likes
    if (likes > 0 && shares === 0) {
      return `${likes} ${likes === 1 ? 'like' : 'likes'}`;
    }
    
    // Only shares
    if (likes === 0 && shares > 0) {
      return `${shares} ${shares === 1 ? 'share' : 'shares'}`;
    }
    
    // Both likes and shares
    return `${likes} ${likes === 1 ? 'like' : 'likes'} & ${shares} ${shares === 1 ? 'share' : 'shares'}`;
  }
</script>

<svelte:head>
  <title>Writing | Wendy Ham's Weekend Projects</title>
  <meta
    name="description"
    content="Thoughts about creating software that quietly complements our lives."
  />
  <link rel="canonical" href="https://xnham.com/writing" />
</svelte:head>

<main class="container">
  <h2 class="small-bottom-margin">
    Thoughts about <span class="purple">Software.</span>
  </h2>

  <div class="writing-intro">
    <p>
      How do our natural behaviors and cognitive patterns uncover opportunities
      to rethink software design and create tools that <span class="small-font"
        >quietly</span
      > complement our lives?
    </p>
  </div>

  <div class="essays">
    {#if !data.essays || data.essays.length === 0}
      <div class="no-essays">
        <p>No essays found. Please check your database connection or create some essays.</p>
        <div class="debug-actions">
          <button on:click={() => console.log('Essays data:', data?.essays || 'None')}>
            Debug Essays Data
          </button>
        </div>
      </div>
    {:else}
      {#each data.essays as essay}
        <div class="essay-card">
          <a href="/writing/{essay.slug}" class="essay-card-link">
            <div class="essay-content">
              <p class="essay-date">{formatDate(essay.date)}</p>
              <h3 class="essay-title">{essay.title}</h3>
              <p class="essay-description">
                {#if essay.excerpt}
                  {essay.excerpt}
                {:else}
                  {essay.description}
                {/if}
              </p>
              <span class="read-more"
                ><span class="read-more-text">Read more</span> &gt;</span
              >
            </div>
          </a>
          <div class="essay-interaction-container">
            <div class="essay-buttons">
              <InteractionButton 
                type="like"
                active={essayLikedStatus[essay.id] || false}
                count={undefined}
                on:click={(e) => {
                  console.log('Like button clicked in list view for:', essay.id);
                  handleLike(essay.id);
                }}
              />

              <div class="share-button-container">
                <InteractionButton 
                  type="share"
                  active={false}
                  count={undefined}
                  on:click={(e) => {
                    console.log('Share button clicked in list view for:', essay.id);
                    handleShare(essay);
                  }}
                />
                
                {#if copyFeedback && copyFeedbackEssayId === essay.id}
                  <div class="copy-feedback" transition:fade={{ duration: 150 }}>
                    {copyFeedback}
                  </div>
                {/if}
              </div>
            </div>

            <div class="essay-counters">
              {#if essay.id}
                {formatCounters(essay)}
              {/if}
            </div>
          </div>
        </div>
      {/each}
    {/if}
  </div>
</main>

<style>
  .writing-intro {
    width: 75%;
    margin-bottom: 80px;
  }

  .small-font {
    font-size: 12px;
  }

  /* Essays list styling - copied from original Essays.svelte */
  /* Main layout */
  .essays {
    display: flex;
    flex-direction: column;
    gap: 60px;
    width: 75%;
  }

  /* Essay card styles */
  .essay-card {
    overflow: visible;
    border-left: 1px solid var(--dark-100);
  }

  .essay-card-link {
    display: block;
    text-decoration: none;
    color: inherit;
    cursor: pointer;
  }

  .essay-content {
    padding: 0 0 20px 20px;
    border-bottom: 1px solid var(--dark-100);
  }

  .essay-interaction-container {
    display: flex;
    flex-direction: row;
    padding: 10px 0 10px 20px;
    align-items: flex-start;
    position: relative;
  }

  .essay-date {
    text-transform: uppercase;
    letter-spacing: 0.1rem;
    color: var(--dark-70);
    font-size: 12px;
    font-weight: 400;
  }

  .essay-title {
    font-family: "DM Serif Text", serif;
    font-size: 24px;
    color: var(--dark-100);
  }

  .read-more {
    display: inline-block;
    margin-top: 10px;
    color: var(--dark-80);
    font-size: 14px;
    font-weight: 400;
  }

  .read-more-text {
    text-decoration: underline;
  }

  .read-more:hover {
    opacity: 0.8;
  }

  /* Animations */
  @keyframes heartPulse {
    0% {
      transform: scale(1);
    }
    50% {
      transform: scale(1.3);
    }
    100% {
      transform: scale(1);
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

  /* Responsive styles */
  @media (max-width: 768px) {
    .essays {
      width: 100%;
    }
  }

  .essay-buttons {
    display: flex;
    flex-direction: row;
  }

  .essay-counters {
    text-align: right;
    justify-content: flex-end;
    font-size: 14px;
    color: var(--dark-80);
    margin-left: auto;
  }

  /* No essays section */
  .no-essays {
    width: 100%;
    padding: 40px;
    background-color: #f9f9f9;
    border-radius: 8px;
    text-align: center;
  }

  .debug-actions {
    margin-top: 20px;
  }

  .debug-actions button {
    background-color: #333;
    color: white;
    border: none;
    padding: 8px 16px;
    border-radius: 4px;
    cursor: pointer;
    font-size: 14px;
  }

  .debug-actions button:hover {
    background-color: #555;
  }

  /* Responsive adjustments */

  @media (max-width: 768px) {
    .writing-intro {
      width: 100%;
      margin-bottom: 60px;
    }
  }
</style>