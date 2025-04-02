<script lang="ts">
  import { onMount, afterUpdate } from 'svelte';
  
  export let beforeImpact: string = "Before impact description.";
  export let afterImpact: string = "After impact description.";
  
  // Track active tab - Svelte way
  let activeTab = 'before'; // Default to 'before'
  
  // References to DOM elements
  let beforeSlide: HTMLElement;
  let afterSlide: HTMLElement;
  let contentContainer: HTMLElement;
  
  function changeTab(tabId: string) {
    activeTab = tabId;
  }

  // Helper function to format text with paragraphs
  function formatTextWithParagraphs(text: string): string {
    return text.split('\n\n').map(paragraph => `<p>${paragraph}</p>`).join('');
  }
  
  // Function to calculate and set height based on larger content
  function updateContentHeight() {
    if (!beforeSlide || !afterSlide || !contentContainer) return;
    
    // Temporarily reset opacity and ensure slides are visible for measurement
    beforeSlide.style.opacity = '1';
    afterSlide.style.opacity = '1';
    
    // Get content heights
    const beforeHeight = beforeSlide.scrollHeight;
    const afterHeight = afterSlide.scrollHeight;
    
    // Set container height to the larger of the two
    const maxHeight = Math.max(beforeHeight, afterHeight);
    contentContainer.style.height = `${maxHeight}px`;
    
    // Restore opacity based on active state
    beforeSlide.style.opacity = activeTab === 'before' ? '1' : '0.5';
    afterSlide.style.opacity = activeTab === 'after' ? '1' : '0.5';
  }
  
  // Update height when component mounts
  onMount(() => {
    updateContentHeight();
    // Add resize listener
    window.addEventListener('resize', updateContentHeight);
    return () => window.removeEventListener('resize', updateContentHeight);
  });
  
  // Update height when content changes
  afterUpdate(updateContentHeight);
</script>

<div class="insight-impact-container">
  <div class="insight-impact-tabs">
    <button class="insight-tab" class:active={activeTab === 'before'} 
            on:click={() => changeTab('before')}>
      Before
    </button>
    <button class="insight-tab" class:active={activeTab === 'after'} 
            on:click={() => changeTab('after')}>
      After
    </button>
    <div class="tab-slider" class:slide-right={activeTab === 'after'}></div>
  </div>
  
  <div class="insight-impact-content" bind:this={contentContainer}>
    <div class="slides-container">
      <div class="insight-slide" class:active={activeTab === 'after'} bind:this={afterSlide}>
        {@html formatTextWithParagraphs(afterImpact)}
      </div>
      <div class="insight-slide" class:active={activeTab === 'before'} bind:this={beforeSlide}>
        {@html formatTextWithParagraphs(beforeImpact)}
      </div>
    </div>
  </div>
</div>

<style>
  .insight-impact-container {
    width: 100%;
    height: 100%;
    margin: 0;
    padding-bottom: 20px;
    display: flex;
    flex-direction: column;
    background-color: var(--dark-2);
    /* border: 1px solid var(--dark-100); */
  }
  
  .insight-impact-tabs {
    display: flex;
    position: relative;
    margin: 0 auto;
    margin-bottom: 1.5rem;
    justify-content: stretch;
    width: 100%;
    background-color: var(--dark-5);
  }
  
  .insight-tab {
    padding: 10px;
    background: none;
    border: none;
    cursor: pointer;
    font-size: 14px;
    color: var(--dark-60);
    transition: color 0.3s ease;
    position: relative;
    flex: 1;
    text-align: center;
    z-index: 2;
  }
  
  .insight-tab.active {
    color: var(--pure-white-100);
    font-weight: 500;
  }
  
  .tab-slider {
    position: absolute;
    height: 100%;
    width: 50%;
    background-color: var(--plum-100);
    border-radius: 2px;
    transition: transform 0.3s ease;
    z-index: 1;
  }
  
  .tab-slider.slide-right {
    transform: translateX(100%);
  }
  
  .insight-impact-content {
    position: relative;
    overflow: hidden;
    transition: height 0.3s ease;
  }
  
  .slides-container {
    position: relative;
    width: 200%;
    height: 100%;
    display: flex;
    transition: transform 0.4s ease;
    transform: translateX(0);
  }
  
  .slides-container:has(.insight-slide:nth-child(1).active) {
    transform: translateX(0);
  }
  
  .slides-container:has(.insight-slide:nth-child(2).active) {
    transform: translateX(-50%);
  }
  
  .insight-slide {
    flex: 1;
    min-width: 50%;
    opacity: 0.5;
    transition: opacity 0.4s ease;
    width: 100%;
  }
  
  .insight-slide.active {
    opacity: 1;
  }
  
  :global(.insight-slide p) {
    text-align: left;
    font-size: 15px;
    color: var(--dark-85);
    margin: 0 20px 1.5rem;
  }

  :global(.insight-slide p:last-child) {
    margin-bottom: 0;
  }
</style>