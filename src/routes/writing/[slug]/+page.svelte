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
      slug: string;
      title: string;
      description?: string;
      excerpt?: string;
      date: string;
      content?: string;
    };
    content?: string;
  }
  
  // Access the essay data loaded by the page.server.js file
  export let data: EssayData;
  
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
    // Reset metadata to generic values (Essay will set specific values when loaded)
    metadata.set({
      title: "Essay | Wendy Ham's Weekend Projects",
      description: "Essays about design, coding, and more.",
      canonicalUrl: `https://xnham.com/writing/${$page.params.slug}`,
      type: "article",
      url: typeof window !== 'undefined' ? window.location.href : `https://xnham.com/writing/${$page.params.slug}`
    });
    
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
      on:error={handleEssayError}
    />
  {/if}
</div>

<style>
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
  
  .error-message {
    padding: 20px;
    background-color: #fff8f8;
    border-left: 3px solid #ff7777;
    color: #333;
  }
  
  /* Responsive Styles */
  @media (max-width: 1150px) {
    .floating-back-button {
      display: none;
    }
  }
  
  @media (max-width: 768px) {
    .container {
      padding: 0 15px;
    }

    .back-button {
      font-size: 12px;
    }
  }
</style>