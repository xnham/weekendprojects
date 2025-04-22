<script>
  import { page } from '$app/stores';
  import { onMount } from 'svelte';
  import { metadata } from '$lib/stores/metadataStore';
  
  // Access the essay data loaded by the page.server.js file
  export let data;
  
  onMount(() => {
    // If we have essay data, set the metadata
    if (data.essay) {
      metadata.set({
        title: `${data.essay.title} | Wendy Ham's Weekend Projects`,
        description: data.essay.description || data.essay.excerpt || '',
        canonicalUrl: `https://xnham.com/writing/${$page.params.slug}`,
        type: "article",
        url: window.location.href
      });
    }
  });
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

<div class="container">
  {#if data.loading}
    <p>Loading essay...</p>
  {:else if data.error}
    <p class="error">{data.error}</p>
  {:else if data.essay}
    <article>
      <div class="essay-header-row">
        <a href="/writing" class="back-button">← All essays</a>
        <!-- Essay interaction buttons will go here later -->
      </div>
      
      <h2>{data.essay.title}</h2>
      <p class="essay-date">{data.essay.date}</p>
      
      <!-- Essay content will be populated here -->
      <div class="essay-content">
        {#if typeof data.content === 'object' && data.content.default}
          <svelte:component this={data.content.default} />
        {:else}
          <p>Essay content unavailable.</p>
        {/if}
      </div>
    </article>
  {:else}
    <p>Essay not found.</p>
  {/if}
</div>

<style>
  article {
    width: 100%;
    max-width: 800px;
    margin: 0 auto;
  }
  
  .essay-header-row {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 60px;
  }
  
  .back-button {
    color: var(--dark-70);
    text-decoration: none;
    transition: color 0.2s ease;
  }
  
  .back-button:hover {
    color: var(--purple-100);
  }
  
  .essay-date {
    color: var(--dark-60);
    margin-bottom: 30px;
    font-size: 16px;
  }
  
  .essay-content :global(h1),
  .essay-content :global(h2),
  .essay-content :global(h3),
  .essay-content :global(h4),
  .essay-content :global(h5),
  .essay-content :global(h6) {
    margin-top: 1.5em;
    margin-bottom: 0.75em;
  }
  
  .essay-content :global(p) {
    margin-bottom: 1.5em;
    line-height: 1.8;
  }
  
  .essay-content :global(ul),
  .essay-content :global(ol) {
    margin-bottom: 1.5em;
    padding-left: 1.5em;
  }
  
  .essay-content :global(blockquote) {
    margin: 1.5em 0;
    padding-left: 1em;
    border-left: 3px solid var(--purple-100);
    color: var(--dark-70);
  }
  
  .error {
    color: #d32f2f;
    text-align: center;
    padding: 2rem;
  }
</style> 