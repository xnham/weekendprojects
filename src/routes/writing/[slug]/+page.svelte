<script>
  import { page } from '$app/stores';
  import { onMount } from 'svelte';
  import { metadata } from '$lib/stores/metadataStore';
  
  // Access the essay data loaded by the page.server.js file
  export let data;
  
  // Add smooth scroll behavior for better UX
  onMount(() => {
    // Set metadata for the essay
    if (data.essay) {
      metadata.set({
        title: `${data.essay.title} | Wendy Ham's Weekend Projects`,
        description: data.essay.description || data.essay.excerpt || '',
        canonicalUrl: `https://xnham.com/writing/${$page.params.slug}`,
        type: "article",
        url: window.location.href
      });
    }
    
    // Listen for scroll events
    window.addEventListener('scroll', handleScroll);
    
    // Clean up on component destruction
    return () => {
      window.removeEventListener('scroll', handleScroll);
      if (hideTimeout) clearTimeout(hideTimeout);
    };
  });
  
  // Copied from Essay.svelte
  let showFloatingButton = false;
  let buttonVisible = false;
  let hideTimeout = null;
  let isScrolling = false;
  
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
          <!-- We'll implement interaction buttons in a future update -->
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
</style> 