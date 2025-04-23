<script lang="ts">
  import { onMount, createEventDispatcher } from "svelte";
  import { fade } from "svelte/transition";
  import { supabase } from "$lib/supabase";
  import { browser } from "$app/environment";
  import InteractionButton from "$lib/components/shared/InteractionButton.svelte";
  import {
    subscribeToInteractions,
    toggleLike,
    recordShare,
    isLiked,
    initializeInteractions,
    ContentType,
    getEssayInteractionCounts,
  } from "$lib/services/essayInteractionService";

  // Import EssayMetadata type
  import type { EssayMetadata } from "$lib/utils/essays";

  // Accept preloaded essays from the server
  export let preloadedEssays: EssayMetadata[] = [];
  export let serverError: string | null = null;

  // Set up event dispatcher for errors
  const dispatch = createEventDispatcher<{
    error: any;
  }>();

  // Replace essays prop with local state
  let essays: EssayMetadata[] = preloadedEssays || []; // Initialize with preloaded data immediately
  let loading = !preloadedEssays.length; // Only show loading if no preloaded data
  let loadError: string | null = serverError;

  // Variables for user feedback
  let copyFeedback = "";
  let copyFeedbackEssayId = "";
  let feedbackTimeout: ReturnType<typeof setTimeout> | null = null;

  // Define interface for interaction state
  interface InteractionState {
    likes: Record<string, boolean>;
    shares: Record<string, number>;
    views: Record<string, boolean>;
  }

  // Interaction state
  let interactionState: InteractionState = { likes: {}, shares: {}, views: {} };
  let essayLikedStatus: Record<string, boolean> = {};

  // Derived value to compute liked status for each essay
  $: essayLikedStatus =
    essays?.reduce((acc: Record<string, boolean>, essay: EssayMetadata) => {
      if (essay.id) {
        const key = `${ContentType.ESSAY}:${essay.id}`;
        acc[essay.id] = interactionState?.likes[key] || false;
      }
      return acc;
    }, {}) || {};

  // Function to format date for display
  function formatDate(dateStr: string) {
    if (!dateStr) return "";

    try {
      const date = new Date(dateStr);
      return date.toLocaleDateString("en-US", {
        year: "numeric",
        month: "long",
        day: "numeric",
      });
    } catch (e) {
      console.error("Error formatting date:", e);
      return dateStr;
    }
  }

  // Format the counters for display
  function formatCounters(essay: EssayMetadata) {
    const likes = essay.like_count || 0;
    const shares = essay.share_count || 0;
    const views = essay.view_count || 0;

    let countersText = "";

    if (likes > 0) {
      countersText += `${likes} ${likes === 1 ? "like" : "likes"}`;
    }

    if (shares > 0) {
      if (countersText) countersText += " · ";
      countersText += `${shares} ${shares === 1 ? "share" : "shares"}`;
    }

    if (views > 0) {
      if (countersText) countersText += " · ";
      countersText += `${views} ${views === 1 ? "view" : "views"}`;
    }

    return countersText || "No interactions yet";
  }

  // Function to load essays from Supabase (only if needed)
  async function loadEssays() {
    // Skip loading if we already have essays from preloading
    if (preloadedEssays.length > 0) {
      console.log("Using preloaded essays, skipping client-side fetch");
      return;
    }

    try {
      console.log("Loading essays from Supabase...");

      // Fetch essays from Supabase
      const { data: supabaseEssays, error } = await supabase
        .from("essays")
        .select(
          `
          id, title, description, date, published, excerpt, slug,
          like_count, share_count, view_count
        `,
        )
        .eq("published", true)
        .order("date", { ascending: false });

      if (error) {
        throw error;
      }

      console.log(
        `Successfully loaded ${supabaseEssays?.length || 0} essays from Supabase`,
      );

      // Update the essays array
      essays = supabaseEssays || [];
      loading = false;
    } catch (error) {
      console.error("Error loading essays:", error);
      loadError =
        error instanceof Error ? error.message : "Failed to load essays";
      loading = false;
      dispatch("error", error);
    }
  }

  // Function to handle the like button
  async function handleLike(essayId: string) {
    if (!browser || !essayId) return;

    console.log(`Like button clicked for essay: ${essayId}`);

    try {
      // Toggle the like status in the interaction service
      const newLikeStatus = await toggleLike(essayId);
      console.log(`New like status for essay ${essayId}:`, newLikeStatus);
    } catch (error) {
      console.error(`Error toggling like for essay ${essayId}:`, error);
      dispatch("error", error);
    }
  }

  // Function to handle the share button and copy the URL
  async function handleShare(essay: EssayMetadata) {
    if (!browser || !essay?.id || !essay?.slug) return;

    console.log(`Share button clicked for essay: ${essay.id}`);

    // Create the URL to share
    const url = `https://xnham.com/writing/${essay.slug}`;

    try {
      // Try to use the Web Share API if available
      if (navigator.share) {
        await navigator.share({
          title: essay.title,
          text: essay.description || essay.excerpt || "Check out this essay",
          url: url,
        });

        console.log("Successfully shared via Web Share API");
        copyFeedback = "Shared!";
      } else {
        // Fall back to clipboard copy
        await navigator.clipboard.writeText(url);
        console.log("URL copied to clipboard");
        copyFeedback = "Link copied!";
      }

      // Store the essay ID we're showing feedback for
      copyFeedbackEssayId = essay.id;

      // Record the share in the interaction service
      await recordShare(essay.id);

      // Clear the feedback after a delay
      if (feedbackTimeout) {
        clearTimeout(feedbackTimeout);
      }

      feedbackTimeout = setTimeout(() => {
        copyFeedback = "";
        copyFeedbackEssayId = "";
      }, 2000);
    } catch (error) {
      console.error("Error sharing essay:", error);
      copyFeedback = "Error sharing";
      copyFeedbackEssayId = essay.id;

      // Clear error feedback after a delay
      if (feedbackTimeout) {
        clearTimeout(feedbackTimeout);
      }

      feedbackTimeout = setTimeout(() => {
        copyFeedback = "";
        copyFeedbackEssayId = "";
      }, 2000);

      dispatch("error", error);
    }
  }

  onMount(() => {
    if (!browser) return;

    // Initialize interaction system with try/catch to identify issues
    console.log("Initializing interactions on Essays component");

    // Create a reference to hold the unsubscribe function and timer
    let unsubscribe: () => void = () => {};
    let initTimer: ReturnType<typeof setTimeout> | null = null;

    try {
      // Add a small delay before initializing interactions to allow SPA routing to complete
      initTimer = setTimeout(async () => {
        try {
          // Initialize interactions
          const deviceId = await initializeInteractions();
          console.log("Interactions initialized with device ID:", deviceId);

          if (!deviceId) {
            console.error(
              "Failed to initialize interactions - no device ID returned",
            );
            dispatch("error", new Error("Failed to initialize interactions"));
            return;
          }

          // Load essays data if needed
          await loadEssays();

          // Subscribe to interaction updates
          unsubscribe = subscribeToInteractions((state: InteractionState) => {
            console.log("Interaction state updated", state);
            interactionState = state;
          });
        } catch (error) {
          console.error(
            "Error during delayed interaction initialization:",
            error,
          );
          dispatch("error", error);
        }
      }, 300); // 300ms delay to ensure SPA routing is complete

      // Add global ESC key handler for feedback dialog
      const handleKeydown = (e: KeyboardEvent) => {
        if (e.key === "Escape") {
          copyFeedback = "";
          copyFeedbackEssayId = "";
        }
      };

      window.addEventListener("keydown", handleKeydown);

      // Return the cleanup function
      return () => {
        if (unsubscribe) {
          unsubscribe();
        }

        if (initTimer) {
          clearTimeout(initTimer);
        }

        if (feedbackTimeout) {
          clearTimeout(feedbackTimeout);
        }

        window.removeEventListener("keydown", handleKeydown);
      };
    } catch (error) {
      console.error("Error in Essays component onMount:", error);
      dispatch("error", error);
    }
  });
</script>

<div class="essays">
  {#if loading}
    <div class="loading-state">
      <p>Loading essays...</p>
    </div>
  {:else if loadError}
    <div class="error-state">
      <p>Error: {loadError}</p>
    </div>
  {:else if essays.length === 0}
    <div class="no-essays">
      <p>No essays found. Check back soon!</p>
    </div>
  {:else}
    {#each essays as essay}
      <div class="essay-card">
        <a
          href="/writing/{essay.slug}"
          class="essay-card-link"
          data-sveltekit-preload-data="off"
        >
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
                console.log("Like button clicked in list view for:", essay.id);
                handleLike(essay.id);
              }}
            />

            <div class="share-button-container">
              <InteractionButton
                type="share"
                active={false}
                count={undefined}
                on:click={(e) => {
                  console.log(
                    "Share button clicked in list view for:",
                    essay.id,
                  );
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

<style>
  /* Essays list styling */
  /* Main layout */
  .essays {
    display: flex;
    flex-direction: column;
    gap: 60px;
    width: 100%;
  }

  /* Loading and error states */
  .loading-state,
  .error-state {
    padding: 2rem;
    text-align: center;
    font-size: 1.2rem;
    color: var(--dark-60);
    width: 100%;
    max-width: 600px;
    margin: 40px 0;
  }

  .error-state {
    color: var(--dark-pink-100);
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

  .essay-buttons {
    display: flex;
    flex-direction: row;
    gap: 28px;
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

  /* Responsive adjustments */
  @media (max-width: 768px) {
    .essays {
      width: 100%;
    }
  }

  @media (max-width: 576px) {
    /* Hide counters on mobile */
    .essay-counters {
      display: none;
    }
  }
</style>
