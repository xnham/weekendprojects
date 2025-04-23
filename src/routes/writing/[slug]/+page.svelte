<script lang="ts">
  import { page } from '$app/stores';
  import { onMount } from 'svelte';
  import { metadata } from '$lib/stores/metadataStore';
  import Essay from '$lib/components/Essay.svelte';
  
  // Access the essay data loaded by the page.server.js file
  export let data;
  
  // Error handling state
  let essayError = false;
  let retryCount = 0;
  let isLoadingContent = false;
  let contentLoadError: string | null = null;
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
    } catch (err: unknown) {
      console.error('Error loading content on client side:', err);
      contentLoadError = err instanceof Error ? err.message : 'Unknown error occurred';
    } finally {
      isLoadingContent = false;
    }
  }
  
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
    // Set metadata for the essay
    if (data.essay) {
      metadata.set({
        title: `${data.essay.title} | Wendy Ham's Weekend Projects`,
        description: combinedDescription,
        canonicalUrl: `https://xnham.com/writing/${$page.params.slug}`,
        type: "article",
        url: essayUrl
      });
      
      // If content is null, check if we should load it on the client side
      if (data.content === null) {
        // Add a short delay to ensure everything is properly mounted
        setTimeout(() => {
          loadContentClientSide();
        }, 100);
      }
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

  <article>
    {#if !data.essay}
      <div class="error">Essay not found</div>
    {:else if essayError}
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
        essay={data.essay} 
        content={data.content}
        on:error={handleEssayError}
      >
        <div slot="content-actions">
          {#if isLoadingContent}
            <p>Loading essay content...</p>
          {:else}
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
      </Essay>
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
    padding: 1rem;
    color: #d32f2f;
  }
  
  .error-message {
    padding: 20px;
    background-color: #fff8f8;
    border-left: 3px solid #ff7777;
    color: #333;
  }
  
  /* Button styling */
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

  /* Responsive Styles */
  @media (max-width: 1150px) {
    .floating-back-button {
      display: none;
    }
  }
  
  @media (max-width: 768px) {
    article {
      width: 100%;
    }

    .back-button {
      font-size: 12px;
    }
  }
</style>