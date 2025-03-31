<script lang="ts">
  import { onMount, afterUpdate } from 'svelte';
  
  export let daily: number = 0;
  export let weekly: number = 0;
  export let launchDate: Date | null = new Date('1900-01-01');
  export let alternativeUses: string[] = [];
  
  let dollarsElement: HTMLElement | null = null;
  let centsElement: HTMLElement | null = null;
  let currentUseIndex = 0;
  let isAnimating = false;
  let rotatingWrapper: HTMLElement | null = null;
  
  // Track active tab - Svelte way
  let activeTab = 'money-saved-so-far'; // Default tab
  
  onMount(() => {
    // Initialize counter and rotating text immediately
    initMoneyCounter();
    initRotatingUseText();
  });
  
  function changeTab(tabId: string) {
    activeTab = tabId;
  }
  
  function initMoneyCounter() {
    // Calculate money saved (dollars per day or per week)
    const dollarsPerDay = daily || 0;
    const dollarsPerWeek = weekly || 0;
    
    // Convert to dollars per day
    const dailyDollars = dollarsPerDay + (dollarsPerWeek / 7);
    
    // Calculate dollars saved since launch
    const now = new Date();
    const startDate = new Date(launchDate || new Date('1900-01-01'));
    const daysSinceLaunch = Math.max(0, (now.getTime() - startDate.getTime()) / (1000 * 60 * 60 * 24));
    let dollarsSaved = dailyDollars * daysSinceLaunch;
    
    // Initialize counter
    updateCounter(dollarsSaved);
    
    // Calculate increment per 10ms for smoother animation
    const incrementPer10ms = dailyDollars / (24 * 60 * 60 * 100); // Daily dollars / (seconds in day * 100)
    
    // Update counter more frequently for smoother animation
    setInterval(() => {
      dollarsSaved += incrementPer10ms;
      updateCounter(dollarsSaved);
    }, 10);
  }
  
  function updateCounter(totalAmount: number) {
    if (!dollarsElement || !centsElement) return;
    
    // For money counter, adjust as needed for your specific implementation
    const dollars = Math.floor(totalAmount);
    
    // Calculate cents with 5 decimal places
    const fractionalPart = totalAmount - dollars;
    const centsWithPrecision = Math.round(fractionalPart * 100000);
    
    // Update the DOM elements
    dollarsElement.textContent = dollars.toLocaleString();
    centsElement.textContent = centsWithPrecision.toString().padStart(5, '0');
  }
  
  // Improved rotating text function
  function initRotatingUseText() {
    if (!alternativeUses || alternativeUses.length <= 1) {
      console.warn("Not enough alternative uses to rotate");
      return;
    }
    
    // Rotate text every 3 seconds
    const rotationInterval = setInterval(() => {
      if (isAnimating) return;
      
      isAnimating = true;
      
      // Create a natural delay before changing
      setTimeout(() => {
        // Update text index
        currentUseIndex = (currentUseIndex + 1) % alternativeUses.length;
        
        // Reset animation flag
        setTimeout(() => {
          isAnimating = false;
        }, 500);
      }, 400);
    }, 3000);
    
    // Clean up interval on component destruction
    return () => {
      clearInterval(rotationInterval);
    };
  }
  
  function calculateAnnualMoneySaved() {
    // Calculate annual money saved
    const dollarsPerDay = daily || 0;
    const dollarsPerWeek = weekly || 0;
    
    const annualDollars = (dollarsPerDay * 365) + (dollarsPerWeek * 52);
    
    // Format as "$8,161.00" with two decimal places
    return `$${annualDollars.toLocaleString(undefined, {minimumFractionDigits: 2, maximumFractionDigits: 2})}`;
  }
  
  function formatDate(date: Date | null): string {
    try {
      if (!date) {
        return "January 1, 1900";
      }
      const options: Intl.DateTimeFormatOptions = { 
        month: 'long', 
        day: 'numeric', 
        year: 'numeric' 
      };
      return date.toLocaleDateString('en-US', options);
    } catch (e) {
      console.error("Error formatting date:", e);
      return "January 1, 1900";
    }
  }
  
  // Add a helper function to get the annual amount as a number
  function calculateAnnualAmount() {
    const dollarsPerDay = daily || 0;
    const dollarsPerWeek = weekly || 0;
    return (dollarsPerDay * 365) + (dollarsPerWeek * 52);
  }
</script>

<div class="money-calculator-container">
  <div class="money-calculator-tabs">
    <button class="money-tab" class:active={activeTab === 'money-saved-so-far'} 
            on:click={() => changeTab('money-saved-so-far')}>
      Money saved so far
    </button>
    <button class="money-tab" class:active={activeTab === 'money-saved-per-year'} 
            on:click={() => changeTab('money-saved-per-year')}>
      Money saved per year
    </button>
    <div class="tab-slider" class:slide-right={activeTab === 'money-saved-per-year'}></div>
  </div>
  
  <div class="money-calculator-content">
    <div class="slides-container">
      <div class="money-calculator-slide" class:active={activeTab === 'money-saved-per-year'} id="money-saved-per-year">
        <div class="money-calculator-slide-content">
          <div class="money-counter">
            <table class="money-counter-table">
              <tbody>
                <tr class="money-counter-values">
                  <td><span class="dollar-sign">$</span><span class="dollars">{Math.floor(calculateAnnualAmount()).toLocaleString()}</span></td>
                  <td class="money-counter-separator">.</td>
                  <td><span class="cents">{((calculateAnnualAmount() % 1) * 100).toFixed(0).padStart(2, '0')}</span></td>
                </tr>
              </tbody>
            </table>
          </div>
          <div class="money-alternative-use">
            One could use this money to
            <div class="rotating-use-text-wrapper" bind:this={rotatingWrapper}>
              {#key currentUseIndex}
                <span class="rotating-use-text">
                  {alternativeUses.length > 0 ? alternativeUses[currentUseIndex] : "a high-end laptop"}
                </span>
              {/key}
            </div>
          </div>
        </div>
      </div>
      
      <div class="money-calculator-slide" class:active={activeTab === 'money-saved-so-far'} id="money-saved-so-far">
        <div class="money-calculator-slide-content">
          <div class="money-counter">
            <table class="money-counter-table">
              <tbody>
                <tr class="money-counter-values">
                  <td><span class="dollar-sign">$</span><span bind:this={dollarsElement} class="dollars">0</span></td>
                  <td class="money-counter-separator">.</td>
                  <td><span bind:this={centsElement} class="cents">00</span></td>
                </tr>
              </tbody>
            </table>
          </div>
          <div class="money-launch-date">since launch on {formatDate(launchDate)}</div>
        </div>
      </div>
    </div>
  </div>
</div>

<style>
  /* Money calculator container */
  .money-calculator-container {
    width: 100%;
    height: 100%;
    margin: 0;
    padding-bottom: 20px;
    display: flex;
    flex-direction: column;
    border: 1px solid var(--dark-100);
  }
  
  /* Tabs styling */
  .money-calculator-tabs {
    display: flex;
    position: relative;
    margin: 0 auto;
    margin-bottom: 1.5rem;
    justify-content: stretch;
    width: 100%;
    background-color: var(--dark-5);
  }
  
  .money-tab {
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
    z-index: 2; /* Place above the slider */
  }
  
  .money-tab.active {
    color: var(--pure-white-100);
    font-weight: 500;
  }
  
  /* Tab slider for smooth transition */
  .tab-slider {
    position: absolute;
    height: calc(100% - 10px);
    width: calc(50% - 5px);
    background-color: var(--purple-100);
    top: 5px;
    left: 5px;
    border-radius: 2px;
    transition: transform 0.3s ease;
    z-index: 1;
  }
  
  .tab-slider.slide-right {
    transform: translateX(100%);
  }
  
  /* Slides styling */
  .money-calculator-content {
    position: relative;
    flex: 1;
    overflow: hidden;
    margin-top: 0;
  }
  
  .slides-container {
    position: relative;
    width: 200%;
    height: 100%;
    display: flex;
    transition: transform 0.4s ease;
    transform: translateX(0);
  }
  
  .slides-container:has(.money-calculator-slide:nth-child(2).active) {
    transform: translateX(-50%);
  }
  
  .money-calculator-slide {
    flex: 1;
    height: 100%;
    min-width: 50%;
    display: flex;
    flex-direction: column;
    justify-content: center;
    opacity: 0.5;
    transition: opacity 0.4s ease;
  }
  
  .money-calculator-slide.active {
    opacity: 1;
  }
  
  .money-calculator-slide-content {
    width: 100%;
    display: flex;
    flex-direction: column;
    justify-content: center;
    align-items: center;
    transform: translateY(-10px);
  }
  
  /* Annual value styling */
  
  .money-alternative-use {
    text-align: center;
    font-size: 12px;
    color: var(--dark-60);
    display: flex;
    flex-direction: column;
    align-items: center;
  }
  
  .rotating-use-text-wrapper {
    overflow: hidden;
    position: relative;
  }
  
  .rotating-use-text {
    display: inline-block;
    font-size: 12px;
    color: var(--dark-60);
    animation: fadeIn 0.4s forwards;
  }
  
  .money-counter {
    font-size: 20px;
    font-weight: 600;
    color: var(--dark-100);
    margin-bottom: 10px;
    text-align: center;
  }
  
  .money-counter-table {
    border-collapse: collapse;
    margin: 0 auto;
    table-layout: fixed;
  }
  
  .money-counter-values td {
    text-align: center;
  }
  
  .money-counter-values td:last-child {
    text-align: left;
  }
  
  .money-counter-separator {
    text-align: center;
    width: 10px !important;
    min-width: 10px !important;
    padding: 0;
  }
  
  .dollar-sign {
    font-size: 20px;
    margin-right: 2px;
  }
  
  .dollars {
    font-size: 28px;
    font-weight: 600;
  }
  
  .cents {
    font-size: 18px;
  }
  
  .money-launch-date {
    font-size: 12px;
    color: var(--dark-60);
    text-align: center;
    margin-top: 10px;
  }
  
  /* ===== RESPONSIVE DESIGN ===== */
  /* ===== SMALL DESKTOP BREAKPOINT (max-width: 900px) ===== */
  @media (max-width: 900px) {
    .dollars {
      font-size: 24px;
    }

    .cents {
      font-size: 16px;
    }

    /* ===== TABLET BREAKPOINT (max-width: 768px) ===== */
    @media (max-width: 768px) {
      .money-tab {
        font-size: 13px;
      }

      .money-calculator-content {
        margin-top: 20px;
      }
    }

    /* ===== MOBILE BREAKPOINT (max-width: 576px) ===== */
    @media (max-width: 576px) {
      .money-calculator-content {
        margin-top: 10px;
      }
    }
  }
</style>
