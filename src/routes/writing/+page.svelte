<script lang="ts">
  import { onMount } from "svelte";
  import { metadata } from "$lib/stores/metadataStore";
  import Essays from "$lib/components/Essays.svelte";

  // Accept data from server
  export let data;
  
  // Add state for component error handling
  let essaysError = false;
  let retryCount = 0;
  const MAX_RETRIES = 2;

  function handleEssaysError(e: CustomEvent<any>) {
    console.error('Error in Essays component:', e.detail);
    essaysError = true;
    
    // Try to recover by re-mounting after a delay if we haven't exceeded retry limit
    if (retryCount < MAX_RETRIES) {
      retryCount++;
      setTimeout(() => {
        console.log(`Retry attempt ${retryCount} for Essays component`);
        essaysError = false;
      }, 1000);
    }
  }
  
  // Add a function to handle JS errors
  function handleComponentRender() {
    try {
      return {
        component: Essays,
        props: {
          preloadedEssays: data.essays || [],
          serverError: data.error
        }
      };
    } catch (error) {
      console.error('Error while preparing Essays component:', error);
      essaysError = true;
      return null;
    }
  }

  onMount(() => {
    metadata.set({
      title: "Writing | Wendy Ham's Weekend Projects",
      description:
        "Thoughts about creating software that quietly complements our lives.",
      canonicalUrl: "https://xnham.com/writing",
      type: "website",
      url: typeof window !== 'undefined' ? window.location.href : "https://xnham.com/writing",
    });
    
    // Attach a global error handler for uncaught errors
    const errorHandler = (event: ErrorEvent) => {
      console.error('Global error caught:', event.error || event.message);
      
      // Check if the error is related to our Essays component
      const errorStr = String(event.error || event.message);
      if (errorStr.includes('Essays') || 
          errorStr.includes('essay') || 
          errorStr.includes('interaction')) {
        essaysError = true;
        event.preventDefault();
      }
    };
    
    window.addEventListener('error', errorHandler);
    
    return () => {
      window.removeEventListener('error', errorHandler);
    };
  });
</script>

<svelte:head>
  <title>Writing | Wendy Ham's Weekend Projects</title>
  <meta
    name="description"
    content="Thoughts about creating software that quietly complements our lives."
  />
  <link rel="canonical" href="https://xnham.com/writing" />
</svelte:head>

<main class="container">
  <h2 class="small-bottom-margin">
    Thoughts about <span class="purple">Software.</span>
  </h2>

  <div class="writing-intro">
    <p>
      How do our natural behaviors and cognitive patterns uncover opportunities
      to rethink software design and create tools that <span class="small-font"
        >quietly</span
      > complement our lives?
    </p>
  </div>

  <div class="essays-container">
    {#if essaysError}
      <div class="error-message">
        <p>There was an error loading the essays. 
          {#if retryCount >= MAX_RETRIES}
            Please try refreshing the page.
          {:else}
            Retrying...
          {/if}
        </p>
      </div>
    {:else}
      {#await Promise.resolve(handleComponentRender()) then result}
        {#if result}
          <svelte:component 
            this={result.component}
            {...result.props}
            on:error={handleEssaysError}
          />
        {/if}
      {/await}
    {/if}
  </div>
</main>

<style>
  .writing-intro {
    width: 75%;
    margin-bottom: 80px;
  }

  .small-font {
    font-size: 12px;
  }

  .essays-container {
    width: 75%;
  }
  
  .error-message {
    padding: 20px;
    background-color: #fff8f8;
    border-left: 3px solid #ff7777;
    color: #333;
  }

  /* Responsive styles */
  @media (max-width: 768px) {
    .writing-intro,
    .essays-container {
      width: 100%;
      margin-bottom: 60px;
    }
  }
</style>