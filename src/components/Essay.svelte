<script lang="ts">
  import { onMount } from 'svelte';
  import { loadEssay } from '../utils/essays';
  import type { SvelteComponent } from 'svelte';
  import type { EssayMetadata } from '../utils/essays';
  
  export let slug: string;
  
  let content: typeof SvelteComponent | null = null;
  let metadata: EssayMetadata | null = null;
  let error: string | null = null;
  let loading = true;
  let showFloatingButton = false;
  let buttonVisible = false;
  let hideTimeout: ReturnType<typeof setTimeout> | null = null;
  
  onMount(() => {
    const loadEssayData = async () => {
      loading = true;
      const result = await loadEssay(slug);
      content = result.content;
      metadata = result.metadata;
      error = result.error;
      loading = false;
    };
    
    loadEssayData();
    
    // Add scroll event listener for floating button
    window.addEventListener('scroll', handleScroll);
    
    return () => {
      window.removeEventListener('scroll', handleScroll);
      if (hideTimeout) {
        clearTimeout(hideTimeout);
      }
    };
  });
  
  function handleScroll() {
    // Determine if we've scrolled past the threshold
    const shouldShow = window.scrollY > 300;
    showFloatingButton = shouldShow;
    
    // If we should show the button
    if (shouldShow) {
      // Make button visible immediately when scrolling
      buttonVisible = true;
      
      // Clear any existing timeout
      if (hideTimeout) {
        clearTimeout(hideTimeout);
      }
      
      // Set timeout to hide button after 5 seconds of no scrolling
      hideTimeout = setTimeout(() => {
        buttonVisible = false;
      }, 4000);
    } else {
      // If we're above the threshold, don't show the button at all
      buttonVisible = false;
      if (hideTimeout) {
        clearTimeout(hideTimeout);
        hideTimeout = null;
      }
    }
  }
  
  function formatDate(dateString: string) {
    return new Date(dateString).toLocaleDateString('en-US', { 
      year: 'numeric', 
      month: 'long', 
      day: 'numeric' 
    });
  }
  
  // This function integrates with your custom router
  function goBackToWriting(event: MouseEvent) {
    event.preventDefault();
    // Change URL without page reload (matches your router implementation)
    window.history.pushState({}, '', '/writing');
    // Dispatch a custom event to notify Writing.svelte
    window.dispatchEvent(new CustomEvent('urlchange'));
    // Also dispatch popstate event to trigger listeners in Writing.svelte
    window.dispatchEvent(new PopStateEvent('popstate'));
  }
</script>

{#if loading}
  <div class="loading">Loading essay...</div>
{:else if error}
  <div class="error">
    <h1>Essay Not Found</h1>
    <p>{error}</p>
    <a href="/writing" on:click={goBackToWriting}>Back to all essays</a>
  </div>
{:else}
  <article>
    <a href="/writing" class="back-link" on:click={goBackToWriting}><span class="arrow">&lt;</span> <span class="link-text">Back to all essays</span></a>
    {#if metadata}
      <header>
        <time class="essay-date" datetime={metadata.date}>{formatDate(metadata.date)}</time>
        <h1>{metadata.title}</h1>
        <div class="metadata">
          {#if metadata.tags && metadata.tags.length > 0}
            <div class="tags">
              {#each metadata.tags as tag}
                <span class="tag">{tag}</span>
              {/each}
            </div>
          {/if}
        </div>
      </header>
    {/if}
    <div class="content">
      <svelte:component this={content} />
    </div>
  </article>
{/if}

<!-- Floating back button -->
{#if !loading && !error && showFloatingButton}
  <a href="/writing" class="floating-back-button {buttonVisible ? 'visible' : 'hidden'}" on:click={goBackToWriting}>
    Back to essays
  </a>
{/if}

<style>
  article {
    max-width: 75%;
    margin: 0;
  }

  .back-link {
    display: inline-block;
    margin-bottom: 40px;
    color: var(--dark-80);
    text-decoration: none;
    font-size: 14px;
  }

  .back-link .arrow {
    text-decoration: none;
  }

  .back-link .link-text {
    text-decoration: underline;
  }

  .back-link:hover .link-text {
    text-decoration: underline;
    opacity: 0.8;
  }

  .essay-date {
    text-transform: uppercase;
    letter-spacing: 0.05rem;
    color: var(--dark-60);
    font-size: 14px;
    font-weight: 500;
  }
  
  h1 {
    font-size: 48px;
    margin-top: 5px;
    margin-bottom: 0;
  }

  .content :global(h2) {
    font-family: 'DM Serif Text', serif; /* Match your title font */
    font-size: 28px;                   /* Large size for subheadings */                
    line-height: 1.2; 
    margin-top: 30px;
    margin-bottom: 20px;                   /* Tighter line height for headings */
  }

  .content :global(p) {
    margin-top: 0;            /* Space above paragraphs */
    margin-bottom: 1.5rem;    /* Space below paragraphs */
    font-size: 16px;        /* Paragraph text size */
  }
  
  .metadata {
    display: flex;
    gap: 1rem;
    color: var(--dark-100);
    margin-bottom: 2rem;
  }
  
  .tags {
    display: flex;
    gap: 0.5rem;
  }
  
  .tag {
    background: #f0f0f0;
    padding: 0.2rem 0.5rem;
    border-radius: 4px;
    font-size: 0.8rem;
  }
  
  .loading, .error {
    text-align: center;
    padding: 2rem;
  }
  
  .error {
    color: #d32f2f;
  }
  
  .floating-back-button {
    position: fixed;
    top: 10px;
    left: 10px;
    background-color: var(--dark-5);
    color: var(--dark-80);
    padding: 8px 12px;
    border-radius: 4px;
    box-shadow: 0 2px 8px rgba(0, 0, 0, 0.25);
    font-size: 14px;
    text-decoration: none;
    z-index: 100;
    opacity: 0;
    transition: opacity 1.5s ease; /* Slow fade transition */
    pointer-events: none; /* Disable interactions when fading */
  }
  
  .floating-back-button.visible {
    opacity: 1;
    pointer-events: auto; /* Enable interactions when visible */
  }
  
  .floating-back-button.hidden {
    opacity: 0;
    pointer-events: none;
  }
  
  .floating-back-button:hover {
    background-color: var(--dark-10);
  }
</style>
