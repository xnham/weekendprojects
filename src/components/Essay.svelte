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
    // Add debugging to see what we're receiving
    console.log('Original date string:', dateString);
    
    // More robust approach: force the date to be interpreted as local timezone
    // by adding a time component (12 noon) to avoid any date shifting
    const [year, month, day] = dateString.split('-').map(num => parseInt(num, 10));
    console.log('Parsed components:', year, month, day);
    
    // Create date at noon to avoid timezone boundary issues
    const date = new Date(year, month - 1, day, 12, 0, 0);
    console.log('Created date object:', date);
    
    return date.toLocaleDateString('en-US', { 
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
    <h2 class="small-bottom-margin">Essay Not Found</h2>
    <p>{error}</p>
    <a href="/writing" on:click={goBackToWriting}>&lt; Back to essays</a>
  </div>
{:else}
  <article>
    <a href="/writing" class="back-link" on:click={goBackToWriting}><span class="arrow">&lt;</span> <span class="link-text">Back to essays</span></a>
    {#if metadata}
      <header>
        <time class="essay-date" datetime={metadata.date}>{formatDate(metadata.date)}</time>
        <h2 class="small-bottom-margin">{metadata.title}</h2>
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
    <span class="arrow">&lt;</span> <span class="floating-link-text">Back to essays</span>
  </a>
{/if}

<style>
  article {
    width: 75%;
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
    letter-spacing: 0.08rem;
    color: var(--dark-80);
    font-size: 13px;
    font-weight: 400;
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
    pointer-events: auto; /* Enable interactions when visible */
  }
  
  .floating-back-button.hidden {
    opacity: 0;
    pointer-events: none;
  }
  
  .floating-back-button:hover {
    transform: scale(1.02);
    color: var(--dark-80);
    box-shadow: 0 2px 6px 2px var(--dark-30); /* Optional: enhanced shadow on hover */
  }
  
  .floating-back-button .arrow {
    text-decoration: none;
  }
  
  .floating-back-button .floating-link-text {
    text-decoration: underline;
  }

  /* Responsiveness */

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

    .back-link {
      font-size: 12px;
    }
  }
</style>
