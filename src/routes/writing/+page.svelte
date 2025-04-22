<script>
  import { onMount } from 'svelte';
  import { metadata } from '$lib/stores/metadataStore';
  
  // Essays data loaded from +page.server.js
  export let data;
  
  onMount(() => {
    metadata.set({
      title: "Writing | Wendy Ham's Weekend Projects",
      description: "Essays and thoughts on software for one, hyperpersonal tools, and the future of software.",
      canonicalUrl: "https://xnham.com/writing",
      type: "website",
      url: window.location.href
    });
  });
  
  // Format date helper
  function formatDate(dateString) {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', { 
      year: 'numeric', 
      month: 'long', 
      day: 'numeric' 
    });
  }
</script>

<svelte:head>
  <title>Writing | Wendy Ham's Weekend Projects</title>
  <meta name="description" content="Essays and thoughts on software for one, hyperpersonal tools, and the future of software." />
  <link rel="canonical" href="https://xnham.com/writing" />
  
  <!-- Open Graph -->
  <meta property="og:type" content="website" />
  <meta property="og:url" content="https://xnham.com/writing" />
  <meta property="og:title" content="Writing | Wendy Ham's Weekend Projects" />
  <meta property="og:description" content="Essays and thoughts on software for one, hyperpersonal tools, and the future of software." />
</svelte:head>

<div class="container">
  <h2>Recent <span class="purple">Thoughts</span></h2>
  
  {#if !data.essays || data.essays.length === 0}
    <div class="no-essays">
      <p>No essays yet. Check back soon!</p>
    </div>
  {:else}
    <div class="essays-grid">
      {#each data.essays as essay}
        <div class="essay-card">
          <a href="/writing/{essay.slug}" class="essay-link">
            <h3>{essay.title}</h3>
            <p class="essay-date">{formatDate(essay.date)}</p>
            <p class="essay-excerpt">{essay.excerpt || essay.description}</p>
          </a>
        </div>
      {/each}
    </div>
  {/if}
</div>

<style>
  .container {
    max-width: 1200px;
    margin: 0 auto;
    padding: 2rem;
  }
  
  h2 {
    font-size: 2.5rem;
    margin-bottom: 2.5rem;
    text-align: center;
  }
  
  .purple {
    color: var(--purple-100);
  }
  
  .essays-grid {
    display: grid;
    grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
    gap: 2rem;
  }
  
  .essay-card {
    background-color: var(--pure-white-100);
    border-radius: 12px;
    overflow: hidden;
    box-shadow: 0 4px 12px rgba(0, 0, 0, 0.05);
    transition: transform 0.3s ease, box-shadow 0.3s ease;
  }
  
  .essay-card:hover {
    transform: translateY(-5px);
    box-shadow: 0 10px 20px rgba(0, 0, 0, 0.1);
  }
  
  .essay-link {
    display: block;
    padding: 1.75rem;
    color: inherit;
    text-decoration: none;
    height: 100%;
  }
  
  h3 {
    margin: 0 0 0.75rem 0;
    font-size: 1.3rem;
    color: var(--dark-100);
    line-height: 1.3;
  }
  
  .essay-date {
    font-size: 0.9rem;
    color: var(--dark-60);
    margin-bottom: 1rem;
  }
  
  .essay-excerpt {
    font-size: 1rem;
    color: var(--dark-80);
    line-height: 1.5;
    margin: 0;
  }
  
  .no-essays {
    text-align: center;
    padding: 3rem;
    color: var(--dark-60);
    font-size: 1.1rem;
  }
  
  @media (max-width: 768px) {
    .essays-grid {
      grid-template-columns: repeat(auto-fill, minmax(250px, 1fr));
    }
  }
  
  @media (max-width: 480px) {
    .essays-grid {
      grid-template-columns: 1fr;
    }
    
    h2 {
      font-size: 2rem;
    }
  }
</style> 