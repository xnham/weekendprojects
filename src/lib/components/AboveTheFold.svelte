<script lang="ts">
  import { onMount } from 'svelte';
  import { browser } from '$app/environment';

  // Array of rotating texts (copied from your original implementation)
  const rotatingTexts = ['∵ Claude', '∵ Cursor', '∵ Vapi'];
  // Set an initial value for server-side rendering
  let rotatingText = "^Cursor";
  let currentIndex = 0;
  let rotatingTextElement: HTMLElement | null = null;
  
  // Initialize with a default value for server-side rendering
  let yearPhrase = calculateYearPhrase();

  // Function to get random index different from current one
  function getRandomIndex(currentIndex: number, arrayLength: number): number {
    let newIndex;
    do {
      newIndex = Math.floor(Math.random() * arrayLength);
    } while (newIndex === currentIndex);
    return newIndex;
  }

  // Function to update rotating text with fade effect
  function updateRotatingText(): void {
    if (rotatingTextElement && browser) {
      rotatingTextElement.style.opacity = '0';
      
      setTimeout(() => {
        currentIndex = getRandomIndex(currentIndex, rotatingTexts.length);
        rotatingText = rotatingTexts[currentIndex];
        if (rotatingTextElement) {
          rotatingTextElement.style.opacity = '1';
        }
      }, 500);
    }
  }
  
  // Function to calculate just the year phrase
  function calculateYearPhrase(): string {
    const startYear = 2024; // The baseline year when it was "a year ago"
    const currentYear = new Date().getFullYear();
    const yearDiff = currentYear - startYear;
    
    if (yearDiff <= 0) return "recently"; // Changed to lowercase for better sentence integration
    if (yearDiff === 1) return "a year";
    
    // Convert number to word for 2-10 years
    const yearWords = ["two", "three", "four", "five", "six", "seven", "eight", "nine", "ten"];
    if (yearDiff >= 2 && yearDiff <= 10) {
      return `${yearWords[yearDiff-2]} years`;
    }
    
    // For 11+ years, use the number
    return `${yearDiff} years`;
  }

  onMount(() => {
    // Initial text update
    updateRotatingText();
    
    // Update text every 3 seconds
    const interval = setInterval(updateRotatingText, 3000);
    
    // Clean up interval on component unmount
    return () => clearInterval(interval);
  });
</script>

<header>
  <h1 class="title">
    <span class="title-part">Software</span> <span class="title-part">for One </span><span class="rotating-text" bind:this={rotatingTextElement}>{rotatingText}</span>
  </h1>

  <div class="intro-wrapper">
    <div class="intro-text two-columns">
      <div class="column">
        <p>Building and maintaining software used to be expensive, which meant custom solutions were mainly accessible to large enterprises. That has changed. Now, pretty much anyone can learn to create production-grade software using everyday language.
        </p>
          
        <p>It's becoming completely normal for small businesses, families, and individuals to deploy bespoke software that's precisely tailored—even adaptive—to their needs.
        </p>

        <p>Through Weekend Projects, I hope to gain a deeper understanding of this exciting era of the software long tail. About {yearPhrase} ago, empowered by Claude, Cursor, and other AI tools, I started building various pieces of 'software for one' to squash small yet pesky problems that were bugging me and my family.</p>
      </div>

      <div class="column">
        <p>Before these powerful AI helpers came along, owing to my disjointed coding skills, I would've had to hire a developer or toil for months to build each piece of software, which would have been a silly use of resources.</p>

        <p>I'm curious: Have the economic forces now enabled, maybe even favored, hyperpersonal software creation? Can someone with my patchy technical background build software that's actually worth using?</p>

        <p>Btw, one of the things I made was an AI voice agent called Sunny, designed to help spark project ideas. If you'd love to streamline some aspects of your life, or just see what talking to a robot is like, 
          <a href="/sunny?from=/" data-sunny-link>how about giving Sunny a call</a>?
        </p>

      </div>
    </div>
  </div>
  <div class="divider"></div>
</header>

<style>
  .title {
    font-size: 76px;
    margin-bottom: 60px;
    text-align: left;
    line-height: 1.1;
  }
  
  .rotating-text {
    color: var(--purple-100);
    position: relative;
    opacity: 1; /* Make it visible by default for server rendering */
    transition: opacity 0.5s ease;
  }

  .intro-wrapper {
    width: 100%;
  }

  .intro-text p {
    margin-bottom: 1.5rem;
  }

  /* Multi-column layout for intro text */
  .intro-text.two-columns {
    display: flex;
    gap: 2rem;
  }

  .intro-text.two-columns .column {
    flex: 1;
  }
  
  /*
  .asterisk-explanation {
    border-top: 1px solid var(--dark-100);
    margin-top: 20px;
    padding-top: 10px;
    font-size: 12px;
    text-align: right;
    line-height: 1.6;
  }
  */
  
  /* Small desktop breakpoint */
  @media (max-width: 1200px) {    
    .title {
      font-size: min(7vw, 72px);
      margin-bottom: 40px;
      line-height: 1.1;
    }
    
    .intro-text.two-columns {
      gap: 1.5rem;
    }
  }
  
  /* Tablet breakpoint */
  @media (max-width: 768px) {
    .intro-text.two-columns {
      flex-direction: column;
      gap: 0;
    }
    
    .title {
      font-size: max(8vw, 60px);
      margin-bottom: 40px;
    }
    
    .title-part {
      display: block;
    }
    
    .title-part:nth-child(2) {
      display: block;
    }
    
    .rotating-text {
      display: block;
    }
  }
  
  /* Mobile breakpoint */
  @media (max-width: 576px) {
    .title {
      font-size: max(12vw, 30px);
      margin-bottom: 30px;
    }
    
    .intro-text p {
      margin-bottom: 1.2rem;
    }
  }
</style>
