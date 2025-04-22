<script lang="ts">
  export let beforeImpact: string = "Before impact description.";
  export let afterImpact: string = "After impact description.";
  
  // Track active tab - Svelte way
  let activeTab = 'before'; // Default to 'before'
  
  function changeTab(tabId: string) {
    activeTab = tabId;
  }
</script>

<div class="fun-impact-container">
  <div class="fun-impact-tabs">
    <button class="fun-tab" class:active={activeTab === 'before'} 
            on:click={() => changeTab('before')}>
      Before
    </button>
    <button class="fun-tab" class:active={activeTab === 'after'} 
            on:click={() => changeTab('after')}>
      After
    </button>
    <div class="tab-slider" class:slide-right={activeTab === 'after'}></div>
  </div>
  
  <div class="fun-impact-content">
    <div class="fun-slide" class:active={activeTab === 'before'}>
      <p>{beforeImpact}</p>
    </div>
    <div class="fun-slide" class:active={activeTab === 'after'}>
      <p>{afterImpact}</p>
    </div>
  </div>
</div>

<style>
  .fun-impact-container {
    width: 100%;
    height: 100%;
    margin: 0;
    padding-bottom: 20px;
    display: flex;
    flex-direction: column;
    border: 1px solid var(--dark-100);
  }
  
  .fun-impact-tabs {
    display: flex;
    position: relative;
    margin: 0 auto;
    margin-bottom: 1.5rem;
    justify-content: stretch;
    width: 100%;
    background-color: var(--dark-5);
  }
  
  .fun-tab {
    padding: 14px;
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
  
  .fun-tab.active {
    color: var(--pure-white-100);
    font-weight: 500;
  }
  
  .tab-slider {
    position: absolute;
    height: calc(100% - 10px);
    width: calc(50% - 5px);
    background-color: var(--dark-orange-100);
    top: 5px;
    left: 5px;
    border-radius: 2px;
    transition: transform 0.3s ease;
    z-index: 1;
  }
  
  .tab-slider.slide-right {
    transform: translateX(100%);
  }
  
  .fun-impact-content {
    position: relative;
    flex: 1;
    overflow: hidden;
  }
  
  .fun-slide {
    display: none;
    opacity: 0.5;
    transition: opacity 0.4s ease;
  }
  
  .fun-slide.active {
    display: block;
    opacity: 1;
  }
  
  .fun-slide p {
    text-align: center;
    font-size: 15px;
    color: var(--dark-85);
    margin: 0 40px 1.5rem;
  }
</style>