<script lang="ts">
  import { page } from '$app/stores';
  import { onMount } from 'svelte';
  import { metadata } from '$lib/stores/metadataStore';
  import Essay from '$lib/components/Essay.svelte';
  
  // Define proper interface for the data object
  interface EssayData {
    currentPath?: string;
    slug?: string;
    essay?: {
      id: string;
      slug: string;
      title: string;
      description?: string;
      excerpt?: string;
      date: string;
      content?: string;
      like_count?: number;
      share_count?: number;
      view_count?: number;
    };
  }
  
  // Access the essay data loaded by the page.server.js file
  export let data: EssayData;
  
  // Error handling state
  let essayError = false;
  let retryCount = 0;
  const MAX_RETRIES = 2;
  
  // Scroll UI variables
  let showFloatingButton = false;
  let buttonVisible = false;
  let isScrolling = false;
  
  // Function to handle errors from Essay component
  function handleEssayError(e: CustomEvent<any>) {
    console.error('Error in Essay component:', e.detail);
    essayError = true;
    
    // Try to recover by re-mounting after a delay if we haven't exceeded retry limit
    if (retryCount < MAX_RETRIES) {
      retryCount++;
      setTimeout(() => {
        console.log(`Retry attempt ${retryCount} for Essay component`);
        essayError = false;
      }, 1000);
    }
  }
  
  // Create a reactive combined description from preloaded data
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
    "image": "https://xnham.com/images/og-image.png",
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
          buttonVisible = false;
        }
        
        isScrolling = false;
      });
    }
  }

  onMount(() => {
    // Update metadata with essay-specific values from preloaded data
    if (data.essay) {
      metadata.set({
        title: `${data.essay.title} | Wendy Ham's Weekend Projects`,
        description: combinedDescription,
        canonicalUrl: `https://xnham.com/writing/${$page.params.slug}`,
        type: "article",
        url: typeof window !== 'undefined' ? window.location.href : `https://xnham.com/writing/${$page.params.slug}`
      });
    } else {
      // Fallback metadata if no essay data
      metadata.set({
        title: "Essay | Wendy Ham's Weekend Projects",
        description: "Essays about design, coding, and more.",
        canonicalUrl: `https://xnham.com/writing/${$page.params.slug}`,
        type: "article",
        url: typeof window !== 'undefined' ? window.location.href : `https://xnham.com/writing/${$page.params.slug}`
      });
    }
    
    // Listen for scroll events
    window.addEventListener('scroll', handleScroll);
    
    // Attach a global error handler for uncaught errors
    const errorHandler = (event: ErrorEvent) => {
      console.error('Global error caught in essay page:', event.error || event.message);
      
      // Check if the error is related to our Essay component
      const errorStr = String(event.error || event.message);
      if (errorStr.includes('Essay') || 
          errorStr.includes('essay') || 
          errorStr.includes('interaction')) {
        essayError = true;
        event.preventDefault();
      }
    };
    
    window.addEventListener('error', errorHandler);
    
    return () => {
      window.removeEventListener('scroll', handleScroll);
      window.removeEventListener('error', errorHandler);
    };
  });
</script>

<svelte:head>
  {#if data.essay}
    <title>{data.essay.title} | Wendy Ham's Weekend Projects</title>
    <meta name="description" content={combinedDescription} />
    <link rel="canonical" href={`https://xnham.com/writing/${$page.params.slug}`} />
    
    <!-- Structured data - ensure proper serialization -->
    {#if articleJsonLd}
      {@html `<script type="application/ld+json">${JSON.stringify(articleJsonLd)}</script>`}
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
    <a href="/writing">
      <span class="link-text">Back to essays
      </span>
    </a>
  </div>

  <!-- Floating back button when scrolled -->
  <a 
    href="/writing"
    class="floating-back-button {buttonVisible ? 'visible' : 'hidden'} {!showFloatingButton ? 'instant-hide' : ''}"
    aria-hidden={!buttonVisible}
  >
    <span class="arrow">&lt;</span>
    <span class="floating-link-text">Back</span>
  </a>

  {#if essayError}
    <div class="error-message">
      <p>There was an error loading the essay. 
        {#if retryCount >= MAX_RETRIES}
          Please try refreshing the page.
        {:else}
          Retrying...
        {/if}
      </p>
    </div>
  {:else}
    <Essay
      slug={$page.params.slug}
      preloadedEssay={data.essay}
      on:error={handleEssayError}
    />
  {/if}
</div>

<style>
  /* Back button styles */
  .back-button {
    margin-bottom: 40px;
    font-size: 14px;
    color: var(--dark-80);
    display: flex;
    align-items: center;
  }
  
  .link-text {
    margin-left: 5px;
    text-decoration: underline;
  }
  
  /* Floating back button styles */
  .floating-back-button {
    position: fixed;
    top: 20px;
    left: 20px;
    background-color: rgba(255, 255, 255, 0.9);
    border-radius: 30px;
    padding: 10px 15px;
    text-decoration: none;
    color: var(--dark-80);
    display: flex;
    align-items: center;
    box-shadow: 0 2px 10px rgba(0, 0, 0, 0.1);
    transition: opacity 0.3s, transform 0.3s;
    z-index: 100;
  }
  
  .floating-back-button.visible {
    opacity: 1;
    transform: translateY(0);
  }
  
  .floating-back-button.hidden {
    opacity: 0;
    transform: translateY(-10px);
    pointer-events: none;
  }
  
  .floating-back-button.instant-hide {
    transition: none;
    pointer-events: none;
  }
  
  .floating-back-button .arrow {
    font-weight: bold;
    margin-right: 5px;
  }
  
  /* Error message styles */
  .error-message {
    padding: 20px;
    background-color: #fff8f8;
    border-left: 3px solid #ff7777;
    color: #333;
    margin: 20px 0;
  }
</style>