<script lang="ts">
  import { onMount } from 'svelte';

  // Array of rotating texts (copied from your original implementation)
  const rotatingTexts = ['^Claude', '^Cursor', '^Replit', '^n8n', '^AutoGPT', '^Gumloop', '^VAPI'];
  let rotatingText = "";
  let currentIndex = 0;
  let rotatingTextElement: HTMLElement | null = null;

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
    if (rotatingTextElement) {
      rotatingTextElement.style.opacity = '0';
      
      setTimeout(() => {
        currentIndex = getRandomIndex(currentIndex, rotatingTexts.length);
        rotatingText = rotatingTexts[currentIndex];
        rotatingTextElement!.style.opacity = '1';
      }, 500);
    }
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
    <span class="title-part">Weekend</span> <span class="title-part">Projects</span><span class="rotating-text" bind:this={rotatingTextElement}>{rotatingText}</span>
  </h1>

  <div class="intro-wrapper">
    <div class="intro-text two-columns">
      <div class="column">
        <p>Building and maintaining software used to be expensive, which meant custom solutions were mainly accessible to large enterprises.</p>
        
        <p>That has changed. Now, pretty much anyone can create production-grade software using everyday language.* It's becoming completely normal for small businesses, families, and individuals to deploy bespoke software that's precisely tailored—even adaptive—to their needs.
        </p>

        <p>Weekend Projects is my exploration of this exciting era of software long tail. In 2024, empowered by Claude, Cursor, and other AI tools, I started building various pieces of 'software for one' to squash small yet pesky problems that were bugging me and my family.</p>
      </div>

      <div class="column">
        <p>Before the advent of these powerful AI assistants, owing to my disjointed coding skills, I would've had to hire a developer or toil for months to build each piece of software, which would have been a silly use of resources.</p>

        <p>It's really fun to see the economic forces now enabling, maybe even favoring, hyperpersonal software creation. I'm excited to share my take on it here.</p>

        <p>Btw, one of the things I built was a friendly voice robot called Mr. Benedict. If you have your own project in mind, how about <a href="/mr-benedict">giving it a call</a> to get some feedback?</p>

        <p class="asterisk-explanation">*Known as '<a href="https://en.wikipedia.org/wiki/Vibe_coding" target=_blank>vibe coding</a>,' a term Andrej Karpathy coined in February 2025.</p>
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
    opacity: 0;
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
  
  .asterisk-explanation {
    border-top: 1px solid var(--dark-100);
    margin-top: 20px;
    padding-top: 10px;
    font-size: 12px;
    text-align: right;
    line-height: 1.6;
  }
  
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
