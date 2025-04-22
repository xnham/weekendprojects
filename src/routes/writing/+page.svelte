<script>
  import { onMount } from 'svelte';
  import { metadata } from '$lib/stores/metadataStore';
  
  // Essays data loaded from +page.server.js
  export let data;
  
  onMount(() => {
    metadata.set({
      title: "Writing | Wendy Ham's Weekend Projects",
      description: "Thoughts about creating software that quietly complements our lives.",
      canonicalUrl: "https://xnham.com/writing",
      type: "website",
      url: window.location.href
    });
  });
  
  // Format date helper - copied from original Essays.svelte
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
  
  // Handle link click for client-side navigation
  function handleLinkClick(event) {
    // Find closest anchor tag (even if we clicked on a child element)
    const target = event.target;
    const anchorElement = target.closest('a');
    
    if (anchorElement) {
      const href = anchorElement.getAttribute('href');
      
      if (href && href.startsWith('/writing/')) {
        // In SvelteKit we don't need this custom handling as it's built-in
        // This is just kept for reference
      }
    }
  }
</script>

<svelte:head>
  <title>Writing | Wendy Ham's Weekend Projects</title>
  <meta name="description" content="Thoughts about creating software that quietly complements our lives." />
  <link rel="canonical" href="https://xnham.com/writing" />
</svelte:head>

<main class="container">
  <h2 class="small-bottom-margin">Thoughts about <span class="purple">Software.</span></h2>
  
  <div class="future-project-intro">
    <p>How do our natural behaviors and cognitive patterns uncover opportunities to rethink software design and create tools that <span class="small-font">quietly</span> complement our lives?</p>
  </div>
  
  <div class="essays">
    {#each data.essays as essay}
      <div class="essay-card">
        <a href="/writing/{essay.slug}" class="essay-card-link">
          <div class="essay-content">
            <p class="essay-date">{formatDate(essay.date)}</p>
            <h3 class="essay-title">{essay.title}</h3>
            <p class="essay-description">
              {#if essay.excerpt}
                {essay.excerpt}
              {:else}
                {essay.description}
              {/if}
            </p>
            <span class="read-more"><span class="read-more-text">Read more</span> &gt;</span>
          </div>
        </a>
        <div class="essay-interaction-container">
          <div class="essay-buttons">
            <!-- We'll implement interaction buttons in a future update -->
          </div>
          
          <div class="essay-counters">
            {#if essay.id}
              {essay.like_count || 0} {essay.like_count === 1 ? 'like' : 'likes'}
              {#if essay.share_count}
                & {essay.share_count} {essay.share_count === 1 ? 'share' : 'shares'}
              {/if}
            {/if}
          </div>
        </div>
      </div>
    {/each}
  </div>
</main>

<style>
  /* Main layout */
  .container {
    width: 100%;
    max-width: 1200px;
    margin: 0 auto;
    padding: 0 1rem;
  }
  
  .small-bottom-margin {
    margin-bottom: 0.75rem;
  }
  
  .purple {
    color: var(--purple-100);
  }
  
  .future-project-intro {
    width: 75%;
    margin-bottom: 80px;
  }

  .small-font {
    font-size: 12px;
  }
  
  /* Essays list styling - copied from original Essays.svelte */
  .essays {
    display: flex;
    flex-direction: column;
    gap: 60px;
    width: 75%;
  }

  /* Essay card styles */
  .essay-card {
    overflow: visible;
    border-left: 1px solid var(--dark-100);
  }

  .essay-card-link {
    display: block;
    text-decoration: none;
    color: inherit;
    cursor: pointer;
  }

  .essay-content {
    padding: 0 0 20px 20px;
    border-bottom: 1px solid var(--dark-100);
  }

  .essay-interaction-container {
    display: flex;
    flex-direction: row;
    padding: 10px 0 10px 20px;
    align-items: flex-start;
    position: relative;
  }

  .essay-date {
    text-transform: uppercase;
    letter-spacing: 0.1rem;
    color: var(--dark-70);
    font-size: 12px;
    font-weight: 400;
  }

  .essay-title {
    font-family: "DM Serif Text", serif;
    font-size: 24px;
    color: var(--dark-100);
  }

  .essay-description {
    margin-top: 10px;
    margin-bottom: 10px;
  }

  .read-more {
    display: inline-block;
    margin-top: 10px;
    color: var(--dark-80);
    font-size: 14px;
    font-weight: 400;
  }

  .read-more-text {
    text-decoration: underline;
  }

  .read-more:hover {
    opacity: 0.8;
  }
  
  .essay-buttons {
    display: flex;
    flex-direction: row;
  }
  
  .essay-counters {
    text-align: right;
    justify-content: flex-end;
    font-size: 14px;
    color: var(--dark-80);
    margin-left: auto;
  }
  
  /* Responsive adjustments */
  @media (max-width: 768px) {
    .future-project-intro {
      width: 100%;
      margin-bottom: 60px;
    }
    
    .essays {
      width: 100%;
    }
  }
</style> 