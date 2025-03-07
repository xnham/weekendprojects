<script>
  import { onMount } from 'svelte';

  // Array of rotating texts (copied from your original implementation)
  const rotatingTexts = ['^Claude', '^Cursor', '^Replit', '^n8n', '^AutoGPT', '^Gumloop', '^VAPI'];
  let rotatingText = "";
  let currentIndex = 0;
  let rotatingTextElement;

  // Function to get random index different from current one
  function getRandomIndex(currentIndex, arrayLength) {
    let newIndex;
    do {
      newIndex = Math.floor(Math.random() * arrayLength);
    } while (newIndex === currentIndex);
    return newIndex;
  }

  // Function to update rotating text with fade effect
  function updateRotatingText() {
    if (rotatingTextElement) {
      rotatingTextElement.style.opacity = '0';
      
      setTimeout(() => {
        currentIndex = getRandomIndex(currentIndex, rotatingTexts.length);
        rotatingText = rotatingTexts[currentIndex];
        rotatingTextElement.style.opacity = '1';
      }, 500);
    }
  }

  onMount(() => {
    // Get reference to rotating text element
    rotatingTextElement = document.querySelector('.rotating-text');
    
    // Initial text update
    updateRotatingText();
    
    // Update text every 3 seconds
    const interval = setInterval(updateRotatingText, 3000);
    
    // Clean up interval on component unmount
    return () => clearInterval(interval);
  });
</script>

<header>
  <div class="container">
    <h1 class="title">
      Weekend Projects<span class="rotating-text" bind:this={rotatingTextElement}>{rotatingText}</span>
    </h1>

    <div class="intro-wrapper">
      <div class="intro-text two-columns">
        <div class="column">
          <p>Building and maintaining software used to be expensive, which meant custom solutions were mainly accessible to large enterprises. That's changing fast. Soon, anyone will be able to create production-grade software using everyday language. It will become completely normal for small businesses, families, and even individuals to deploy bespoke software that's precisely tailored—even adaptive—to their needs.</p>

          <p>We are entering the era of the software long tail, and Weekend Projects is my personal exploration of this future.</p>

          <p>In 2024, empowered by Claude, Cursor, and other AI tools, I started building software to squash various small yet pesky problems that were bugging me and my family.</p>
        </div>

        <div class="column">
          <p>Before the advent of these powerful AI assistants, owing to my meager coding skills, I would've had to hire a developer to build "software for one," which would have been a silly use of resources.</p>

          <p>What great fun it is to see that the economic forces are now enabling, even favoring, hyperpersonal software creation. This ushers us into truly human-centric design, where technology molds to our natural behavior, not the other way around.</p>

          <p>I hope you enjoy browsing through my weekend projects <span class="blink">↓</span></p>
          
          <p>Have a project in mind? I encourage you to discuss it with my empathetic robot, <a href="/mr-benedict">Mr. Benedict</a>.</p>
        </div>
      </div>
    </div>
    <div class="divider"></div>
  </div>
</header>

<style>
  
  .title {
    font-size: 78px;
    margin-bottom: 60px;
    text-align: left;
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
  
  /* Mobile responsiveness */
  @media (max-width: 768px) {
    .intro-text.two-columns {
      flex-direction: column;
      gap: 1rem;
    }
    
    .title {
      font-size: 48px;
    }
  }
</style>
