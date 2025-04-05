<script lang="ts">
  import { onMount } from 'svelte';
  import { loadEssay } from '../utils/essays';
  import type { SvelteComponent } from 'svelte';
  import type { EssayMetadata } from '../utils/essays';
  import { FontAwesomeIcon } from '@fortawesome/svelte-fontawesome';
  import { fade } from 'svelte/transition';
  
  export let slug: string;
  
  let content: typeof SvelteComponent | null = null;
  let metadata: EssayMetadata | null = null;
  let error: string | null = null;
  let loading = true;
  let showFloatingButton = false;
  let buttonVisible = false;
  let hideTimeout: ReturnType<typeof setTimeout> | null = null;
  
  // Add user data for likes
  let userData = {
    likes: {} as {[key: string]: boolean}
  };
  
  // Modal state
  let showShareModal = false;
  let copySuccess = false;
  let currentShareUrl = '';
  let modalTimeout: ReturnType<typeof setTimeout>;
  
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
    loadUserData();
    
    // Add scroll event listener for floating button
    window.addEventListener('scroll', handleScroll);
    
    // Add global ESC key handler for modal
    const handleKeydown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && showShareModal) {
        closeModal();
      }
    };
    
    window.addEventListener('keydown', handleKeydown);
    
    return () => {
      window.removeEventListener('scroll', handleScroll);
      window.removeEventListener('keydown', handleKeydown);
      if (hideTimeout) {
        clearTimeout(hideTimeout);
      }
      if (modalTimeout) clearTimeout(modalTimeout);
    };
  });
  
  function loadUserData() {
    const data = localStorage.getItem('essayUserData');
    if (data) {
      userData = JSON.parse(data);
    }
  }
  
  function saveUserData() {
    localStorage.setItem('essayUserData', JSON.stringify(userData));
  }
  
  function handleLike(essaySlug: string): void {
    if (userData.likes[essaySlug]) {
      delete userData.likes[essaySlug];
    } else {
      userData.likes[essaySlug] = true;
    }
    userData = { ...userData };
    saveUserData();
  }
  
  function handleShare(essaySlug: string, title: string): void {
    const url = window.location.origin + '/writing/' + essaySlug;
    currentShareUrl = url;
    showShareModal = true;
    
    // Auto-hide modal after 3 seconds if copy was successful
    if (modalTimeout) {
      clearTimeout(modalTimeout);
    }
  }
  
  function copyLink() {
    navigator.clipboard.writeText(currentShareUrl)
      .then(() => {
        copySuccess = true;
        modalTimeout = setTimeout(() => {
          showShareModal = false;
          copySuccess = false;
        }, 3000);
      })
      .catch(() => {
        copySuccess = false;
      });
  }
  
  function closeModal() {
    showShareModal = false;
    copySuccess = false;
    if (modalTimeout) {
      clearTimeout(modalTimeout);
    }
  }
  
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
    // Simple date formatter that doesn't use the Date object at all
    // This prevents any timezone conversions
    const [year, month, day] = dateString.split('-');
    
    // Convert month number to name
    const monthNames = [
      'January', 'February', 'March', 'April', 'May', 'June', 
      'July', 'August', 'September', 'October', 'November', 'December'
    ];
    
    // Parse month as integer and subtract 1 to get the correct index (months are 1-based in the string)
    const monthIndex = parseInt(month, 10) - 1;
    const monthName = monthNames[monthIndex];
    
    // Remove leading zero from day if present
    const dayFormatted = day.startsWith('0') ? day.substring(1) : day;
    
    // Return formatted date string
    return `${monthName} ${dayFormatted}, ${year}`;
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
    <a href="/writing" class="back-link" on:click={goBackToWriting}><span class="arrow">&lt;</span> <span class="link-text">Back</span></a>
    {#if metadata}
    <div class="essay-container">
      <header>
        <div class="essay-header-row">
          <time class="essay-date" datetime={metadata.date}>{formatDate(metadata.date)}</time>
          <div class="essay-buttons">
            <button 
              class="interaction-btn essay-like-button {userData.likes && userData.likes[slug] ? 'btn-liked' : ''}" 
              on:click={() => handleLike(slug)}
              aria-label={userData.likes && userData.likes[slug] ? 'Unlike this essay' : 'Like this essay'}
            >
              {#if userData.likes && userData.likes[slug]}
                <FontAwesomeIcon icon={['fas', 'heart']} size="lg" />
                <span>Liked</span>
              {:else}
                <FontAwesomeIcon icon={['far', 'heart']} size="lg" />
                <span>Like</span>
              {/if}
            </button>
            <button 
              class="interaction-btn essay-share-button" 
              on:click={() => handleShare(slug, metadata.title)}
              aria-label="Share this essay"
            >
              <FontAwesomeIcon icon={['far', 'share-from-square']} size="lg" />
              <span>Share</span>
            </button>
          </div>
        </div>
        <h2 class="small-bottom-margin">{metadata.title}</h2>
        <p class="essay-description">{metadata.description}</p>
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
      <div class="content">
        <svelte:component this={content} />
      </div>
      
      <!-- Bottom essay buttons -->
      <div class="essay-footer-row">
        <div class="essay-buttons">
          <button 
            class="interaction-btn essay-like-button {userData.likes && userData.likes[slug] ? 'btn-liked' : ''}" 
            on:click={() => handleLike(slug)}
            aria-label={userData.likes && userData.likes[slug] ? 'Unlike this essay' : 'Like this essay'}
          >
            {#if userData.likes && userData.likes[slug]}
              <FontAwesomeIcon icon={['fas', 'heart']} size="lg" />
              <span>Liked</span>
            {:else}
              <FontAwesomeIcon icon={['far', 'heart']} size="lg" />
              <span>Like</span>
            {/if}
          </button>
          <button 
            class="interaction-btn essay-share-button" 
            on:click={() => handleShare(slug, metadata.title)}
            aria-label="Share this essay"
          >
            <FontAwesomeIcon icon={['far', 'share-from-square']} size="lg" />
            <span>Share</span>
          </button>
        </div>
      </div>
    </div>
    {/if}
  </article>
{/if}

<!-- Floating back button -->
{#if !loading && !error && showFloatingButton}
  <a href="/writing" class="floating-back-button {buttonVisible ? 'visible' : 'hidden'}" on:click={goBackToWriting}>
    <span class="arrow">&lt;</span> <span class="floating-link-text">Back</span>
  </a>
{/if}

<!-- Share Link Modal -->
{#if showShareModal}
<div 
    class="modal-overlay" 
    role="presentation"
    transition:fade={{ duration: 200 }}
>
    <!-- Use a semantic dialog element for the modal -->
    <div 
        class="modal-content" 
        role="dialog"
        aria-modal="true"
        aria-labelledby="share-modal-title"
        tabindex="-1"
        transition:fade={{ duration: 300, delay: 100 }}
    >
        <button class="modal-close" on:click={closeModal} aria-label="Close modal">×</button>
        <div class="modal-header">
            <h3 class="share-modal-title">Share this essay</h3>
        </div>
        <div class="modal-body">
            <div class="share-link-container">
                <input type="text" readonly value={currentShareUrl} class="share-link-input" />
                <button class="copy-button" on:click={copyLink} disabled={copySuccess}>
                    {copySuccess ? 'Copied!' : 'Copy'}
                </button>
            </div>
            {#if copySuccess}
            <div class="copy-success">Link copied to clipboard!</div>
            {/if}
        </div>
    </div>
    <!-- Invisible close button that covers the overlay for click-to-close functionality -->
    <button 
        class="overlay-close-button" 
        on:click={closeModal} 
        aria-label="Close modal"
    ></button>
</div>
{/if}

<style>
  article {
    width: 75%;
    margin: 0;
  }

  .back-link {
    display: inline-block;
    margin-bottom: 10px;
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

  .essay-container {
    border-top: 1px solid var(--dark-100);
    border-bottom: 1px solid var(--dark-100);
    padding: 14px 0 10px 0;
  }

  .essay-date {
    text-transform: uppercase;
    letter-spacing: 0.08rem;
    color: var(--dark-80);
    font-size: 13px;
    font-weight: 400;
  }

  .essay-description {
    font-size: 17px;
    margin-top: 0;
    margin-bottom: 1.5rem;
  }

  .content :global(p) {
    margin-top: 0;            /* Space above paragraphs */
    margin-bottom: 1.5rem;    /* Space below paragraphs */
    font-size: 15px;        /* Paragraph text size */
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
    transform: scale(1.04);
    color: var(--dark-80);
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

  .essay-header-row {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 10px;
  }
  
  .essay-footer-row {
    display: none;
    justify-content: flex-end;
    align-items: center;
    margin-top: 30px;
    padding-top: 20px;
    margin-bottom: 5px;
  }
  
  .essay-buttons {
    display: flex;
    gap: 8px;
    padding-right: 4px;
  }
  
  .btn-liked :global(svg) {
    color: var(--dark-pink-100);
  }
  
  /* Modal styles */
  .modal-overlay {
    position: fixed;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    background-color: var(--dark-70);
    display: flex;
    justify-content: center;
    align-items: center;
    z-index: 1000;
  }
  
  /* Invisible button that covers the entire overlay for accessibility */
  .overlay-close-button {
    position: absolute;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
    background: transparent;
    border: none;
    cursor: pointer;
    z-index: 1001;
  }
  
  .modal-content {
    background-color: var(--light-100);
    padding: 40px 80px 30px 80px;
    border-radius: 5px;
    max-width: 600px;
    width: 90%;
    position: relative;
    box-shadow: 0 5px 20px var(--dark-20);
    z-index: 1002; /* Higher than the overlay close button */
  }
  
  .modal-header {
    display: flex;
    justify-content: center;
    padding: 0;
    border-bottom: none;
  }
  
  .share-modal-title {
    font-family: 'DM Serif Text', serif;
    text-align: center;
    font-size: 24px;
    font-weight: 500;
    line-height: 1.3;
  }
  
  .modal-close {
    font-family: 'Roboto', sans-serif;
    position: absolute;
    top: 16px;
    right: 20px;
    font-size: 30px;
    font-weight: 200;
    line-height: 1;
    color: var(--dark-60);
    cursor: pointer;
    background: none;
    border: none;
    padding: 0;
    width: 30px;
    height: 30px;
  }
  
  .modal-close:hover {
    color: var(--dark-90);
    transform: scale(1.2);
    transition: transform 0.3s ease;
  }
  
  .modal-body {
    padding: 10px 0 20px 0;
  }
  
  .share-link-container {
    display: flex;
    width: 100%;
  }
  
  .share-link-input {
    flex: 1;
    background-color: var(--light-100);
    color: var(--dark-75);
    padding: 12px;
    border: 1px solid var(--dark-60);
    border-radius: 5px 0 0 5px;
    font-size: 15px;
    transition: border-color 0.3s ease;
    box-sizing: border-box;
    min-width: 0;
  }
  
  .share-link-input:focus {
    outline: none;
    border-color: var(--dark-80);
    box-shadow: 0 0 0 1px var(--purple-30);
  }
  
  .copy-button {
    background-color: var(--purple-100);
    color: white;
    border: none;
    padding: 12px 15px;
    border-radius: 0 5px 5px 0;
    cursor: pointer;
    font-weight: 500;
    font-size: 16px;
    transition: background-color 0.3s;
    white-space: nowrap;
    flex-shrink: 0;
  }
  
  .copy-button:hover {
    background-color: var(--dark-purple-100);
  }
  
  .copy-button:disabled {
    background-color: var(--purple-100);
    opacity: 0.7;
    cursor: not-allowed;
  }
  
  .copy-success {
    color: var(--dark-green-100);
    font-size: 14px;
    margin-top: 15px;
    text-align: center;
  }
  
  /* Media queries for modal */
  @media (max-width: 576px) {   
    .modal-close {
      top: 12px;
      right: 16px;
    }

    .share-modal-title {
      padding-top: 20px;
      font-size: 22px;
    }

    .modal-content {
      padding: 50px clamp(10px, 5vw, 40px);
      width: 95%;
    }

    .share-link-input {
      font-size: 14px;
    }
    
    .essay-buttons {
      gap: 8px;
    }
  }
</style>
