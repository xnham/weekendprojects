<script lang="ts">
  import { onMount } from 'svelte';
  
  // Accept currentPage as a prop
  export let currentPage = 'home';
  
  let isMenuOpen = false;
  let isDesktop = true;
  let isLogoHovered = false;
  
  const staticLogoSrc = '/images/eggs_ham.png';
  const animatedLogoSrc = '/images/eggs_ham_animated.gif';
  
  function toggleMenu() {
    isMenuOpen = !isMenuOpen;
  }
  
  function closeMenu() {
    isMenuOpen = false;
  }
  
  function handleKeyDown(event: KeyboardEvent) {
    if (event.key === 'Enter' || event.key === ' ') {
      toggleMenu();
    }
    if (event.key === 'Escape') {
      closeMenu();
    }
  }
  
  function checkScreenSize() {
    isDesktop = window.innerWidth > 768;
    if (isDesktop) closeMenu();
  }
  
  onMount(() => {
    checkScreenSize();
    window.addEventListener('resize', checkScreenSize);
    
    return () => {
      window.removeEventListener('resize', checkScreenSize);
    };
  });
</script>

<nav class="nav">
  <div class="nav-container">
    <div class="nav-logo">
      <a href="/">
        <img 
          src={isLogoHovered ? animatedLogoSrc : staticLogoSrc} 
          alt="xnham logo" 
          title="xnham"
          on:mouseenter={() => isLogoHovered = true}
          on:mouseleave={() => isLogoHovered = false}
        />
      </a>
    </div>
    
    <button 
      class="nav-hamburger" 
      class:active={isMenuOpen} 
      on:click={toggleMenu}
      on:keydown={handleKeyDown}
      aria-expanded={isMenuOpen}
      aria-label="Toggle navigation menu"
    >
      <span class="hamburger-line"></span>
      <span class="hamburger-line"></span>
      <span class="hamburger-line"></span>
    </button>
    
    <ul class="nav-links" class:active={isMenuOpen}>
      <li><a href="/" class:active={currentPage === 'home'} on:click={closeMenu}>Portfolio</a></li>
      <li><a href="/next" class:active={currentPage === 'next'} on:click={closeMenu}>Next</a></li>
      <li><a href="/writing" class:active={currentPage === 'writing'} on:click={closeMenu}>Writing</a></li>
      <li><a href="/about" class:active={currentPage === 'about'} on:click={closeMenu}>About</a></li>
    </ul>
  </div>
</nav>

<style>
  .nav {
    width: 100%;
    color: var(--pure-white-100);
    margin-bottom: 60px;
  }

  .nav-container {
    display: flex;
    justify-content: space-between;
    align-items: center;
  }

  /* Nav Logo */
  .nav-logo a {
    display: block;
    text-decoration: none;
    cursor: pointer;
  }

  .nav-logo img {
    height: 140px;
    width: auto;
    display: block;
    padding: 20px 0px 5px 20px;
  }

  /* Nav Links */
  .nav-links {
    list-style: none;
    display: flex;
    gap: 2.4rem;
    padding: 5px 40px 5px 40px;
    background-color: var(--dark-70);
  }

  .nav-links a {
    text-decoration: none;
    font-weight: 400;
    transition: opacity 0.2s ease;
    color: var(--pure-white-100);
    opacity: 0.8;
  }

  .nav-links a:hover, .nav-links a.active {
    opacity: 1;
  }
  
  /* Hamburger menu */
  .nav-hamburger {
    display: none;
    position: relative;
    cursor: pointer;
    margin-right: 5vw;
    z-index: 100;
    background: transparent;
    border: none;
    width: 36px;
    height: 36px;
    padding: 6px;
  }
  
  .hamburger-line {
    display: block;
    position: absolute;
    height: 3px;
    width: 30px;
    left: 3px;
    background-color: var(--dark-80);
    border-radius: 2px;
  }
  
  .hamburger-line:nth-child(1) {
    top: 8px;
  }
  
  .hamburger-line:nth-child(2) {
    top: 16px;
  }
  
  .hamburger-line:nth-child(3) {
    top: 24px;
  }

  /* Smaller desktop breakpoint */
  @media (max-width: 940px) {   
    .nav {
      margin-bottom: 20px;
    }
  }

  /* Mobile styles */
  @media (max-width: 768px) {
    .nav {
      margin-bottom: 20px;
    }

    .nav-logo img {
      padding: 20px 0px 5px 3vw;
    }

    .nav-hamburger {
      display: block; /* Ensure it's displayed */
    }
    
    .nav-links {
      position: fixed;
      top: 0;
      right: -100vw;
      height: 100vh;
      width: 100vw;
      padding: 120px 0 0 7vw; /* Moved top margin to padding to preserve full background */
      background-color: var(--dark-95);
      font-size: 24px;
      display: flex;
      flex-direction: column;
      align-items: flex-start;
      justify-content: flex-start;
      transition: right 0.3s ease;
      z-index: 90;
      gap: clamp(16px, 4vh, 24px);
    }

    .nav-links a {
      color: var(--pure-white-90);
      font-weight: 600;
      display: block;
      width: 85vw; /* Use viewport width instead of percentage */
      padding: 10px 0; /* Add vertical padding */
    }
    
    .nav-links.active {
      color: var(--pure-white-100);
      right: 0;
    }
    
    /* Hamburger animation */
    .nav-hamburger.active .hamburger-line {
      background-color: var(--pure-white-90);
    }
    
    .nav-hamburger.active .hamburger-line:nth-child(1) {
      transform: translateY(8px) rotate(45deg);
      top: 8px;
    }
    
    .nav-hamburger.active .hamburger-line:nth-child(2) {
      opacity: 0;
    }
    
    .nav-hamburger.active .hamburger-line:nth-child(3) {
      transform: translateY(-8px) rotate(-45deg);
      top: 24px;
    }
  }
</style>