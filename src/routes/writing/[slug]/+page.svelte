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
    isLiked,
    initializeInteractions,
    ContentType
  } from '$lib/services/essayInteractionService';
  
  // Access the essay data loaded by the page.server.js file
  export let data;
  
  // Interaction state
  let interactionState = { likes: {}, shares: {}, views: {} };
  let likedByUser = false;
  let copyFeedback = "";
  let copyFeedbackTimeout;
  
  // State for client-side content loading
  let isLoadingContent = false;
  let contentLoadError = null;
  
  // Optimistic count tracking
  let optimisticLikeCount = 0;
  let optimisticShareCount = 0;
  let optimisticViewCount = 0;
  let isOptimistic = false;
  
  // Update when essay data changes
  $: if (data?.essay) {
    optimisticLikeCount = data.essay.like_count || 0;
    optimisticShareCount = data.essay.share_count || 0;
    optimisticViewCount = data.essay.view_count || 0;
    isOptimistic = false;
  }
  
  // Scroll UI variables
  let showFloatingButton = false;
  let buttonVisible = false;
  let hideTimeout = null;
  let isScrolling = false;
  
  // Create a reactive combined description
  $: combinedDescription = data?.essay?.description && data?.essay?.excerpt
    ? `${data.essay.description} ${data.essay.excerpt}`
    : data?.essay?.description || data?.essay?.excerpt || "";
    
  // Get URL for use in metadata (safely works in both client and server contexts)
  $: essayUrl = typeof window !== 'undefined' 
    ? window.location.href 
    : `https://xnham.com/writing/${$page.params.slug}`;
  
  // Generate Article-specific JSON-LD 
  $: articleJsonLd = data?.essay ? {
    "@context": "https://schema.org",
    "@type": "Article",
    "headline": data.essay.title,
    "description": combinedDescription,
    "datePublished": data.essay.date,
    "author": {
      "@type": "Person",
      "name": "Wendy Ham",
      "url": "https://xnham.com"
    },
    "publisher": {
      "@type": "Person",
      "name": "Wendy Ham",
      "url": "https://xnham.com"
    },
    "mainEntityOfPage": {
      "@type": "WebPage",
      "@id": essayUrl
    }
  } : null;

  // Function to load content on the client side if needed
  async function loadContentClientSide() {
    if (!data.essay || isLoadingContent) return;
    
    isLoadingContent = true;
    contentLoadError = null;
    
    try {
      console.log(`Loading content for ${data.essay.slug} on the client side`);
      
      // Fetch the essay's content from Supabase
      const { supabase } = await import('$lib/supabase');
      
      const { data: essayData, error } = await supabase
        .from('essays')
        .select('content')
        .eq('slug', data.essay.slug)
        .single();
      
      if (error) {
        throw new Error(`Failed to fetch content: ${error.message}`);
      }
      
      if (!essayData || !essayData.content) {
        throw new Error('No content available for this essay');
      }
      
      console.log(`Content loaded, length: ${essayData.content.length}`);
      
      // Update the data object to include the content
      data = {
        ...data,
        content: essayData.content
      };
    } catch (err) {
      console.error('Error loading content on client side:', err);
      contentLoadError = err.message;
    } finally {
      isLoadingContent = false;
    }
  }
  
  onMount(async () => {
    try {
      // Initialize interaction system first
      console.log('Initializing interactions on single essay page');
      const deviceId = await initializeInteractions();
      console.log('Interactions initialized on single essay with device ID:', deviceId);
      
      if (!deviceId) {
        console.error('Failed to initialize interactions on single essay - no device ID returned');
      }
      
      // If content is null, try to load it on the client side
      if (data.content === null) {
        console.log('Content is null, loading on client side');
        // Add a short delay to ensure the component is fully mounted
        setTimeout(() => {
          loadContentClientSide();
        }, 100);
      }
      
      // Set metadata for the essay
      if (data.essay) {
        metadata.set({
          title: `${data.essay.title} | Wendy Ham's Weekend Projects`,
          description: combinedDescription,
          canonicalUrl: `https://xnham.com/writing/${$page.params.slug}`,
          type: "article",
          url: essayUrl,
          image: "/images/og-image.png"
        });
        
        // Check if essay is already liked
        if (data.essay.id) {
          const isAlreadyLiked = isLiked(data.essay.id);
          console.log(`Essay ${data.essay.id} already liked:`, isAlreadyLiked);
          likedByUser = isAlreadyLiked;
          
          // Record view
          try {
            await recordView(data.essay.id);
            console.log(`View recorded for essay ${data.essay.id}`);
          } catch (viewError) {
            console.error(`Error recording view for essay ${data.essay.id}:`, viewError);
          }
        }
      }
    } catch (error) {
      console.error('Error during single essay interaction initialization:', error);
    }
    
    // Subscribe to interaction state changes
    const unsubscribe = subscribeToInteractions((state) => {
      interactionState = state;
      
      // Update liked status whenever the interaction state changes
      if (data.essay && data.essay.id) {
        const key = `${ContentType.ESSAY}:${data.essay.id}`;
        likedByUser = !!state.likes[key];
      }
    });
    
    // Listen for scroll events
    window.addEventListener('scroll', handleScroll);
    
    // Clean up on component destruction
    return () => {
      unsubscribe();
      window.removeEventListener('scroll', handleScroll);
      if (hideTimeout) clearTimeout(hideTimeout);
      if (copyFeedbackTimeout) clearTimeout(copyFeedbackTimeout);
    };
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
    console.log('Single essay handleLike called');
    if (!data.essay || !data.essay.id) {
      console.error("Cannot like: Missing essay ID");
      return;
    }
    
    try {
      console.log(`Toggling like for essay ID: ${data.essay.id}`);
      
      // Apply optimistic update to count and UI
      const newLikedState = !likedByUser;
      const increment = newLikedState ? 1 : -1;
      
      // Update optimistic counts
      optimisticLikeCount = Math.max(0, optimisticLikeCount + increment);
      isOptimistic = true;
      
      // Also update the UI state optimistically
      likedByUser = newLikedState;
      
      // Toggle the like in the database
      const result = await toggleLike(data.essay.id);
      console.log(`Toggle like result: ${result}`);
      
      // Database will update via subscription
    } catch (error) {
      console.error("Error toggling like:", error);
      
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
      if (!data.essay || !data.essay.id) {
        console.error("Cannot share: Missing essay ID");
        return;
      }
      
      console.log(`Sharing essay ID: ${data.essay.id}`);
      
      // Create the share URL (this only runs on client side so window is safe to use here)
      const shareUrl = `${window.location.origin}/writing/${data.essay.slug}`;
      
      // Copy to clipboard
      await navigator.clipboard.writeText(shareUrl);
      
      // Apply optimistic update to count
      optimisticShareCount += 1;
      isOptimistic = true;
      
      // Show feedback
      copyFeedback = "URL copied to clipboard!";
      
      if (copyFeedbackTimeout) clearTimeout(copyFeedbackTimeout);
      copyFeedbackTimeout = setTimeout(() => {
        copyFeedback = "";
      }, 3000);
      
      // Record the share in the database
      const result = await recordShare(data.essay.id);
      console.log(`Share recorded: ${result}`);
      
      // The database update will trigger the subscription which will update the UI
    } catch (error) {
      console.error("Error sharing essay:", error);
      copyFeedback = "Failed to copy URL";
      copyFeedbackTimeout = setTimeout(() => {
        copyFeedback = "";
      }, 3000);
      
      // Revert optimistic update on error
      optimisticShareCount = Math.max(0, optimisticShareCount - 1);
      isOptimistic = false;
    }
  }
  
  // Update these helpers to use optimistic counts when available
  function getEssayLikes() {
    return isOptimistic ? optimisticLikeCount : (data?.essay?.like_count || 0);
  }
  
  function getEssayShares() {
    return isOptimistic ? optimisticShareCount : (data?.essay?.share_count || 0);
  }
  
  function getEssayViews() {
    return isOptimistic ? optimisticViewCount : (data?.essay?.view_count || 0);
  }
</script>

<svelte:head>
  {#if data.essay}
    <title>{data.essay.title} | Wendy Ham's Weekend Projects</title>
    <meta name="description" content={combinedDescription} />
    <link rel="canonical" href={`https://xnham.com/writing/${$page.params.slug}`} />
    
    <!-- Structured data -->
    {#if articleJsonLd}
      <script type="application/ld+json">
        {JSON.stringify(articleJsonLd)}
      </script>
    {/if}
    
    <!-- Open Graph -->
    <meta property="og:type" content="article" />
    <meta property="og:url" content={essayUrl} />
    <meta property="og:title" content={`${data.essay.title} | Wendy Ham's Weekend Projects`} />
    <meta property="og:description" content={combinedDescription} />
    <meta property="og:image" content="https://xnham.com/images/og-image.png" />
  {:else}
    <title>Essay Not Found | Wendy Ham's Weekend Projects</title>
  {/if}
</svelte:head>

<!-- Container wrapper for proper layout -->
<div class="container">
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
        
        <h2 class="essay-title">{data.essay.title}</h2>
        <p class="essay-description">{data.essay.description}</p>
        
        <div class="content">
          {#if data.content === null}
            <!-- Loading state - content not yet available -->
            <div class="loading-container">
              <p class="loading">
                {isLoadingContent ? 'Loading essay content...' : 'Content not available.'}
              </p>
              
              {#if !isLoadingContent && !contentLoadError}
                <button class="load-button" on:click={loadContentClientSide}>
                  Load Content
                </button>
              {/if}
              
              {#if contentLoadError}
                <p class="error-message">Error: {contentLoadError}</p>
                <button class="load-button" on:click={loadContentClientSide}>
                  Try Again
                </button>
              {/if}
            </div>
          {:else if data.content}
            <!-- Render the HTML content from Supabase -->
            <div class="essay-content">{@html data.content}</div>
          {:else}
            <!-- Content loading failed -->
            <p class="loading error">
              Essay content could not be loaded. Please try again later.
            </p>
            <details>
              <summary>View details</summary>
              <pre>{JSON.stringify(data, null, 2)}</pre>
            </details>
          {/if}
        </div>
      </div>
      
      <!-- Essay stats -->
      <div class="essay-stats">
        <span class="essay-stat">{getEssayLikes()} {getEssayLikes() === 1 ? 'like' : 'likes'}</span>
        <span class="essay-stat">{getEssayShares()} {getEssayShares() === 1 ? 'share' : 'shares'}</span>
        <span class="essay-stat">{getEssayViews()} {getEssayViews() === 1 ? 'view' : 'views'}</span>
      </div>
    {/if}
  </article>
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
  
  .error-message {
    color: #d32f2f;
    font-size: 0.9rem;
    margin: 0.5rem 0;
  }
  
  .load-button {
    background-color: var(--dark-90);
    color: white;
    border: none;
    padding: 0.5rem 1rem;
    border-radius: 4px;
    cursor: pointer;
    font-size: 0.9rem;
    transition: background-color 0.2s;
  }
  
  .load-button:hover {
    background-color: var(--dark-100);
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