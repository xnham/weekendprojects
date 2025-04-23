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
    ContentType
  } from '$lib/services/essayInteractionService';
  
  // Access the essay data loaded by the page.server.js file
  export let data;
  
  // Interaction state
  let interactionState = { likes: {}, shares: {}, views: {} };
  let likedByUser = false;
  let copyFeedback = "";
  let copyFeedbackTimeout;
  
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
      "@id": typeof window !== 'undefined' ? window.location.href : ""
    }
  } : null;

  onMount(async () => {
    // Set metadata for the essay
    if (data.essay) {
      metadata.set({
        title: `${data.essay.title} | Wendy Ham's Weekend Projects`,
        description: combinedDescription,
        canonicalUrl: `https://xnham.com/writing/${$page.params.slug}`,
        type: "article",
        url: window.location.href,
        image: "/images/og-image.png"
      });
      
      // Record view
      if (data.essay.id) {
        await recordView(data.essay.id);
      }
    }
    
    // Subscribe to interaction state changes
    const unsubscribe = subscribeToInteractions((state) => {
      interactionState = state;
      
      // Update liked status whenever the interaction state changes
      if (data.essay) {
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
    if (!data.essay || !data.essay.id) return;
    
    try {
      // Apply optimistic update to count and UI
      const newLikedState = !likedByUser;
      const increment = newLikedState ? 1 : -1;
      
      // Update optimistic counts
      optimisticLikeCount = Math.max(0, optimisticLikeCount + increment);
      isOptimistic = true;
      
      // Also update the UI state optimistically
      likedByUser = newLikedState;
      
      // Toggle the like in the database
      await toggleLike(data.essay.id);
      
      // The database update will trigger the subscription which will update the UI
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
      if (!data.essay || !data.essay.id) return;
      
      // Create the share URL
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
      await recordShare(data.essay.id);
      
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
    <meta property="og:url" content={window.location.href} />
    <meta property="og:title" content={`${data.essay.title} | Wendy Ham's Weekend Projects`} />
    <meta property="og:description" content={combinedDescription} />
    <meta property="og:image" content="https://xnham.com/images/og-image.png" />
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
        {#if data.content && typeof data.content === 'string'}
          <!-- Handle HTML content from marked -->
          <div class="markdown-content">{@html data.content}</div>
        {:else if data.content}
          <!-- Handle any other content format -->
          <div class="content-debug">
            <p class="warning">
              Content loaded but couldn't render properly. This might be due to a markdown formatting issue.
            </p>
            <details>
              <summary>Debug info</summary>
              <pre>Content type: {typeof data.content}</pre>
              <pre>Raw content data: {JSON.stringify(data.content, null, 2)}</pre>
            </details>
          </div>
        {:else}
          <!-- No content at all -->
          <p class="loading">
            Essay content could not be loaded. Please try again later.
          </p>
          <details>
            <summary>Debug info</summary>
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
  
  .content p {
    margin-top: 0;
    margin-bottom: 1.5rem;
    font-size: 15px;
  }
  
  /* Styling for headings in essay content */
  .content h1 {
    font-size: 2rem;
    margin-top: 2rem;
    margin-bottom: 1rem;
    font-family: "DM Serif Text", serif;
  }
  
  .content h2 {
    font-size: 1.5rem;
    margin-top: 2rem;
    margin-bottom: 1rem;
    font-family: "DM Serif Text", serif;
    color: var(--dark-100);
  }
  
  .content h3 {
    font-size: 1.25rem;
    margin-top: 1.5rem;
    margin-bottom: 0.75rem;
    font-family: "DM Serif Text", serif;
    color: var(--dark-90);
  }
  
  /* Additional markdown styling */
  .content ul, .content ol {
    margin-bottom: 1.5rem;
    padding-left: 1.5rem;
  }
  
  .content li {
    margin-bottom: 0.5rem;
    font-size: 15px;
  }
  
  .content blockquote {
    border-left: 3px solid var(--dark-40);
    margin-left: 0;
    padding-left: 1rem;
    color: var(--dark-80);
    font-style: italic;
  }
  
  .content a {
    color: var(--dark-blue-100);
    text-decoration: underline;
  }
  
  .content a:hover {
    color: var(--dark-blue-120);
  }
  
  .content hr {
    border: none;
    border-top: 1px solid var(--dark-20);
    margin: 2rem 0;
  }
  
  .content strong {
    font-weight: 600;
  }
  
  .content em {
    font-style: italic;
  }
  
  .content code {
    font-family: monospace;
    background-color: var(--dark-10);
    padding: 0.2rem 0.4rem;
    border-radius: 3px;
    font-size: 0.9em;
  }
  
  /* Markdown content specific styles */
  .markdown-content {
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