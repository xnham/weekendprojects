<script lang="ts">
  import { onMount, createEventDispatcher } from "svelte";
  import { fade } from "svelte/transition";
  import { page } from "$app/stores";
  import { supabase } from "$lib/supabase";
  import { browser } from '$app/environment';
  import InteractionButton from "$lib/components/shared/InteractionButton.svelte";
  import {
    subscribeToInteractions,
    toggleLike,
    recordShare,
    recordView,
    isLiked,
    initializeInteractions,
    ContentType,
    getEssayInteractionCounts,
  } from "$lib/services/essayInteractionService";

  // Set up event dispatcher for errors
  const dispatch = createEventDispatcher<{
    error: any;
  }>();

  // Accept both slug from params and preloaded essay data
  export let slug: string = "";
  export let preloadedEssay: any = null;
  export let serverError: string | null = null;

  // Local state for essay data
  let essay: any = preloadedEssay;
  let content: any = preloadedEssay?.content || null;
  let loading = !preloadedEssay; // Only show loading if no preloaded data
  let error: string | null = serverError;

  // Interaction state
  let interactionState: Record<string, any> = { likes: {}, shares: {}, views: {} };
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

  // Only reload the essay when the slug changes and there's no preloaded data
  $: if (slug && !preloadedEssay) {
    // Use a separate flag to prevent reloading in infinite loop
    if (!essay?.slug || essay.slug !== slug) {
      console.log(`Slug changed to ${slug}, loading essay data`);
      loadEssayData(slug);
    }
  }

  // Format date helper
  function formatDate(dateString: string) {
    if (!dateString) return "";
    
    try {
      const date = new Date(dateString);
      return date.toLocaleDateString("en-US", {
        year: "numeric",
        month: "long",
        day: "numeric",
      });
    } catch (e) {
      console.error("Error formatting date:", e);
      return dateString;
    }
  }

  // Helper functions for getting interaction counts
  function getEssayLikes() {
    return isOptimistic ? optimisticLikeCount : (essay?.like_count || 0);
  }
  
  function getEssayShares() {
    return isOptimistic ? optimisticShareCount : (essay?.share_count || 0);
  }
  
  function getEssayViews() {
    return isOptimistic ? optimisticViewCount : (essay?.view_count || 0);
  }

  // Function to load essay data from Supabase
  async function loadEssayData(essaySlug: string) {
    // Skip loading if we already have essay data from preloading
    if (preloadedEssay) {
      console.log('Using preloaded essay data, skipping client-side fetch');
      return;
    }
    
    if (!essaySlug) return;

    try {
      loading = true;
      error = null;
      console.log(`Loading essay with slug: ${essaySlug}`);

      // Fetch the essay data from Supabase
      const { data: essayData, error: essayError } = await supabase
        .from("essays")
        .select(
          `
          id, title, description, date, published, excerpt, slug,
          like_count, share_count, view_count, content
        `,
        )
        .eq("slug", essaySlug)
        .single();

      if (essayError) {
        console.error(`Error fetching essay: ${essayError.message}`);
        throw new Error(`Failed to load essay: ${essayError.message}`);
      }

      if (!essayData) {
        throw new Error(`No essay found with slug: ${essaySlug}`);
      }

      // Check if essay is published (except in development mode)
      if (essayData.published === false && import.meta.env.DEV !== true) {
        throw new Error("This essay is not yet published");
      }

      console.log(`Essay loaded: ${essayData.title}`);

      // Set the essay data and content
      essay = essayData;
      content = essayData.content;

      // Reset initialization flag to trigger reactive updates
      hasInitialisedCounts = false;

      // Initialize interactions after we have the essay data
      await initializePage();
    } catch (err) {
      console.error("Error loading essay:", err);
      error = err instanceof Error ? err.message : "Failed to load essay";
      dispatch("error", err);
    } finally {
      loading = false;
    }
  }

  // Separate async function for initializing the page
  async function initializePage() {
    if (!browser) return;
    
    try {
      // Initialize interaction system first
      console.log("Initializing interactions on Essay component");
      const deviceId = await initializeInteractions();
      console.log(
        "Interactions initialized on Essay with device ID:",
        deviceId,
      );

      if (!deviceId) {
        console.error(
          "Failed to initialize interactions on Essay - no device ID returned",
        );
        dispatch("error", new Error("Failed to initialize interactions"));
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
          console.error(
            `Error recording view for essay ${essay.id}:`,
            viewError,
          );
          // Even if there's an error, we'll keep the optimistic view count
          // since the user did view the essay
        }
      }
    } catch (error) {
      console.error("Error during Essay interaction initialization:", error);
      dispatch("error", error);
    }
  }

  // Handle like button clicks
  async function handleLike() {
    if (!browser || !essay?.id) return;
    
    try {
      console.log(`Like button clicked for essay ${essay.id}`);
      
      // Get current like state and calculate new optimistic count
      const currentlyLiked = likedByUser;
      const oldCount = getEssayLikes();
      const increment = currentlyLiked ? -1 : 1;
      optimisticLikeCount = Math.max(0, oldCount + increment);
      
      // Update local state immediately for responsive UI
      likedByUser = !currentlyLiked;
      
      // Toggle like in the database
      const newLikeStatus = await toggleLike(essay.id);
      console.log(`New like status after toggle: ${newLikeStatus}`);
      
      // If there's a mismatch between our prediction and actual state, adjust
      if (newLikeStatus !== likedByUser) {
        console.log('Correcting optimistic like status due to mismatch');
        likedByUser = newLikeStatus;
        
        // Adjust count if needed
        const adjustment = newLikeStatus ? 1 : -1;
        optimisticLikeCount = Math.max(0, getEssayLikes() + adjustment);
      }
    } catch (error) {
      console.error(`Error toggling like for essay ${essay.id}:`, error);
      
      // Revert to original state on error
      likedByUser = !likedByUser;
      
      // Revert count
      const increment = likedByUser ? 1 : -1;
      optimisticLikeCount = Math.max(0, getEssayLikes() - increment);
      
      dispatch('error', error);
    }
  }
  
  // Handle share button clicks
  async function handleShare() {
    if (!browser || !essay?.id) return;
    
    console.log(`Share button clicked for essay ${essay.id}`);
    
    // Create URL to share
    const url = typeof window !== 'undefined' 
      ? window.location.href 
      : `https://xnham.com/writing/${essay.slug}`;
    
    try {
      // Try to use the Web Share API if available
      if (navigator.share) {
        await navigator.share({
          title: essay.title,
          text: essay.description || essay.excerpt || 'Check out this essay',
          url: url
        });
        
        console.log('Successfully shared via Web Share API');
        copyFeedback = 'Shared!';
      } else {
        // Fall back to clipboard copy
        await navigator.clipboard.writeText(url);
        console.log('URL copied to clipboard');
        copyFeedback = 'Link copied!';
      }
      
      // Update optimistic count
      optimisticShareCount = getEssayShares() + 1;
      
      // Record the share in the database
      await recordShare(essay.id);
      
      // Clear feedback after a delay
      if (copyFeedbackTimeout) {
        clearTimeout(copyFeedbackTimeout);
      }
      
      copyFeedbackTimeout = setTimeout(() => {
        copyFeedback = '';
      }, 2000);
    } catch (error) {
      console.error('Error sharing essay:', error);
      
      copyFeedback = 'Error sharing';
      
      // Clear feedback after a delay
      if (copyFeedbackTimeout) {
        clearTimeout(copyFeedbackTimeout);
      }
      
      copyFeedbackTimeout = setTimeout(() => {
        copyFeedback = '';
      }, 2000);
      
      dispatch('error', error);
    }
  }

  // Get URL for use in metadata
  $: essayUrl =
    typeof window !== "undefined"
      ? window.location.href
      : essay?.slug
        ? `https://xnham.com/writing/${essay.slug}`
        : "";

  // Create a reactive combined description
  $: combinedDescription =
    essay?.description && essay?.excerpt
      ? `${essay.description} ${essay.excerpt}`
      : essay?.description || essay?.excerpt || "";

  // Generate Article-specific JSON-LD
  $: articleJsonLd = essay
    ? {
        "@context": "https://schema.org",
        "@type": "Article",
        headline: essay.title,
        description: combinedDescription,
        datePublished: essay.date,
        author: {
          "@type": "Person",
          name: "Wendy Ham",
          url: "https://xnham.com",
        },
        publisher: {
          "@type": "Person",
          name: "Wendy Ham",
          url: "https://xnham.com",
        },
        mainEntityOfPage: {
          "@type": "WebPage",
          "@id": essayUrl,
        },
      }
    : null;

  onMount(() => {
    if (!browser) return;
    
    let unsubscribe: () => void = () => {};
    let initTimer: ReturnType<typeof setTimeout> | null = null;

    try {
      // Use slug from props or from URL parameter
      const essaySlug = slug || $page?.params?.slug;
      console.log(`Essay component mounted with slug: ${essaySlug}`);

      // Only load if slug is provided, no preloaded data, and essay isn't already loaded
      if (essaySlug && !preloadedEssay && (!essay || essay.slug !== essaySlug)) {
        loadEssayData(essaySlug);
      } else if (preloadedEssay) {
        // If we have preloaded data, initialize the page with it
        initializePage();
      }

      // Add a small delay before initializing interactions to allow SPA routing to complete
      initTimer = setTimeout(async () => {
        try {
          // Subscribe to interaction state changes
          unsubscribe = subscribeToInteractions((state) => {
            interactionState = state;
            
            // Update like status when interaction state changes
            if (essay?.id) {
              const key = `${ContentType.ESSAY}:${essay.id}`;
              likedByUser = interactionState?.likes[key] || false;
            }
          });
        } catch (err) {
          console.error("Error in delayed initialization:", err);
          dispatch("error", err);
        }
      }, 300);

      // Return cleanup function
      return () => {
        if (unsubscribe) {
          unsubscribe();
        }
        
        if (initTimer) {
          clearTimeout(initTimer);
        }
        
        if (copyFeedbackTimeout) {
          clearTimeout(copyFeedbackTimeout);
        }
      };
    } catch (err) {
      console.error("Error in Essay onMount:", err);
      dispatch("error", err);
    }
  });
</script>

<!-- Add Article-specific structured data -->
<svelte:head>
  {#if essay && articleJsonLd}
    <title>{essay.title} | Wendy Ham's Weekend Projects</title>
    <meta name="description" content={combinedDescription} />
    <link rel="canonical" href={essayUrl} />

    <script type="application/ld+json">
      {JSON.stringify(articleJsonLd)}
    </script>

    <!-- Open Graph -->
    <meta property="og:type" content="article" />
    <meta property="og:url" content={essayUrl} />
    <meta
      property="og:title"
      content={`${essay.title} | Wendy Ham's Weekend Projects`}
    />
    <meta property="og:description" content={combinedDescription} />
    <meta property="og:image" content="https://xnham.com/images/og-image.png" />
  {/if}
</svelte:head>

<article>
  {#if loading}
    <div class="loading">Loading essay...</div>
  {:else if error}
    <div class="error">{error}</div>
  {:else if !essay}
    <div class="error">Essay not found</div>
  {:else}
    <slot name="before-essay"></slot>

    <div class="essay-container">
      <div class="essay-header-row">
        <p class="essay-date">{formatDate(essay.date)}</p>
        <div class="essay-buttons">
          <InteractionButton
            type="like"
            active={likedByUser}
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

      <h2 class="essay-title">{essay.title}</h2>
      <p class="essay-description">{essay.description}</p>

      <div class="content">
        {#if content}
          {@html content}
        {:else}
          <slot name="content-actions"></slot>
        {/if}
      </div>
    </div>

    <div class="essay-stats">
      <span class="essay-stat"
        >{getEssayLikes()} {getEssayLikes() === 1 ? "like" : "likes"}</span
      >
      <span class="essay-stat"
        >{getEssayShares()} {getEssayShares() === 1 ? "share" : "shares"}</span
      >
      <span class="essay-stat"
        >{getEssayViews()} {getEssayViews() === 1 ? "view" : "views"}</span
      >
    </div>

    <slot name="after-essay"></slot>
  {/if}
</article>

<style>
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

  .content :global(h2) {
    font-size: 48px;
    margin-bottom: 60px;
    line-height: 1.1;
  }

  .content :global(h3) {
    font-size: 24px;
    line-height: 1.3;
    margin-top: 0;
    margin-bottom: 10px;
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

  .loading,
  .error {
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
    article {
      width: 100%;
    }

    .essay-date {
      font-size: 12px;
    }

    .essay-header-row {
      margin-bottom: 40px;
    }
  }
</style>

