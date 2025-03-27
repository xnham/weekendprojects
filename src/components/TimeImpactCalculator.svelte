<script lang="ts">
  import { onMount, afterUpdate } from 'svelte';
  
  export let daily: number = 0;
  export let weekly: number = 0;
  export let launchDate: Date | null = new Date('1900-01-01'); // Changed to Jan 1, 1900
  export let alternativeUses: string[] = [];
  
  let hoursElement: HTMLElement | null = null;
  let minutesElement: HTMLElement | null = null;
  let secondsElement: HTMLElement | null = null;
  let currentUseIndex = 0;
  let isAnimating = false;
  let rotatingWrapper: HTMLElement | null = null;
  
  // Track active tab - Svelte way
  let activeTab = 'time-saved-so-far'; // Default to time-saved-so-far to match screenshot
  
  onMount(() => {
    console.log("TimeImpactCalculator mounted with launch date:", launchDate);
    // Initialize counter and rotating text immediately
    initTimeCounter();
    initRotatingUseText();
  });
  
  function changeTab(tabId: string) {
    activeTab = tabId;
  }
  
  function initTimeCounter() {
    // Calculate time saved (minutes per day or per week)
    const minutesPerDay = daily || 0;
    const minutesPerWeek = weekly || 0;
    
    // Convert to minutes per day
    const dailyMinutes = minutesPerDay + (minutesPerWeek / 7);
    
    // Calculate minutes saved since launch
    const now = new Date();
    // Use Jan 1, 1900 as the fallback date
    const launchDateObj = launchDate || new Date('1900-01-01');
    
    console.log("Using launch date:", launchDateObj);
    
    const daysSinceLaunch = (now.getTime() - launchDateObj.getTime()) / (1000 * 60 * 60 * 24);
    let minutesSaved = dailyMinutes * daysSinceLaunch;
    
    console.log("Minutes saved calculation:", { dailyMinutes, daysSinceLaunch, minutesSaved });
    
    // Don't initialize counter immediately - elements might not be bound yet
    if (hoursElement && minutesElement && secondsElement) {
      updateCounter(minutesSaved);
    } else {
      console.warn("Counter elements not found during initialization");
    }
    
    // Calculate increment per 10ms for smoother animation
    const incrementPer10ms = dailyMinutes / (24 * 60 * 60 * 100);
    
    // Update counter more frequently for smoother animation
    setInterval(() => {
      minutesSaved += incrementPer10ms;
      updateCounter(minutesSaved);
    }, 10);
  }
  
  function updateCounter(totalMinutes: number) {
    if (!hoursElement || !minutesElement || !secondsElement) return;
    
    // Calculate hours, minutes and seconds
    const hours = Math.floor(totalMinutes / 60);
    const remainingMinutes = totalMinutes % 60;
    const minutes = Math.floor(remainingMinutes);
    // Calculate seconds with 3 decimal precision
    const seconds = (remainingMinutes - minutes) * 60;
    
    // Update the DOM elements
    hoursElement.textContent = hours.toString();
    // Add leading zero to minutes if needed
    minutesElement.textContent = minutes < 10 ? `0${minutes}` : `${minutes}`;
    // Format seconds with exactly 3 decimal places
    secondsElement.textContent = seconds.toFixed(3);
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
  
  function calculateAnnualTimeSaved() {
    // Calculate annual time saved in hours
    const minutesPerDay = daily || 0;
    const minutesPerWeek = weekly || 0;
    
    const annualMinutes = (minutesPerDay * 365) + (minutesPerWeek * 52);
    const annualHours = annualMinutes / 60;
    
    // Format as "91 hours = 11.4 workdays" with 1 decimal point
    const workdays = (annualHours / 8).toFixed(1);
    return `${Math.round(annualHours)} hours or ${workdays} workdays`;
  }
  
  function formatDate(date: Date | null): string {
    try {
      if (!date) {
        return "January 1, 1900"; // Changed to Jan 1, 1900
      }
      const options: Intl.DateTimeFormatOptions = { 
        month: 'long', 
        day: 'numeric', 
        year: 'numeric' 
      };
      return date.toLocaleDateString('en-US', options);
    } catch (e) {
      console.error("Error formatting date:", e);
      return "January 1, 1900"; // Changed to Jan 1, 1900
    }
  }
  
  // Add afterUpdate hook to ensure elements are bound before using them
  afterUpdate(() => {
    // If elements are now available but counter wasn't initialized properly before
    if (hoursElement && minutesElement && secondsElement) {
      // Re-initialize if needed
      if (hoursElement.textContent === "0" && minutesElement.textContent === "00") {
        console.log("Reinitializing counter with bound elements");
        initTimeCounter();
      }
    }
  });
</script>

<div class="time-calculator-container">
  <div class="time-calculator-tabs">
    <button class="time-tab" class:active={activeTab === 'time-saved-so-far'} 
            on:click={() => changeTab('time-saved-so-far')}>
      Time saved so far
    </button>
    <button class="time-tab" class:active={activeTab === 'time-saved-per-year'} 
            on:click={() => changeTab('time-saved-per-year')}>
      Time saved per year
    </button>
    <div class="tab-slider" class:slide-right={activeTab === 'time-saved-per-year'}></div>
  </div>
  
  <div class="time-calculator-content">
    <div class="slides-container">
      <div class="time-calculator-slide" class:active={activeTab === 'time-saved-per-year'} id="time-saved-per-year">
        <div class="time-calculator-slide-content">
          <div class="time-annual-value">{calculateAnnualTimeSaved()}</div>
          <div class="time-alternative-use">
            One could use this time to
            <div class="rotating-use-text-wrapper" bind:this={rotatingWrapper}>
              {#key currentUseIndex}
                <span class="rotating-use-text">
                  {alternativeUses.length > 0 ? alternativeUses[currentUseIndex] : "hike 220 miles"}
                </span>
              {/key}
            </div>
          </div>
        </div>
      </div>
      
      <div class="time-calculator-slide" class:active={activeTab === 'time-saved-so-far'} id="time-saved-so-far">
        <div class="time-calculator-slide-content">
          <div class="time-counter">
            <table class="time-counter-table">
              <tbody>
                <tr class="time-counter-values">
                  <td><span bind:this={hoursElement} class="hours">0</span></td>
                  <td class="time-counter-separator">:</td>
                  <td><span bind:this={minutesElement} class="minutes">00</span></td>
                  <td class="time-counter-separator">:</td>
                  <td><span bind:this={secondsElement} class="seconds">00</span></td>
                </tr>
                <tr class="time-counter-labels">
                  <td>hrs</td>
                  <td class="time-counter-separator"></td>
                  <td>mins</td>
                  <td class="time-counter-separator"></td>
                  <td>secs</td>
                </tr>
              </tbody>
            </table>
          </div>
          <div class="time-launch-date">since launch on {formatDate(launchDate)}</div>
        </div>
      </div>
    </div>
  </div>
</div>

<style>
  /* Time calculator container */
  .time-calculator-container {
    width: 80%;
    height: 200px;
    margin: 10px 0;
    display: flex;
    flex-direction: column;
    border: 1px solid var(--dark-100);
  }
  
  /* Tabs styling */
  .time-calculator-tabs {
    display: flex;
    position: relative;
    margin: 0 auto;
    margin-bottom: 1.5rem;
    justify-content: stretch;
    width: 100%;
    background-color: var(--dark-5);
  }
  
  .time-tab {
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
  
  .time-tab.active {
    color: var(--dark-100);
    font-weight: 500;
  }
  
  /* Tab slider for smooth transition */
  .tab-slider {
    position: absolute;
    height: calc(100% - 10px);
    width: calc(50% - 10px);
    background-color: var(--yellow-100);
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
  .time-calculator-content {
    position: relative;
    flex: 1;
    overflow: hidden;
  }
  
  .slides-container {
    position: relative;
    width: 200%;
    height: 100%;
    display: flex;
    transition: transform 0.4s ease;
    transform: translateX(0);
  }
  
  .slides-container:has(.time-calculator-slide:nth-child(2).active) {
    transform: translateX(-50%);
  }
  
  .time-calculator-slide {
    flex: 1;
    height: 100%;
    min-width: 50%;
    display: flex;
    flex-direction: column;
    justify-content: center;
    opacity: 0.5;
    transition: opacity 0.4s ease;
  }
  
  .time-calculator-slide.active {
    opacity: 1;
  }
  
  .time-calculator-slide-content {
    width: 100%;
    display: flex;
    flex-direction: column;
    justify-content: center;
    margin-top: -10px;
  }
  
  /* Annual value styling */
  .time-annual-value {
    text-align: center;
    font-size: 24px;
    font-weight: 600;
    margin-bottom: 20px;
  }
  
  .time-alternative-use {
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
  
  .time-counter {
    font-size: 24px;
    font-weight: 600;
    color: var(--dark-100);
    margin-bottom: 10px;
    text-align: center;
  }
  
  .time-counter-table {
    border-collapse: collapse;
    margin: 0 auto;
    table-layout: fixed;
  }
  
  /* Apply to both rows with td elements */
  .time-counter-values td,
  .time-counter-labels td {
    text-align: center;
    min-width: 50px;
  }
  
  /* Target seconds column specifically */
  .time-counter-values td:nth-child(5),
  .time-counter-labels td:nth-child(5) {
    width: 100px !important;
  }
  
  /* Make separators narrow in both rows */
  .time-counter-values td.time-counter-separator,
  .time-counter-labels td.time-counter-separator {
    text-align: center;
    width: 10px !important;
    min-width: 10px !important;
    padding: 0;
  }
  
  .time-counter-labels {
    font-size: 12px;
    color: var(--dark-60);
    letter-spacing: 0.5px;
    font-weight: 400;
    padding-top: 0px;
    line-height: 1;
  }
  
  .time-launch-date {
    font-size: 12px;
    color: var(--dark-60);
    text-align: center;
    margin-top: 20px;
  }
  
  /* Animation keyframes */
  @keyframes fadeIn {
    0% { opacity: 0; transform: translateY(-10px); }
    100% { opacity: 1; transform: translateY(0); }
  }
  
  @keyframes slideOutDown {
    0% { transform: translateY(0); opacity: 1; }
    100% { transform: translateY(30px); opacity: 0; }
  }
  
  @keyframes slideInDown {
    0% { transform: translateY(-30px); opacity: 0; }
    100% { transform: translateY(0); opacity: 1; }
  }
  
  /* Responsive styles */
  @media (max-width: 768px) {
    .time-calculator-container {
      width: 100%; /* Full width on tablet and smaller screens */
    }
  }
</style>
