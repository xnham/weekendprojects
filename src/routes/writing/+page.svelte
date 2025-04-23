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

  onMount(() => {
    metadata.set({
      title: "Writing | Wendy Ham's Weekend Projects",
      description:
        "Thoughts about creating software that quietly complements our lives.",
      canonicalUrl: "https://xnham.com/writing",
      type: "website",
      url: typeof window !== 'undefined' ? window.location.href : "https://xnham.com/writing",
    });
  });
</script>

<svelte:head>
  <title>Writing | Wendy Ham's Weekend Projects</title>
  <meta
    name="description"
    content="Thoughts about creating software that quietly complements our lives."
  />
  <link rel="canonical" href="https://xnham.com/writing" />
  
  <!-- Open Graph -->
  <meta property="og:type" content="website" />
  <meta property="og:url" content="https://xnham.com/writing" />
  <meta property="og:title" content="Writing | Wendy Ham's Weekend Projects" />
  <meta property="og:description" content="Thoughts about creating software that quietly complements our lives." />
  <meta property="og:image" content="https://xnham.com/images/og-image.png" />
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
      <Essays 
        preloadedEssays={data.essays || []}
        on:error={handleEssaysError}
      />
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